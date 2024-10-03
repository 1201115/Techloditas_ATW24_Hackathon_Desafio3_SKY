// video-trimmer.component.ts
import { Component, ViewChild, ElementRef, OnInit } from '@angular/core';

@Component({
  selector: 'video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.css'],
})
export class VideoTrimmerComponent implements OnInit {
  @ViewChild('videoPlayer', { static: false }) videoPlayer!: ElementRef<HTMLVideoElement>;
  @ViewChild('timeline', { static: false }) timeline!: ElementRef<HTMLInputElement>;

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
        this.updateTimelineBackground();
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

  onTimelineChange(): void {
    this.videoPlayer.nativeElement.currentTime = this.currentTime;
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

  onTrimChange(): void {
    // Ensure trim start is before trim end
    if (this.trimStart >= this.trimEnd) {
      this.trimStart = this.trimEnd - 0.01;
    }
    // Sync the video player to start trimming range
    this.videoPlayer.nativeElement.currentTime = this.trimStart;
    this.updateTimelineBackground();
  }

  updateTimelineBackground(): void {
    // Calculate the percentage for trimStart and trimEnd based on the video duration
    const startPercentage = (this.trimStart / this.videoDuration) * 100;
    const endPercentage = (this.trimEnd / this.videoDuration) * 100;

    // Update the timeline's background to reflect the selected range
    this.timeline.nativeElement.style.background = `linear-gradient(
      to right,
      #ddd 0%,
      #ddd ${startPercentage}%,
      #4CAF50 ${startPercentage}%,
      #4CAF50 ${endPercentage}%,
      #ddd ${endPercentage}%,
      #ddd 100%
    )`;
  }

  saveTrimmedClip(): void {
    // Start and end values for the trim
    const start = this.trimStart;
    const end = this.trimEnd;

    console.log(`Trimmed clip: Start - ${start}s, End - ${end}s`);
    // Logic to actually trim and save the video clip can go here
  }
}
