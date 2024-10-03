// video-trimmer.component.ts
import {
  Component,
  ViewChild,
  ElementRef,
  HostListener,
  OnInit,
} from '@angular/core';
import { VideoTrimmerService } from '../../services/video-trimmer.service';

@Component({
  selector: 'video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.css'],
})
export class VideoTrimmerComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false })
  videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('timeline', { static: false })
  timeline!: ElementRef<HTMLDivElement>; // Added reference to timeline

  videoDuration = 0;
  currentTime = 0;
  trimStart = 0;
  trimEnd = 0;
  isVideoLoaded = false;
  isPlaying = false;
  draggingHandle: 'start' | 'end' | 'needle' | null = null; // To track which handle is being dragged
  gifUrl: string | null = null; // Store the URL of the output GIF
  videoFile: File | null = null;
  isLoading = false; // Loading indicator

  constructor(private videoTrimmerService: VideoTrimmerService) {}

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.videoFile = file;
      const videoURL = URL.createObjectURL(file);
      this.videoPlayer.nativeElement.src = videoURL;
      this.isVideoLoaded = true;

      // Wait for video metadata to load before getting the duration
      this.videoPlayer.nativeElement.onloadedmetadata = () => {
        this.videoDuration = this.videoPlayer.nativeElement.duration;
        this.trimEnd = this.videoDuration; // Set trim end to the full duration initially
      };
    }
  }

  onVideoTimeUpdate(event: any): void {
    this.currentTime = this.videoPlayer.nativeElement.currentTime;

    // Force stop if the video passes the trimEnd
    if (this.currentTime >= this.trimEnd) {
      this.videoPlayer.nativeElement.pause();
      this.isPlaying = false;

      // Set the video time exactly to trimEnd to avoid overshooting
      this.videoPlayer.nativeElement.currentTime = this.trimEnd;
      this.currentTime = this.trimEnd;
    }

    if (this.videoPlayer.nativeElement.ended) {
      this.isPlaying = false;
    }
  }

  togglePlayPause(): void {
    const video = this.videoPlayer.nativeElement;

    if (video.paused || video.ended) {
      // Set video to start from trimStart if it is outside the range
      if (
        video.currentTime < this.trimStart ||
        video.currentTime >= this.trimEnd
      ) {
        video.currentTime = this.trimStart;
      }
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  onDragStart(event: MouseEvent | TouchEvent, handle: 'start' | 'end'): void {
    event.preventDefault(); // Prevent default touch behavior (like scrolling)

    // Check if it's a touch event and get the corresponding clientX
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    this.draggingHandle = handle;

    const handleElement = document.querySelector(`.handle.${handle}`);
    handleElement?.classList.add('dragging');

    // Call the drag function to immediately update the position on touch
    this.updateDragPosition(clientX);
  }

  @HostListener('window:mousemove', ['$event'])
  @HostListener('window:touchmove', ['$event'])
  onDrag(event: MouseEvent | TouchEvent): void {
    if (!this.draggingHandle) return;

    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;

    // Update only the respective element based on what's being dragged
    if (this.draggingHandle === 'needle') {
      this.onNeedleDrag(clientX); // Update needle and video time for preview
    } else {
      this.updateDragPosition(clientX); // Update trim handles without moving the needle
    }
  }

  onNeedleDrag(clientX: number): void {
    const timelineRect = this.timeline.nativeElement.getBoundingClientRect();
    const offsetX = clientX - timelineRect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / timelineRect.width));
    const newTime = percentage * this.videoDuration;

    // Move the needle and update the video’s currentTime to preview the frame
    this.currentTime = newTime;
    this.videoPlayer.nativeElement.currentTime = newTime;
  }

  updateDragPosition(clientX: number): void {
    const timelineRect = this.timeline.nativeElement.getBoundingClientRect();
    const offsetX = clientX - timelineRect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / timelineRect.width)); // Ensure percentage is between 0 and 1
    const newTime = percentage * this.videoDuration; // Convert percentage to actual video time

    if (this.draggingHandle === 'start') {
      this.trimStart = Math.min(newTime, this.trimEnd - 0.1); // Prevent trimStart from exceeding trimEnd
      //this.videoPlayer.nativeElement.currentTime = this.trimStart; // Update the video preview
    } else if (this.draggingHandle === 'end') {
      this.trimEnd = Math.max(newTime, this.trimStart + 0.1); // Prevent trimEnd from going before trimStart
      //this.videoPlayer.nativeElement.currentTime = this.trimEnd; // Update the video preview
    }
  }

  @HostListener('window:mouseup')
  @HostListener('window:touchend')
  onDragEnd(): void {
    // Remove the dragging class from all handles
    document
      .querySelectorAll('.dragging')
      .forEach((el) => el.classList.remove('dragging'));

    // Reset dragging state
    this.draggingHandle = null;
  }

  saveTrimmedClip(): void {
    console.log(
      `Trimmed clip: Start - ${this.trimStart}s, End - ${this.trimEnd}s`
    );
    // Logic to actually trim and save the video clip can go here
  }

  onNeedleDragStart(event: MouseEvent | TouchEvent): void {
    event.preventDefault(); // Prevent default touch behavior

    // Check if it's a touch event and get the corresponding clientX
    const clientX =
      event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;

    (event.target as HTMLElement).classList.add('dragging');

    // Start dragging the needle
    this.onNeedleDrag(clientX);
    this.draggingHandle = 'needle';
  }

  // Handle trim button click
  onTrimVideo(): void {
    if (this.videoFile && this.isVideoLoaded) {
      this.isLoading = true; // Set loading to true before the request

      this.videoTrimmerService
        .trimVideo(this.videoFile, this.trimStart, this.trimEnd)
        .subscribe(
          (blob) => {
            this.gifUrl = URL.createObjectURL(blob); // Store the GIF URL
            this.isLoading = false; // Remove loading indicator
          },
          (error) => {
            console.error('Error trimming the video:', error);
            this.isLoading = false; // Remove loading indicator
          }
        );
    }
  }
}
