import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from "@angular/core";
import { VideoExportService } from "../../services/video-export.service"; // Import the new service
@Component({
  selector: "text-overlay",
  templateUrl: "./text-overlay.component.html",
  styleUrls: ["./text-overlay.component.css"],
})
export class TextOverlayComponent implements OnInit, AfterViewInit {
  @Input() mediaType: "video" | "image" | null = null;
  @Input() mediaSrc: string | null = null;
  texts: { text: string; color: string; fontSize: number; x: number; y: number }[] = [];
  textColor: string = "#ffffff"; // Default text color: white
  fontSize: number = 24; // Default font size
  isEditing: boolean = false;
  isLoading: boolean = false;
  selectedLayout: string | null = null; // Define selectedLayout variable
  layouts: string[] = ['Reel', 'Short', 'Gif', 'Story'];

  @ViewChild("textInput") textInput!: ElementRef;
  @ViewChild("videoElement") videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild("imageElement") imageElement!: ElementRef<any>;
  @ViewChild("overlayText", { static: false }) overlayText!: ElementRef; // Ensure overlayText is referenced correctly

  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private dragIndex: number | null = null;

  constructor(private readonly videoExportService: VideoExportService) {} // Inject the new service

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.isEditing) {
      this.textInput.nativeElement.focus();
    }
  }

  addText(): void {
    this.texts.push({
      text: '',
      color: this.textColor,
      fontSize: this.fontSize,
      x: 0,
      y: 0,
    });
    this.isEditing = true;
  }

  saveText() {
    this.isEditing = false;
  }

  cancelText() {
    this.isEditing = false;
  }

  restartVideo(event: Event) {
    const videoElement = event.target as HTMLVideoElement;
    videoElement.currentTime = 0;
    videoElement.play();
  }

  // Mouse events
  startDrag(event: MouseEvent, index: number): void {
    this.isDragging = true;
    this.dragIndex = index;
    this.startX = event.clientX - this.texts[index].x;
    this.startY = event.clientY - this.texts[index].y;
    event.preventDefault();
  }

  onDrag(event: MouseEvent): void {
    if (this.isDragging && this.dragIndex !== null) {
      this.texts[this.dragIndex].x = event.clientX - this.startX;
      this.texts[this.dragIndex].y = event.clientY - this.startY;
    }
  }

  stopDrag(): void {
    this.isDragging = false;
    this.dragIndex = null;
  }

  @HostListener("document:mousemove", ["$event"])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging && this.dragIndex !== null) {
      this.texts[this.dragIndex].x = event.clientX - this.startX;
      this.texts[this.dragIndex].y = event.clientY - this.startY;
    }
  }

  @HostListener("document:mouseup")
  onMouseUp() {
    this.isDragging = false;
    this.dragIndex = null;
  }

  // Touch events
  startTouch(event: TouchEvent, index: number) {
    this.isDragging = true;
    this.dragIndex = index;
    const touch = event.touches[0];
    this.startX = touch.clientX - this.texts[index].x;
    this.startY = touch.clientY - this.texts[index].y;
    event.preventDefault();
  }

  onTouchMove(event: TouchEvent) {
    if (this.isDragging && this.dragIndex !== null) {
      const touch = event.touches[0];
      this.texts[this.dragIndex].x = touch.clientX - this.startX;
      this.texts[this.dragIndex].y = touch.clientY - this.startY;
    }
  }

  stopTouch(): void {
    this.isDragging = false;
    this.dragIndex = null;
  }

  @HostListener("document:touchmove", ["$event"])
  onDocumentTouchMove(event: TouchEvent) {
    this.onTouchMove(event);
  }

  @HostListener("document:touchend")
  onDocumentTouchEnd() {
    this.stopTouch();
  }
  onTouchEnd() {
    this.isDragging = false;
  }

  // Utility to move text
  moveText(x: number, y: number) {
    // check mediaType
    const overlayText = this.overlayText.nativeElement;
    let newX;
    let newY;
    if (this.mediaType === "video") {
      // Limit movement within the boundaries of the video element
      const videoRect = this.videoElement.nativeElement.getBoundingClientRect();

      newX = Math.max(
        0,
        Math.min(x, videoRect.width - overlayText.offsetWidth)
      );
      newY = Math.max(
        0,
        Math.min(y, videoRect.height - overlayText.offsetHeight)
      );
    } else if (this.mediaType === "image") {
      // Limit movement within the boundaries of the image element
      const imageRect = this.imageElement.nativeElement.getBoundingClientRect();

      newX = Math.max(
        0,
        Math.min(x, imageRect.width - overlayText.offsetWidth)
      );
      newY = Math.max(
        0,
        Math.min(y, imageRect.height - overlayText.offsetHeight)
      );
    }

    overlayText.style.left = `${newX}px`;
    overlayText.style.top = `${newY}px`;
  }

  // Export logic (same as before)
  onExportVideo(callback: (url: string) => void): void {
    this.isLoading = true;
    const videoElement = this.videoElement.nativeElement;
    const videoUrl = videoElement.src;
    const exportType = "GIF";

    const originalWidth = videoElement.videoWidth;
    const originalHeight = videoElement.videoHeight;
    const currentWidth = videoElement.clientWidth;
    const currentHeight = videoElement.clientHeight;

    const scale = {
      width: currentWidth / originalWidth,
      height: currentHeight / originalHeight,
    };

    // const texts = [
    //   {
    //     text: this.text,
    //     color: this.textColor,
    //     x: this.overlayText.nativeElement.offsetLeft,
    //     y: this.overlayText.nativeElement.offsetTop,
    //     scale,
    //     fontSize: this.fontSize,
    //   },
    // ];

    // Check if selectedLayout is defined
    if (!this.selectedLayout) {
      console.error('Error: Layout not selected.');
      this.isLoading = false;
      return;
    }

    const layout = this.selectedLayout;
    fetch(videoUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "video.mp4", { type: "video/mp4" });

        this.videoExportService.exportVideo(file, exportType, this.texts, layout).subscribe(
          (blob) => {
            const url = URL.createObjectURL(blob);
            this.isLoading = false;
            callback(url); // Pass the URL to the callback
          },
          (error) => {
            console.error("Error exporting video:", error);
            this.isLoading = false;
          }
        );
      })
      .catch((error) => {
        console.error("Error fetching video blob:", error);
        this.isLoading = false;
      });
  }

  onExportImage(callback: (url: string) => void): void {
    this.isLoading = true;
    
    const imageElement = this.imageElement.nativeElement;
    const imageUrl = imageElement.src;
  

    const scale = {
      width: imageElement.clientWidth / imageElement.naturalWidth,
      height: imageElement.clientHeight / imageElement.naturalHeight,
    };

    // const texts = [
    //   {
    //     text: this.text,
    //     color: this.textColor,
    //     x: this.overlayText.nativeElement.offsetLeft,
    //     y: this.overlayText.nativeElement.offsetTop,
    //     scale,
    //     fontSize: this.fontSize,
    //   },
    // ];
  
    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], "image.png", { type: "image/png" });
  
        // Call the backend to process the image with text overlay
        this.videoExportService.exportImage(file, this.texts).subscribe(
          (blob) => {
            const url = URL.createObjectURL(blob); // Create the URL for the new image
            this.isLoading = false;
            callback(url); // Pass the URL to the callback
          },
          (error) => {
            console.error("Error exporting image:", error);
            this.isLoading = false;
          }
        );
      })
      .catch((error) => {
        console.error("Error fetching image blob:", error);
        this.isLoading = false;
      });
  }
  
}
