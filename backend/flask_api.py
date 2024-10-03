import json
from flask import Flask, request, send_file, after_this_request
import os
from moviepy.editor import VideoFileClip
from werkzeug.utils import secure_filename
from flask_cors import CORS
from PIL import Image
import helpers as h
from moviepy.config import change_settings

app = Flask(__name__)

change_settings({"IMAGEMAGICK_BINARY": "C:\\Program Files\\ImageMagick-7.1.1-Q16-HDRI\\magick.exe"})
# Set the maximum file size to 500MB
app.config["MAX_CONTENT_LENGTH"] = 500 * 1024 * 1024  # 500 MB limit

# Enable CORS for all routes
CORS(app)

UPLOAD_FOLDER = "uploads"
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)


@app.route("/")
def index():
    return "Hello, Equipa Vencedora!"


@app.route("/trim-to-video", methods=["POST"])
def trim_to_video():
    if "video" not in request.files:
        return {"error": "No video file provided"}, 400

    video_file = request.files["video"]
    filename = secure_filename(video_file.filename)
    video_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    video_file.save(video_path)

    try:
        trim_start = float(request.form.get("trimStart", 0))
        trim_end = float(request.form.get("trimEnd", 0))
    except (ValueError, TypeError):
        return {"error": "Invalid trimStart or trimEnd values"}, 400

    try:
        clip = VideoFileClip(video_path)
    except Exception as e:
        return {"error": f"Failed to process video: {str(e)}"}, 500

    if trim_start < 0 or trim_end > clip.duration or trim_start >= trim_end:
        return {"error": "Invalid trim times"}, 400

    # Trim the video
    trimmed_clip = clip.subclip(trim_start, trim_end)

    trimmed_video_filename = filename.rsplit(".", 1)[0] + "_trimmed.mp4"
    trimmed_video_path = os.path.join(app.config["UPLOAD_FOLDER"], trimmed_video_filename)

    try:
        # Write the trimmed video to a file
        trimmed_clip.write_videofile(trimmed_video_path, codec="libx264")
    except Exception as e:
        return {"error": f"Failed to create trimmed video: {str(e)}"}, 500

    # Return the trimmed video as a response
    return send_file(trimmed_video_path, mimetype="video/mp4", as_attachment=True, download_name=trimmed_video_filename)


@app.route("/trim-to-gif", methods=["POST"])
def trim_to_gif():
    if "video" not in request.files:
        return {"error": "No video file provided"}, 400

    video_file = request.files["video"]
    filename = secure_filename(video_file.filename)
    video_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    video_file.save(video_path)

    try:
        trim_start = float(request.form.get("trimStart", 0))
        trim_end = float(request.form.get("trimEnd", 0))
    except (ValueError, TypeError):
        return {"error": "Invalid trimStart or trimEnd values"}, 400

    try:
        clip = VideoFileClip(video_path)
    except Exception as e:
        return {"error": f"Failed to process video: {str(e)}"}, 500

    if trim_start < 0 or trim_end > clip.duration or trim_start >= trim_end:
        return {"error": "Invalid trim times"}, 400

    # Resize the video to 50% of its original size
    resized_clip = clip.subclip(trim_start, trim_end).resize(0.1)

    gif_filename = filename.rsplit(".", 1)[0] + ".gif"
    gif_path = os.path.join(app.config["UPLOAD_FOLDER"], gif_filename)

    # get video fps
    clip_fps = clip.fps / 2

    try:
        # Write the resized GIF to the file system
        resized_clip.write_gif(gif_path, fps=clip_fps)
    except Exception as e:
        return {"error": f"Failed to create GIF: {str(e)}"}, 500

    # Return the GIF as a response
    return send_file(gif_path, mimetype="image/gif", as_attachment=True, download_name=gif_filename)


@app.route("/frame-at-time", methods=["POST"])
def frame_at_time():
    if "video" not in request.files:
        return {"error": "No video file provided"}, 400

    video_file = request.files["video"]
    filename = secure_filename(video_file.filename)
    video_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    video_file.save(video_path)

    try:
        timestamp = float(request.form.get("timestamp", 0))
    except (ValueError, TypeError):
        return {"error": "Invalid timestamp value"}, 400

    try:
        clip = VideoFileClip(video_path)
    except Exception as e:
        return {"error": f"Failed to process video: {str(e)}"}, 500

    # Ensure the requested timestamp is within the video duration
    if timestamp < 0 or timestamp > clip.duration:
        return {"error": "Timestamp out of bounds"}, 400

    # Capture the frame at the requested timestamp
    frame_filename = filename.rsplit(".", 1)[0] + f"_frame_{int(timestamp)}.png"
    frame_path = os.path.join(app.config["UPLOAD_FOLDER"], frame_filename)

    try:
        # Save the frame as an image
        frame_image = clip.get_frame(timestamp)
        image = Image.fromarray(frame_image)
        image.save(frame_path)
    except Exception as e:
        return {"error": f"Failed to extract frame: {str(e)}"}, 500

    return send_file(frame_path, mimetype="image/png", as_attachment=True, download_name=frame_filename)


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, threaded=True)
