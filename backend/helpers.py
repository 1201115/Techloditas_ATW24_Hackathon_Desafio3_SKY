from moviepy.editor import TextClip, CompositeVideoClip


def add_text_overlays(clip, texts):
    text_clips = []
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

        if text_content:
            text_clip = TextClip(
                text_content,
                fontsize=adjusted_font_size,
                color=color,
                font="Arial",
                stroke_color="black",
                stroke_width=2,
            )
            text_clip = text_clip.set_position((adjusted_x, adjusted_y)).set_duration(clip.duration)
            text_clips.append(text_clip)

    final_clip = CompositeVideoClip([clip] + text_clips)

    return final_clip


def format_video_for_platform(clip, target_aspect_ratio=(16, 9)):
    target_width, target_height = target_aspect_ratio

    current_aspect_ratio = clip.w / clip.h

    target_aspect_ratio = target_width / target_height

    if current_aspect_ratio > target_aspect_ratio:
        new_width = int(clip.h * target_aspect_ratio)
        resized_clip = clip.crop(width=new_width, height=clip.h, x_center=clip.w / 2)
    elif current_aspect_ratio < target_aspect_ratio:
        new_height = int(clip.w / target_aspect_ratio)
        resized_clip = clip.crop(width=clip.w, height=new_height, y_center=clip.h / 2)
    else:
        resized_clip = clip

    return resized_clip


# Example usage:
input_video = "input_video.mp4"
output_video = "formatted_for_stories.mp4"
