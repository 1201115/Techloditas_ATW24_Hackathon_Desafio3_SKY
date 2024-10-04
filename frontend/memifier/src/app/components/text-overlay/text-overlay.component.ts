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
  text: string = '';
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

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.overlayText.nativeElement.offsetLeft;
    this.startY = event.clientY - this.overlayText.nativeElement.offsetTop;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.overlayText.nativeElement.style.left = `${
        event.clientX - this.startX
      }px`;
      this.overlayText.nativeElement.style.top = `${
        event.clientY - this.startY
      }px`;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }

  onExportVideo(): void {
    const videoElement = this.videoElement.nativeElement;
    const videoUrl = videoElement.src;
    const exportType = 'GIF'; // Default export type

    // Calculate the scale based on the video size
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
        color: 'white',
        x: this.overlayText.nativeElement.offsetLeft,
        y: this.overlayText.nativeElement.offsetTop,
        scale,
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
