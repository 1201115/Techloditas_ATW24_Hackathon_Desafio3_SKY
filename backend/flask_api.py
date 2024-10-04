import json
from flask import Flask, request, send_file, after_this_request
import os
from moviepy.editor import VideoFileClip
from werkzeug.utils import secure_filename
from flask_cors import CORS
import helpers as h
from moviepy.config import change_settings
from PIL import Image, ImageDraw, ImageFont

app = Flask(__name__)

# Load ImageMagick binary path from a text file
def load_imagemagick_path():
    with open("imagemagick_path.txt", "r") as file:
        return file.read().strip()

# Use the path from imagemagick_path.txt
imagemagick_path = load_imagemagick_path()
change_settings({"IMAGEMAGICK_BINARY": imagemagick_path})

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

@app.route("/export-video", methods=["POST"])
def export_video():
    if "video" not in request.files:
        return {"error": "No video file provided"}, 400

    video_file = request.files["video"]
    filename = secure_filename(video_file.filename)
    video_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    video_file.save(video_path)

    try:
        clip = VideoFileClip(video_path)
    except Exception as e:
        return {"error": f"Failed to process video: {str(e)}"}, 500

    # Extract text overlays from the form data
    try:
        text_overlays = json.loads(request.form.get("data", "{}")).get("texts", [])
    except (json.JSONDecodeError, TypeError):
        return {"error": "Failed to parse text overlays"}, 400

    if text_overlays:
        try:
            final_clip = h.add_text_overlays(clip, text_overlays)
        except (ValueError, TypeError) as e:
            return {"error": f"Failed to process text overlays: {str(e)}"}, 400
    else:
        final_clip = clip

    # Export the video with text overlays
    trimmed_video_filename = filename.rsplit(".", 1)[0] + "_with_text.mp4"
    trimmed_video_path = os.path.join(app.config["UPLOAD_FOLDER"], trimmed_video_filename)

    try:
        # Write the final video to a file
        final_clip.write_videofile(trimmed_video_path, codec="libx264")
    except Exception as e:
        return {"error": f"Failed to create the video: {str(e)}"}, 500

    # Return the final video with text overlays as a response
    return send_file(trimmed_video_path, mimetype="video/mp4", as_attachment=True, download_name=trimmed_video_filename)

@app.route("/export-image", methods=["POST"])
def export_image():
    if "image" not in request.files:
        return {"error": "No image file provided"}, 400

    image_file = request.files["image"]
    filename = secure_filename(image_file.filename)
    image_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    image_file.save(image_path)

    try:
        image = Image.open(image_path)
    except Exception as e:
        return {"error": f"Failed to process image: {str(e)}"}, 500

    # Extract text overlays from the form data
    try:
        text_overlays = json.loads(request.form.get("data", "{}")).get("texts", [])
    except (json.JSONDecodeError, TypeError):
        return {"error": "Failed to parse text overlays"}, 400

    if text_overlays:
        try:
            modified_image = add_text_to_image(image, text_overlays)
        except Exception as e:
            return {"error": f"Failed to process text overlays: {str(e)}"}, 500
    else:
        modified_image = image

    # Save the modified image to a new file
    output_image_filename = filename.rsplit(".", 1)[0] + "_with_text.png"
    output_image_path = os.path.join(app.config["UPLOAD_FOLDER"], output_image_filename)

    try:
        modified_image.save(output_image_path)
    except Exception as e:
        return {"error": f"Failed to save the image: {str(e)}"}, 500

    # Return the final image with text overlays as a response
    return send_file(output_image_path, mimetype="image/png", as_attachment=True, download_name=output_image_filename)

# Function to add text overlays to an image using PIL
def add_text_to_image(image, texts):
    draw = ImageDraw.Draw(image)

    for text_data in texts:
        text_content = text_data.get("text", "")
        font_size = float(text_data.get("fontSize", 55))  # Get the font size from the request
        color = text_data.get("color", "white")
        x = int(text_data.get("x", 0))
        y = int(text_data.get("y", 0))

        # Get the scale for width and height
        scale = text_data.get("scale", {"width": 1, "height": 1})
        scale_width = scale.get("width", 1)
        scale_height = scale.get("height", 1)

        # Adjust the x and y position based on the scale
        adjusted_x = x / scale_width
        adjusted_y = y / scale_height

        # Adjust the font size based on the scale (average of width and height scale)
        adjusted_font_size = font_size / ((scale_width + scale_height) / 2)

        # Load a font
        try:
            font = ImageFont.truetype("arial.ttf", int(adjusted_font_size))
        except IOError:
            font = ImageFont.load_default()

        # Add the text to the image
        if text_content:
            draw.text((adjusted_x, adjusted_y), text_content, fill=color, font=font)

    return image


if __name__ == "__main__":
    app.run(host="0.0.0.0", debug=True, threaded=True)
