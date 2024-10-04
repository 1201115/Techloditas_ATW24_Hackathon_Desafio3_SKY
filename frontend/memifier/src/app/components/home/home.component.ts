import { Component, ViewChild } from "@angular/core";
import { TextOverlayComponent } from "../text-overlay/text-overlay.component";

@Component({
  selector: "home",
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.css",
})
export class HomeComponent {
  currentStep = 1;
  responseData: string | null = null;
  responseType: "video" | "image" | null = null;
  exportUrl: string | null = null; // For storing the exported video URL

  @ViewChild(TextOverlayComponent) textOverlay!: TextOverlayComponent;

  nextStep() {
    if (this.currentStep === 2) {
      if (this.responseType === "video") {
        this.textOverlay.onExportVideo((exportedUrl: string) => {
          this.exportUrl = exportedUrl;
          this.currentStep++;
        });
      } else if (this.responseType === "image") {
        this.textOverlay.onExportImage((exportedUrl: string) => {
          this.exportUrl = exportedUrl;
          this.currentStep++;
        });
      }
    } else if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onVideoTrimmed(videoUrl: string) {
    console.log("Video trimmed:", videoUrl);
    this.responseData = videoUrl;
    this.responseType = "video";
    this.nextStep();
  }

  onFrameCaptured(frameUrl: string) {
    console.log("Frame captured:", frameUrl);
    this.responseData = frameUrl;
    this.responseType = "image";
    this.nextStep();
  }
}
