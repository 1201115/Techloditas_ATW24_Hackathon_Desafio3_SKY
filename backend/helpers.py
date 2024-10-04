from moviepy.editor import TextClip, CompositeVideoClip
from PIL import Image, ImageDraw, ImageFont

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

        # Define stroke parameters similar to TextClip stroke
        stroke_color = text_data.get("strokeColor", "black")
        stroke_width = int(text_data.get("strokeWidth", 2))

        # Draw stroke (outline) by drawing the text multiple times around the main position
        if text_content:
            # Drawing the stroke by slightly shifting the text in multiple directions
            for dx in range(-stroke_width, stroke_width + 1):
                for dy in range(-stroke_width, stroke_width + 1):
                    # Don't draw in the center (to avoid overwriting the main text)
                    if dx != 0 or dy != 0:
                        draw.text((adjusted_x + dx, adjusted_y + dy), text_content, font=font, fill=stroke_color)

            # Draw the main text on top of the stroke
            draw.text((adjusted_x, adjusted_y), text_content, fill=color, font=font)

    return image