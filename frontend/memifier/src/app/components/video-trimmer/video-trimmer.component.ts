// video-trimmer.component.ts
import { Component, ViewChild, ElementRef, HostListener, OnInit } from '@angular/core';

@Component({
  selector: 'video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.css'],
})
export class VideoTrimmerComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('timeline', { static: false }) timeline!: ElementRef<HTMLDivElement>; // Added reference to timeline

  videoDuration = 0;
  currentTime = 0;
  trimStart = 0;
  trimEnd = 0;
  isVideoLoaded = false;
  isPlaying = false;
  draggingHandle: 'start' | 'end' | null = null; // To track which handle is being dragged

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
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

    // Pause video automatically when it reaches trimEnd
    if (this.currentTime >= this.trimEnd) {
      this.videoPlayer.nativeElement.pause();
      this.isPlaying = false;
    }

    if (this.videoPlayer.nativeElement.ended) {
      this.isPlaying = false;
    }
  }

  togglePlayPause(): void {
    const video = this.videoPlayer.nativeElement;

    if (video.paused || video.ended) {
      // Set video to start from trimStart if it is outside the range
      if (video.currentTime < this.trimStart || video.currentTime >= this.trimEnd) {
        video.currentTime = this.trimStart;
      }
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  onDragStart(event: MouseEvent, handle: 'start' | 'end'): void {
    this.draggingHandle = handle;
  }

  @HostListener('window:mousemove', ['$event'])
  onDrag(event: MouseEvent): void {
    if (!this.draggingHandle) return;

    const timelineRect = this.timeline.nativeElement.getBoundingClientRect();
    const offsetX = event.clientX - timelineRect.left;
    const percentage = Math.max(0, Math.min(1, offsetX / timelineRect.width)); // Ensure percentage is between 0 and 1
    const newTime = percentage * this.videoDuration; // Convert percentage to actual video time

    if (this.draggingHandle === 'start') {
      this.trimStart = Math.min(newTime, this.trimEnd - 0.1); // Prevent trimStart from exceeding trimEnd
    } else if (this.draggingHandle === 'end') {
      this.trimEnd = Math.max(newTime, this.trimStart + 0.1); // Prevent trimEnd from going before trimStart
    }
  }

  @HostListener('window:mouseup')
  onDragEnd(): void {
    this.draggingHandle = null; // Reset dragging handle when the mouse is released
  }

  saveTrimmedClip(): void {
    console.log(`Trimmed clip: Start - ${this.trimStart}s, End - ${this.trimEnd}s`);
    // Logic to actually trim and save the video clip can go here
  }
}
