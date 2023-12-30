import numpy as np
import cv2

def color2gray(image: np.ndarray) -> np.ndarray:
    """
    Convert the input color BGR image to grayscale.

    Parameters:
    - image (numpy.ndarray): The input color image in BGR format.

    Returns:
    numpy.ndarray: The grayscale image.
    """
    return cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

def hsv2color(image: np.ndarray) -> np.ndarray:
    """
    Convert the input HSV image to color BGR.

    Parameters:
    - image (numpy.ndarray): The input image in HSV format.

    Returns:
    numpy.ndarray: The color image in BGR format.
    """
    return cv2.cvtColor(image, cv2.COLOR_HSV2BGR)

def clip_pixel_intensities(image: np.ndarray, min_intensity: int = 30, max_intensity: int = 250) -> np.ndarray:
    """
    Clip pixel intensities of the input image within the specified range.

    Parameters:
    - image (numpy.ndarray): The input image.
    - min_intensity (int): The minimum intensity value to clip. Default is 30.
    - max_intensity (int): The maximum intensity value to clip. Default is 250.

    Returns:
    numpy.ndarray: The image with clipped pixel intensities.
    """
    return np.clip(image, min_intensity, max_intensity)

def histogram_equalization(image: np.ndarray) -> np.ndarray:
    """
    Apply histogram equalization to the input image.

    Parameters:
    - image (numpy.ndarray): The input image.

    Returns:
    numpy.ndarray: The image after histogram equalization.
    """
    return cv2.equalizeHist(image)

def histogram_equalization_condition(image: np.ndarray, on_average_intensity: float = 30) -> np.ndarray:
    """
    Apply histogram equalization to the input image if its average intensity is below the specified threshold.

    Parameters:
    - image (numpy.ndarray): The input image.
    - on_average_intensity (float): The threshold for average intensity. Default is 30.

    Returns:
    numpy.ndarray: The image after histogram equalization if the condition is met; otherwise, a copy of the original image.
    """
    average_intensity = np.mean(image)
    return cv2.equalizeHist(image) if average_intensity <= on_average_intensity else image.copy()

def edge_detection(image: np.ndarray, lower_threshold: float = 60, upper_threshold: float = 100) -> np.ndarray:
    """
    Apply Canny edge detection to the input image.
    """
    return cv2.Canny(image, lower_threshold, upper_threshold)

def edge_morph(image: np.ndarray, kernel: np.ndarray, iterations: int, erode: bool = False) -> np.ndarray:
    """
    Applies morphological operations (erosion or dilation) to enhance or diminish edges in an image.

    Parameters:
    - image (numpy.ndarray): The input image.
    - kernel (numpy.ndarray): The kernel used for the morphological operation.
    - iterations (int): The number of times the morphological operation is applied.
    - erode (bool): If True, applies erosion; if False, applies dilation. Default is False.

    Returns:
    numpy.ndarray: The resulting image after applying the specified morphological operation.
    """
    if erode:
        return cv2.erode(src=image, kernel=kernel, iterations=iterations)
    return cv2.dilate(src=image, kernel=kernel, iterations=iterations)
    
def blur(image: np.ndarray, kernel_size: tuple, standard_deviation: float) -> np.ndarray:
    """
    Apply Gaussian Blur to the input image.

    Parameters:
    - image (numpy.ndarray): The input image.
    - kernel_size (tuple): The size of the kernel for the Gaussian blur.
    - standard_deviation (float): The standard deviation of the Gaussian kernel.

    Returns:
    numpy.ndarray: The image after applying Gaussian blur.
    """
    return cv2.GaussianBlur(image, kernel_size, standard_deviation)

def binary_threshold(image: np.ndarray, thresh: float, to_max: float) -> np.ndarray:
    """
    Apply binary thresholding to the input image.

    Parameters:
    - image (numpy.ndarray): The input image.
    - thresh (float): The threshold value.
    - to_max (float): The maximum value to use for thresholding.

    Returns:
    numpy.ndarray: The binary thresholded image.
    """
    return cv2.threshold(image, thresh, to_max, cv2.THRESH_BINARY)[1]

def resize(image: np.ndarray, resolution: str = '360p') -> np.ndarray:
    """
    Resize the input image to the specified resolution.
    """
    resolutions = {'360p': (640, 360), '480p': (640, 480)}
    
    if resolution not in resolutions:
        raise ValueError("Invalid resolution. Supported resolutions: '360p', '480p'.")
    
    target_resolution = resolutions[resolution]
    return cv2.resize(image, target_resolution, interpolation=cv2.INTER_AREA)