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
