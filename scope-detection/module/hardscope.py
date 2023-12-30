import cv2
import numpy as np
import pandas as pd
from utils import image_process
from utils import image_function
from functools import reduce
from typing import Any

def lighten_upper_lower_borders(image, y1, y2, y3, y4, lighten_factor=100):
    """
    # Adjusts specified regions in an image by lightening and subtracting the mean.

    Parameters:
    - image (numpy.ndarray): The input image as a NumPy array.
    - y1 (int): Starting y-coordinate of the upper border region to be adjusted.
    - y2 (int): Ending y-coordinate of the upper border region to be adjusted.
    - y3 (int): Starting y-coordinate of the lower border region to be adjusted.
    - y4 (int): Ending y-coordinate of the lower border region to be adjusted.
    - lighten_factor (int): Lighten factor to be added to the specified regions (default is 100).

    Returns:
    - numpy.ndarray: The modified image with adjusted upper and lower border regions.

    Notes:
    - The function adjusts the pixel values in the specified regions by adding the lighten_factor.
    - It then subtracts the mean value from the adjusted regions.
    - The resulting pixel values are clipped to be within the valid range [0, 255].
    """
    # Adjust the specified regions with the lighten factor
    image[y1:y2] = image_process.clip_pixel_intensities(
        image=image[y1:y2].astype(int) + lighten_factor, 
        min_intensity=0, 
        max_intensity=255)
    
    image[y3:y4] = image_process.clip_pixel_intensities(
        image=image[y3:y4].astype(int) + lighten_factor, 
        min_intensity=0, 
        max_intensity=255)

    # Subtract the mean from the specified regions
    image[y1:y2] = (image[y1:y2] - np.mean(image[y1:y2])).astype(np.uint8)
    image[y3:y4] = (image[y3:y4] - np.mean(image[y3:y4])).astype(np.uint8)

    return image

def get_circles(image: np.ndarray, min_dist_apart: float,
                sensitivity: float, min_circle_edge: float,
                min_radius: int, max_radius: int) -> np.ndarray:
    """
    # Detect circles in an image using the Hough Circle Transform.

    Parameters:
    - image (np.ndarray): Input image (grayscale) in which circles are to be detected.
    - min_dist_apart (float): Minimum distance between the centers of detected circles.
    - sensitivity (float): Sensitivity of the circle detection. Higher values for less sensitivity.
    - min_circle_edge (float): The higher threshold of the two passed to the Canny edge detector (low threshold is twice smaller).
    - min_radius (int): Minimum radius of the detected circles.
    - max_radius (int): Maximum radius of the detected circles.

    Returns:
    - np.ndarray: A 3D array containing the detected circles. Each circle is represented by a triplet (x, y, r),
    where (x, y) are the coordinates of the circle's center, and r is the radius.
    If no circles are found, the function returns None.

    Note:
    - The function uses the Hough Circle Transform to detect circles in the input image.
    - The `dp` parameter is fixed at 1.5 for the HoughCircles function.
    """

    # Param 2 will set the sensitivity (low less sensitive)
    # Param 1 will set how many edge points it needs to find to declare that it's found a circle. (low like 4 mean rectangle is also circle)

    return cv2.HoughCircles(image, cv2.HOUGH_GRADIENT,
                            dp=1.5, minDist=min_dist_apart,
                            param1=min_circle_edge, param2=sensitivity,
                            minRadius=min_radius, maxRadius=max_radius)

def detect_circles(frame: np.ndarray, center: np.ndarray, 
                radius: float) -> tuple:
    """
    # Detects circles in an image using a multi-step process.

    Parameters:
    - frame (numpy.ndarray): The input image frame.
    - center (numpy.ndarray): The center coordinates of the target circle.
    - radius (float): The radius of the target circle.

    Returns:
    tuple: A tuple containing the x, y, and r coordinates of the relevant circle.

    Steps:
    1. Convert the color image to grayscale using the hsv2color algorithm.
    2. Calculate the standard deviation of the grayscale image.
    3. Apply histogram equalization to the image.
    4. Lighten the upper and lower borders of the image to improve object visibility.
    5. Apply binary thresholding to create a binary image.
    6. Perform Gaussian blur on the binary image using the calculated standard deviation.
    7. Apply Canny edge detection with specified thresholds.
    8. Define a kernel for morphological operations and perform dilations on edges.
    9. Perform erosions to reduce the size of the edges.
    10. Use Hough Circle Transform to detect circles in the processed image.

    Note:
    The function relies on various image processing functions from the `image_process` and `image_function` modules.
    Adjust parameters as needed for specific use cases.
    """

    # Converted color image back to color using algorithm hsv to color which is odd but this odd use of the function works for this problem
    image: np.ndarray = image_process.hsv2color(frame)

    # Convert the image to grayscale
    image = image_process.color2gray(image)

    # Standard deviation calculated of gray image
    std_deviation = image_function.standard_deviation(image)

    # Equalization is applied on image
    image = image_process.histogram_equalization(image=image)

    # Border are lighten up and applied some calculation to see object behind kill cam borders
    lighten_factor = 100
    image = lighten_upper_lower_borders(
        image=image, y1=0, y2=40, y3=290, y4=360, lighten_factor=lighten_factor)

    # Binary threshold
    image = image_process.binary_threshold(
        image=image, thresh=60, to_max=100)

    # Gaussian Blur
    image = image_process.blur(
        image=image, kernel_size=(5, 5), standard_deviation=std_deviation)

    # Canny edge
    lower_threshold: float = 60
    upper_threshold: float = 100
    image = image_process.edge_detection(
        image=image, lower_threshold=lower_threshold, upper_threshold=upper_threshold)

    # Define a kernel for morphological operations
    kernel: np.ndarray = image_function.Kernel(size=(8, 8))
    # Dilated Edges to join edges that are apart from small gaps
    image = image_process.edge_morph(image=image, kernel=kernel, iterations=1)

    # Perform erosion to reduce the size of the edges
    kernel = image_function.Kernel(size=(3, 3))
    image = image_process.edge_morph(
        image=image, kernel=kernel, iterations=3, erode=True)

    # Hough Circle Transform Detection
    threshold1: float = 90
    threshold2: float = upper_threshold
    circles: np.ndarray = get_circles(image=image,
                                    min_dist_apart=300,
                                    sensitivity=threshold1,
                                    min_circle_edge=threshold2,
                                    min_radius=20, max_radius=200)


    return extract_relevant_circle(circles=circles, center=center, 
                                radius=radius)

def extract_relevant_circle(circles: np.ndarray, center: np.ndarray, 
                            radius: float) -> tuple:
    """
    # Extracts relevant circle information from a list of circles.

    Parameters:
    - circles (numpy.ndarray): An array containing information about circles.
    - center (numpy.ndarray): The center coordinates of the target circle.
    - radius (float): The radius of the target circle.

    Returns:
    tuple: A tuple containing the x, y, and r coordinates of the relevant circle.

    Note:
    The function assumes that the input circles are represented as (x, y, r).
    It iterates through the circles to find the first one that matches the specified center and radius.
    """
    x: int
    y: int
    r: float

    x, y, r = 0, 0, 0
    if circles is not None:
        # Convert the (x, y) coordinates and radius of the circles to integers
        circles = np.around(circles).astype(np.uint16)

        # Draw the circles on the original image

        circle: np.ndarray
        for circle in circles[0, :]:
            if image_function.is_center(circle[0], circle[1], center, radius):
                x, y, r = circle
                break

    return (x, y, r)

# Function to identify glitchy values and create conditions for removal
def glitch_remove(df: pd.DataFrame, attr: str = 'r', 
                value: float = 0, window_size: int = 3) -> list[pd.Series]:
    """
    Identifies glitchy values in a DataFrame column and creates conditions for removal.

    Parameters:
    - df (pd.DataFrame): The DataFrame containing the data.
    - attr (str): The column name to check for glitchy values. Default is 'r'.
    - value (float): The value considered as a glitch. Default is 0.
    - window_size (int): The size of the window for checking glitch conditions. Must be an odd number. Default is 3.

    Returns:
    list[pd.Series]: A list of conditions for glitchy values based on the specified window size.

    Note:
    The function creates conditions to identify glitchy values in the specified DataFrame column.
    Glitchy values are identified by checking if the attribute value at the current position is equal to the specified value,
    and the same check is performed for neighboring positions within a window defined by the window_size.
    The conditions can be used for filtering out glitchy values from the DataFrame.
    """

    # Ensure that window_size is always odd
    conditions: list[pd.Series] = []

    if window_size > 2 and window_size % 2 != 0:
        # Create conditions for glitchy values based on the specified window size
        i: int
        for i in range(window_size//2):
            conditions.append(df[attr].shift(i+1) == value)
            conditions.append(df[attr].shift(-1 * (i+1)) == value)

    return conditions

# Function to perform logical AND operation between two Series
def and_gate(x: pd.Series, y: pd.Series) -> pd.Series:
    """
    Implements the logical AND operation between two pandas Series.

    Parameters:
    - x (pd.Series): The first pandas Series for the AND operation.
    - y (pd.Series): The second pandas Series for the AND operation.

    Returns:
    pd.Series: A new pandas Series representing the result of the logical AND operation between x and y.
    """
    return x & y

def process_scope_radius(df: pd.DataFrame, attr: str):
    """
    Process radius values in a DataFrame column, addressing glitches and smoothing.

    Parameters:
    - df (pd.DataFrame): The DataFrame containing the data.
    - attr (str): The column name representing the radius values.

    Returns:
    pd.DataFrame: The processed DataFrame with smoothed and cleaned radius values.

    Steps:
    1. Reverse the DataFrame to process values from the end.
    2. Create a new column for processing with the same values as the original 'r' column.
    3. Identify and remove glitchy values (replacing them with 0).
    4. Smooth values to fill up middle glitches using rolling averages.
    5. Remove values below 75% of the mean and replace them with the mean.

    Note:
    The function utilizes the glitch_remove function to identify and remove glitchy values.
    It also performs smoothing using rolling averages with different window sizes.
    Values below 75% of the mean are replaced with the mean.
    """

    # Reversing DataFrame
    df = df.iloc[ :  : -1].reset_index(drop=True)

    # Creating new radius for processing
    df[attr] = df['r']

    # Identify and remove glitchy values (here, replacing with 0)
    conditions: list[pd.Series[bool]] = glitch_remove(
        df=df, attr=attr, value=0, window_size=3)
    
    condition: pd.Series[bool] = reduce(and_gate, conditions)
    df.loc[condition, attr] = 0

    # Smoothing Values (Graph) to fill up middle glitches
    # Odd window sizes
    window_sizes: list[int] = [3,5]
    unique_set: np.ndarray = df[attr].unique()

    # Second last minimum number selected
    minimum: np.ndarray = np.argsort(unique_set)[1:2]
    if len(minimum) > 0:
        minimum_r: float = float(unique_set[minimum])

    # Creating Mask for only glitches (0 and minimum_r range values) which is needed to be fill up
    mask: pd.Series[bool] = ((df[attr] >= 0) & (df[attr] < minimum_r))
    interpolation: pd.Series[float] = df[attr]

    # Calculate moving average with different window 
    window_size: int  # Odd
    for window_size in window_sizes:
        interpolation[mask] = interpolation.rolling(
            window=window_size, center=True).mean().fillna(value=0)[mask]
        
        df.loc[mask, attr] = interpolation[mask]


    # Removing all the data that is below 75% of mean
    mean: float = df[df[attr] != 0][attr].mean()
    percent: float = 75
    percentile_mean: float = mean * percent / 100

    # Replace values below 75% of the mean with NaN
    df.loc[df[attr] < percentile_mean, attr] = np.nan

    # Replace NaN values with the mean
    df.loc[df[attr].notnull(), attr] = mean

    return df

def find_longest_sequence(df: pd.DataFrame, 
                        attr: str, 
                        fps: int, 
                        start_time: float = 2) -> float:
    """
    Finds the duration of the longest continuous sequence of non-NaN values in a DataFrame column.

    Parameters:
    - df (pd.DataFrame): The DataFrame containing the data.
    - attr (str): The column name for which the sequence is calculated.
    - fps (int): Frames per second, used to convert sequence length to time.
    - start_time (float): The start time (in seconds) from which the sequence is considered. Default is 2.

    Returns:
    float: The duration (in seconds) of the longest continuous sequence of non-NaN values.

    Note:
    The function starts searching for the sequence from the specified start_time.
    It calculates the duration of the longest continuous sequence of non-NaN values in the specified DataFrame column.
    """

    isNull: bool = True
    sequence: int = 0
    start: int = int( start_time * fps )

    value: float
    for value in df[attr][start:]:

        if pd.notna(value):
            isNull = False
            sequence += 1
            
        elif isNull:
            continue

        elif sequence > 0:
            # Break the sequence when a NaN is encountered
            break

    time: float = sequence / fps

    return time

def get_hard_scope_time(frames: np.ndarray, fps: int, 
                        start_idx: int = 0, end_idx: int = 0) -> float:
    """
    Calculates the duration of the longest continuous sequence of relevant scope circles in video frames.

    Parameters:
    - frames (np.ndarray): An array of video frames.
    - fps (int): Frames per second.
    - start_idx (int): The index of the first frame to consider. Default is 0.
    - end_idx (int): The index of the last frame to consider. Default is 0 (consider all frames).

    Returns:
    float: The duration (in seconds) of the longest continuous sequence of relevant scope circles.

    Note:
    The function detects circles in each frame within the specified range and processes their radius values.
    It then calculates the duration of the longest continuous sequence of relevant scope circles using the
    `process_scope_radius` and `find_longest_sequence` functions.
    """
    
    if end_idx <= 0:
        end_idx = len(frames)

    # Get the center coordinates of the image with a vertical padding of -10 pixels
    center: np.ndarray = image_function.get_center(frames[0], y_padding=-10)

    # Radius where detected circle center's can be excepted and taken as relevant
    radius: float = 75

    # Data To store information about circles
    data: dict[str, list[Any]] = {
        'x': [],
        'y': [],
        'r': [],
    }
    col: list = list(data.keys())

    i: int # start_idx, end_idx + 1
    for i in range(start_idx, end_idx + 1):
        x: int
        y: int
        r: float
        x, y, r = detect_circles(frame=frames[i], center=center, radius=radius)
        data['x'].append(x) 
        data['y'].append(y) 
        data['r'].append(r)


    df: pd.DataFrame = pd.DataFrame(data, columns=col)

    attr: str = 'scope_radius'
    df = process_scope_radius(df=df, attr=attr)

    return find_longest_sequence(df=df, attr=attr, fps=fps, start_time=2)
