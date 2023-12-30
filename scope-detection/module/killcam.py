import numpy as np
import cv2
from utils import image_process
from utils import image_function
from typing import Sequence, Any


def bounding_box_detect(image: np.ndarray) -> Sequence[np.ndarray]:
    """
    Find contours in the input image and return the list of contours.
    """
    contours: Sequence[np.ndarray]
    contours, _ = cv2.findContours(image, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    return contours


def in_area_range(width: int, height: int, min_area: int, max_area: int) -> bool:
    """
    Check if the area (width * height) is within the specified range.
    """
    area = width * height
    return min_area < area < max_area


def in_aspect_ratio_range(
    width: int, height: int, aspect_ratio: float, least_difference: float
) -> bool:
    """
    Check if the aspect ratio (height / width) is within the specified range.
    """
    calculated_aspect_ratio = height / width
    return abs(calculated_aspect_ratio - aspect_ratio) < least_difference


def detect_rectangle(frame: np.ndarray) -> Sequence[np.ndarray]:
    """
    Process a frame by applying various image processing techniques and detects rectangular objects, possibly representing kill-cam frames, based on contours.

    Parameters:
    - frame (np.ndarray): The input frame (color-image) to be processed.

    Returns:
    list: A list containing information about the detected rectangular kill-cam objects. Each element in the list represents a detected rectangle and includes information such as coordinates, dimensions, etc.
    """

    # Convert the frame to grayscale
    image: np.ndarray = image_process.color2gray(frame)

    # Apply histogram equalization if the average intensity is below 30
    image = image_process.histogram_equalization_condition(
        image, on_average_intensity=30
    )

    # Clip pixel intensities to the range [30, 250]
    image = image_process.clip_pixel_intensities(
        image, min_intensity=30, max_intensity=250
    )

    # Apply Canny edge detection with specified thresholds (60, 100)
    image = image_process.edge_detection(image, lower_threshold=60, upper_threshold=100)

    # Find contours in the edge-detected image
    contours: Sequence[np.ndarray] = bounding_box_detect(image)

    return contours


def extract_relevant_rectangle(
    contours: Sequence[np.ndarray],
    center: np.ndarray,
    radius: float,
    min_contour_area: int = 500 * 200,
    max_contour_area: int = 600 * 400,
    aspect_ratio: float = 0.4,
    least_difference: float = 0.05,
) -> bool:
    """
    Selecting relevant rectangle of kill-cam frame based on contours.

    Parameters:
    - contours (np.ndarray): List of contours detected in the image.
    - center (np.ndarray): The center point of the screen in (col, row) format, where (col, row) == (x, y).
    - radius (float): Radius at which the rectangle's center is considered relevant.
    - min_contour_area (int): Minimum contour area for filtering contours.
    - max_contour_area (int): Maximum contour area for filtering contours.
    - aspect_ratio (float): Target aspect ratio for filtering contours.
    - least_difference (float): Allowed difference from the target aspect ratio for filtering contours.

    Returns:
    bool: Returns True if a relevant rectangle is found; otherwise, returns False.
    """

    # Iterate through each contour
    contour: np.ndarray
    for contour in contours:
        # Extract bounding box coordinates (x, y, width, height)
        x: int
        y: int
        w: int
        h: int
        x, y, w, h = cv2.boundingRect(contour)

        # Check if the contour meets area, aspect ratio, and center conditions
        if (
            in_area_range(w, h, min_contour_area, max_contour_area)
            and in_aspect_ratio_range(w, h, aspect_ratio, least_difference)
            and image_function.is_center(x + w // 2, y + h // 2, center, radius)
        ):
            # Relevant Contour Found
            return True

    # No Relevant Contour Found
    return False


def detect_kill_cam(frame: np.ndarray, center: np.ndarray, radius: float) -> bool:
    """
    Detects whether a kill-cam frame is present in the given image frame.

    Parameters:
    - frame (np.ndarray): The input frame (image) to be analyzed.
    - center (np.ndarray): The center point of the screen in (col, row) format, where (col, row) == (x, y).
    - radius (float): Radius at which the rectangle's center is considered relevant.

    Returns:
    bool: Returns True if a relevant rectangle, possibly representing a kill-cam frame, is found; otherwise, returns False.
    """
    # Obtain contours using image processing techniques
    contours: Sequence[Any] = detect_rectangle(frame=frame)

    # Check if a relevant rectangle is present in the frame
    return extract_relevant_rectangle(contours=contours, center=center, radius=radius)


def get_kill_cam_time(
    frames: np.ndarray,
    fps: int,
    kill_cam_length: float = 6.0,
    time_upper_threshold: float = 0.7,
    time_lower_threshold: float = 0.5,
) -> tuple | None:
    """
    Detects the time range in which a kill-cam sequence occurs in a series of frames.

    Parameters:
    - frames (np.ndarray): A sequence of frames to analyze for the presence of a kill-cam sequence.
    - fps (int): Frames per second, indicating the frame rate of the input frames.
    - kill_cam_length (int): Expected duration of the kill-cam sequence in seconds.
    - time_upper_threshold (float): Upper threshold for the allowed duration variation from the expected kill-cam length.
    - time_lower_threshold (float): Lower threshold for the allowed duration variation from the expected kill-cam length.

    Returns:
    Union[None, Tuple[int, int]]: Returns a tuple containing the start and end indices of the detected kill-cam sequence within the frames.
    If no kill-cam sequence is found or the duration is outside the specified thresholds, returns None.
    """

    # Get the center coordinates of the image with a vertical padding of -10 pixels
    center: np.ndarray = image_function.get_center(frames[0], y_padding=-10)

    # Calculate the radius based on the y-axis and 10% of the image height
    radius: float = image_function.get_radius(center, x_or_y="y", percentage=15)

    # Initialize variables to keep track of the indices for the start and end of the kill-cam sequence,
    # and flags for forward and backward propagation through the frames.
    start_idx: int
    end_idx: int
    fwd_propagation: bool = False
    bck_propagation: bool = False

    # Iterate through the frames in both forward and backward directions simultaneously.
    i: int
    for i in range(len(frames)):
        j: int = (len(frames) - 1) - i

        # Check if forward propagation has not been triggered yet.
        if not fwd_propagation:
            fwd_propagation = detect_kill_cam(
                frame=frames[i], center=center, radius=radius
            )
            start_idx = i

        # Check if backward propagation has not been triggered yet.
        if not bck_propagation:
            bck_propagation = detect_kill_cam(
                frame=frames[j], center=center, radius=radius
            )
            end_idx = j

        # If both forward and backward propagation have been triggered, exit the loop.
        if fwd_propagation and bck_propagation:
            break
    else:
        # If the loop completes without breaking, it means no kill-cam sequence was found.
        # Return None to indicate that no kill-cam was detected.
        return None

    # Calculate the time duration of the detected kill-cam sequence.
    delta_time: float = (end_idx - start_idx) / fps

    # Define lower and upper time thresholds for the kill-cam sequence duration.
    lower_time: float = kill_cam_length - time_lower_threshold
    upper_time: float = kill_cam_length + time_upper_threshold

    # Check if the detected kill-cam duration is within the specified time range.
    if not (lower_time < delta_time < upper_time):
        # If not within the time range, return None to indicate that the kill-cam is not in the expected duration.
        return None

    # Return the tuple containing the start and end indices of the detected kill-cam sequence.
    return (start_idx, end_idx)
