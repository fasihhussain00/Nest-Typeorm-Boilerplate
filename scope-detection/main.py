import argparse
import os
import shutil
import uuid
from module.hardscope import get_hard_scope_time
from utils.encoder import encode, Metadata
from cv2 import VideoCapture
import cv2
import numpy as np
from module.killcam import get_kill_cam_time
import requests

temp_dir: str = "temp"

def main(uri: str) -> float | None:
    dir_id: str = str(uuid.uuid4())
    video_id: str = str(uuid.uuid4())
    os.makedirs(f"{temp_dir}/{dir_id}", exist_ok=True)
    video_file_path: str = f"{temp_dir}/{dir_id}/{video_id}.mp4"
    encoded_video_file_path: str = f"{temp_dir}/{dir_id}/{video_id}-encoded.mp4"
    response = requests.get(uri, stream=True)
    with open(video_file_path, "wb") as f:
        shutil.copyfileobj(response.raw, f)
    encode(
        input_path=video_file_path,
        output_path=encoded_video_file_path,
        output_fps=10,
        target_resolution=(640, 360),
    )

    metadata: Metadata = Metadata(input_path=encoded_video_file_path)

    video: VideoCapture = VideoCapture(encoded_video_file_path)

    if not video.isOpened():
        print("Error: Could not open video.")
        return None

    num_of_frames: int = int(video.get(cv2.CAP_PROP_FRAME_COUNT))

    if metadata.is_rgb:
        frames: np.ndarray = np.empty(
            (num_of_frames, metadata.height, metadata.width, 3), dtype=np.uint8
        )
    else:
        return None

    for i in range(num_of_frames):
        ret, frame = video.read()

        if not ret:
            break

        frames[i] = frame
    video.release()
    start_idx: int
    end_idx: int
    kill_cam_indexes = get_kill_cam_time(
        frames=frames,
        fps=metadata.fps,
        kill_cam_length=6.6,
        time_upper_threshold=0.1,
        time_lower_threshold=1.4,
    )

    if kill_cam_indexes is None:
        return None

    start_idx, end_idx = kill_cam_indexes
    scope_time: float = get_hard_scope_time(
        frames=frames, fps=metadata.fps, start_idx=start_idx, end_idx=end_idx
    )
    shutil.rmtree(f"{temp_dir}/{dir_id}")
    return scope_time


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Scope Detection")
    parser.add_argument("--input", type=str, help="Input video path")
    args = parser.parse_args()
    print(main(args.input))
