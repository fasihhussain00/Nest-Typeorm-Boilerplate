import numpy as np

def get_center(image: np.ndarray, x_padding: int = 0, y_padding: int = 0) -> np.ndarray:
    """
    Get the center coordinates of the input image with optional padding.
    """
    return np.array([image.shape[1] // 2 + x_padding, image.shape[0] // 2 + y_padding])

def get_radius(center: np.ndarray, x_or_y: str, percentage: float = 10) -> float:
    """
    Calculate the radius based on the specified axis and percentage of the center.
    """
    axis = {'x': 0, 'y': 1}
    return center[axis[x_or_y]] * percentage / 100

def is_center(x: int, y: int, center: np.ndarray, radius: float) -> bool:
    """
    Check if the coordinates (x, y) are within the specified radius from the center.
    """
    return np.sqrt(np.sum((np.array([x, y]) - center) ** 2)) <= radius

def standard_deviation(image: np.ndarray) -> float:
    """
    Calculate the standard deviation of image.
    """
    return np.std(image)

def Kernel(size: tuple) -> np.ndarray:
    """
    Generate a kernel (2D array) filled with ones.

    Parameters:
    - size (tuple): A tuple specifying the shape of the kernel.

    Returns:
    - np.ndarray: A 2D NumPy array (kernel) filled with ones.
    """
    return np.ones(shape=size, dtype= np.uint8)