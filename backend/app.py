from flask import Flask, request, send_file
import os
from moviepy.editor import VideoFileClip
from werkzeug.utils import secure_filename
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

UPLOAD_FOLDER = 'uploads'
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Ensure upload folder exists
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

@app.route('/trim-to-gif', methods=['POST'])
def trim_to_gif():
    if 'video' not in request.files:
        return {'error': 'No video file provided'}, 400

    video_file = request.files['video']
    filename = secure_filename(video_file.filename)
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video_file.save(video_path)

    try:
        trim_start = float(request.form.get('trimStart', 0))
        trim_end = float(request.form.get('trimEnd', 0))
    except (ValueError, TypeError):
        return {'error': 'Invalid trimStart or trimEnd values'}, 400

    try:
        clip = VideoFileClip(video_path)
    except Exception as e:
        return {'error': f'Failed to process video: {str(e)}'}, 500

    if trim_start < 0 or trim_end > clip.duration or trim_start >= trim_end:
        return {'error': 'Invalid trim times'}, 400

    # Resize the video to 50% of its original size
    resized_clip = clip.subclip(trim_start, trim_end).resize(0.5)

    gif_filename = filename.rsplit('.', 1)[0] + '.gif'
    gif_path = os.path.join(app.config['UPLOAD_FOLDER'], gif_filename)

    try:
        # Write the resized GIF to the file system
        resized_clip.write_gif(gif_path, fps=24)
    except Exception as e:
        return {'error': f'Failed to create GIF: {str(e)}'}, 500

    # Return the GIF as a response
    return send_file(gif_path, mimetype='image/gif', as_attachment=True, download_name=gif_filename)

@app.route('/frame-at-time', methods=['POST'])
def frame_at_time():
    if 'video' not in request.files:
        return {'error': 'No video file provided'}, 400

    video_file = request.files['video']
    filename = secure_filename(video_file.filename)
    video_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    video_file.save(video_path)

    try:
        timestamp = float(request.form.get('timestamp', 0))
    except (ValueError, TypeError):
        return {'error': 'Invalid timestamp value'}, 400

    try:
        clip = VideoFileClip(video_path)
    except Exception as e:
        return {'error': f'Failed to process video: {str(e)}'}, 500

    # Ensure the requested timestamp is within the video duration
    if timestamp < 0 or timestamp > clip.duration:
        return {'error': 'Timestamp out of bounds'}, 400

    # Capture the frame at the requested timestamp
    frame_filename = filename.rsplit('.', 1)[0] + f'_frame_{int(timestamp)}.png'
    frame_path = os.path.join(app.config['UPLOAD_FOLDER'], frame_filename)

    try:
        # Save the frame as an image
        frame_image = clip.get_frame(timestamp)
        from PIL import Image
        image = Image.fromarray(frame_image)
        image.save(frame_path)
    except Exception as e:
        return {'error': f'Failed to extract frame: {str(e)}'}, 500

    return send_file(frame_path, mimetype='image/png', as_attachment=True, download_name=frame_filename)


if __name__ == '__main__':
    app.run(debug=True)
