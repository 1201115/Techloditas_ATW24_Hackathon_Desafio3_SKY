// video-trimmer.component.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.css'],
})
export class VideoTrimmerComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;

  videoDuration = 0;
  currentTime = 0;
  trimStart = 0;
  trimEnd = 0;
  isVideoLoaded = false; // To control the visibility of the video and trim controls
  isPlaying = false; // To control play/pause state

  ngOnInit(): void {}

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const videoURL = URL.createObjectURL(file);
      this.videoPlayer.nativeElement.src = videoURL;
      this.isVideoLoaded = true;

      // Wait for the video metadata to load before getting the duration
      this.videoPlayer.nativeElement.onloadedmetadata = () => {
        this.videoDuration = this.videoPlayer.nativeElement.duration;
        this.trimEnd = this.videoDuration; // Set trim end to the full duration initially
      };
    }
  }

  onVideoTimeUpdate(event: any): void {
    this.currentTime = this.videoPlayer.nativeElement.currentTime;
    if (this.videoPlayer.nativeElement.ended) {
      this.isPlaying = false;
    }
  }

  onTimelineChange(): void {
    this.videoPlayer.nativeElement.currentTime = this.currentTime;
  }

  togglePlayPause(): void {
    const video = this.videoPlayer.nativeElement;
    if (video.paused || video.ended) {
      video.play();
      this.isPlaying = true;
    } else {
      video.pause();
      this.isPlaying = false;
    }
  }

  onTrimChange(): void {
    // Ensure trim start is before trim end
    if (this.trimStart >= this.trimEnd) {
      this.trimStart = this.trimEnd - 0.01;
    }

    // Optionally sync the video player to start trimming range
    this.videoPlayer.nativeElement.currentTime = this.trimStart;
  }

  saveTrimmedClip(): void {
    // Start and end values for the trim
    const start = this.trimStart;
    const end = this.trimEnd;

    console.log(`Trimmed clip: Start - ${start}s, End - ${end}s`);
    // Logic to actually trim and save the video clip can go here
  }
}
