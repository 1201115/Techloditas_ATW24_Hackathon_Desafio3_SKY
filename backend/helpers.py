from moviepy.editor import TextClip, CompositeVideoClip


def add_text_overlays(clip, texts):
    text_clips = []
    for text_data in texts:
        text_content = text_data.get("text", "XDDD")
        font_size = int(text_data.get("font-size", 55))
        color = text_data.get("color", "white")
        x = int(text_data.get("x", 70))
        y = int(text_data.get("y", 6))

        if text_content:
            text_clip = TextClip(
                text_content,
                fontsize=font_size,
                color=color,
                font="Arial",
                stroke_color="black",
                stroke_width=2,
            )
            text_clip = text_clip.set_position((x, y)).set_duration(clip.duration)
            text_clips.append(text_clip)

    final_clip = CompositeVideoClip([clip] + text_clips)

    return final_clip
