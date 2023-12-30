import subprocess
from moviepy.editor import VideoFileClip


def encode(
    input_path: str,
    output_path: str,
    output_fps: int | None = None,
    target_resolution: tuple | None = None,
    verbose: bool = False,
) -> None:
    """
    Run ffmpeg to convert a video file with optional parameters.

    Parameters:
    - input_path (str): The path to the input video file.
    - output_path (str): The path to the output video file.
    - output_fps (int | None): The output frames per second. If None, uses the original FPS.
    - target_resolution (tuple | None): The target resolution as a tuple (width, height). If None, uses the original resolution.
    - verbose (bool): If True, show detailed ffmpeg logs. If False, show only errors.

    Returns:
    None
    """
    try:
        command = [
            "ffmpeg",
            "-y",
            "-hide_banner",
            "-loglevel",
            "info" if verbose else "fatal",
            "-i",
            input_path,
        ]
        if target_resolution:
            command.extend(
                ["-vf", f"scale={target_resolution[0]}:{target_resolution[1]}"]
            )

        if output_fps:
            command.extend(["-r", str(output_fps)])

        command.append(output_path)
        subprocess.run(command, check=True)
    except subprocess.CalledProcessError as e:
        return #TODO: Add Custom Error


class Metadata:
    def __init__(self, input_path: str):
        """
        Initialize metadata for a video file.

        Parameters:
        - input_path (str): The path to the input video file.
        """
        video_clip = VideoFileClip(input_path)
        self.fps: int = int(video_clip.fps)
        self.duration: float = video_clip.duration
        self.size: tuple = video_clip.size
        self.width: int = self.size[0]
        self.height: int = self.size[1]
        self.aspect_ratio: float = self.width / self.height if self.height != 0 else 0.0
        self.has_audio: bool = video_clip.audio is not None
        self.is_rgb: bool = self._check_is_rgb(video_clip)
        video_clip.close()
        del video_clip

    def _check_is_rgb(self, video_clip: VideoFileClip) -> bool:
        """
        Check if the video clip is in RGB color format.

        Parameters:
        - video_clip (VideoFileClip): The VideoFileClip object.

        Returns:
        bool: True if the video clip is in RGB format, False otherwise.
        """
        first_frame = video_clip.get_frame(0)
        return first_frame.shape[2] == 3 if len(first_frame.shape) == 3 else False

    def __str__(self):
        return str(self.__dict__)