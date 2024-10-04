import { Component, Input } from "@angular/core";

@Component({
  selector: "app-export",
  templateUrl: "./export.component.html",
  styleUrls: ["./export.component.css"],
})
export class ExportComponent {
  @Input() exportedUrl: string | null = null;
  @Input() mediaType: "video" | "image" | null = null;
  @Input() selectedLayout: string = "Gif";

  downloadMedia() {
    if (this.exportedUrl) {
      const a = document.createElement("a");
      a.href = this.exportedUrl;
      if (this.mediaType === "video" && this.selectedLayout === "Gif") {
        a.download = "exported-video.gif";
      } else if (this.mediaType === "video" && this.selectedLayout !== "Gif") {
        a.download = "exported-video.mp4";
      } else {
        a.download = "exported-image.png";
      }
      a.click();
    }
  }

  shareOnInstagram() {
    this.downloadMedia();
    window.open(
      `https://www.instagram.com/?url=${encodeURIComponent(this.exportedUrl!)}`,
      "_blank"
    );
  }

  shareOnYouTube() {
    if (this.mediaType === "video" && this.selectedLayout !== "Gif") {
      this.downloadMedia();
      window.open(
        `https://www.youtube.com/?url=${encodeURIComponent(this.exportedUrl!)}`,
        "_blank"
      );
    }
  }

  shareOnWhatsApp() {
    this.downloadMedia();
    window.open("https://web.whatsapp.com/", "_blank");
  }
}
