import {
  Component,
  Input,
  OnInit,
  ViewChild,
  ElementRef,
  AfterViewInit,
  HostListener,
} from '@angular/core';
import { VideoExportService } from '../../services/video-export.service'; // Import the new service
@Component({
  selector: 'text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.css'],
})
export class TextOverlayComponent implements OnInit, AfterViewInit {
  @Input() mediaType: 'video' | 'image' | null = null;
  @Input() mediaSrc: string | null = null;
  text!: string;
  textColor: string = '#ffffff'; // Default text color: white
  fontSize: number = 24; // Default font size
  isEditing: boolean = false;

  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayText', { static: false }) overlayText!: ElementRef; // Ensure overlayText is referenced correctly

  private isDragging = false;
  private startX = 0;
  private startY = 0;

  constructor(private readonly videoExportService: VideoExportService) {} // Inject the new service

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.isEditing) {
      this.textInput.nativeElement.focus();
    }
  }

  addText() {
    this.isEditing = true;
    setTimeout(() => {
      this.textInput.nativeElement.focus();
    }, 0);
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
  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.overlayText.nativeElement.offsetLeft;
    this.startY = event.clientY - this.overlayText.nativeElement.offsetTop;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.moveText(event.clientX - this.startX, event.clientY - this.startY);
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  // Touch events
  startTouch(event: TouchEvent) {
    this.isDragging = true;
    const touch = event.touches[0];
    this.startX = touch.clientX - this.overlayText.nativeElement.offsetLeft;
    this.startY = touch.clientY - this.overlayText.nativeElement.offsetTop;
    event.preventDefault();
  }

  @HostListener('document:touchmove', ['$event'])
  onTouchMove(event: TouchEvent) {
    if (this.isDragging) {
      const touch = event.touches[0];
      this.moveText(touch.clientX - this.startX, touch.clientY - this.startY);
    }
  }

  @HostListener('document:touchend')
  onTouchEnd() {
    this.isDragging = false;
  }

  // Utility to move text
  moveText(x: number, y: number) {
    // Limit movement within the boundaries of the video element
    const videoRect = this.videoElement.nativeElement.getBoundingClientRect();
    const overlayText = this.overlayText.nativeElement;

    const newX = Math.max(
      0,
      Math.min(x, videoRect.width - overlayText.offsetWidth)
    );
    const newY = Math.max(
      0,
      Math.min(y, videoRect.height - overlayText.offsetHeight)
    );

    overlayText.style.left = `${newX}px`;
    overlayText.style.top = `${newY}px`;
  }

  // Export logic (same as before)
  onExportVideo(): void {
    const videoElement = this.videoElement.nativeElement;
    const videoUrl = videoElement.src;
    const exportType = 'GIF';

    const originalWidth = videoElement.videoWidth;
    const originalHeight = videoElement.videoHeight;
    const currentWidth = videoElement.clientWidth;
    const currentHeight = videoElement.clientHeight;

    const scale = {
      width: currentWidth / originalWidth,
      height: currentHeight / originalHeight,
    };

    const texts = [
      {
        text: this.text,
        color: this.textColor,
        x: this.overlayText.nativeElement.offsetLeft,
        y: this.overlayText.nativeElement.offsetTop,
        scale,
        fontSize: this.fontSize,
      },
    ];

    fetch(videoUrl)
      .then((response) => response.blob())
      .then((blob) => {
        const file = new File([blob], 'video.mp4', { type: 'video/mp4' });

        this.videoExportService.exportVideo(file, exportType, texts).subscribe(
          (blob) => {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'exported-video.mp4';
            a.click();
            URL.revokeObjectURL(url);
          },
          (error) => {
            console.error('Error exporting video:', error);
          }
        );
      })
      .catch((error) => {
        console.error('Error fetching video blob:', error);
      });
  }
}
