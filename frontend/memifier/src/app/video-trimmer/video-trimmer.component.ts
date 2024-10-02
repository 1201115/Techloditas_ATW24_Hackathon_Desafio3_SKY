import { Component, Input, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.css'],
  standalone: true,
  imports: [CommonModule, FormsModule] // Import necessary modules
})
export class VideoTrimmerComponent {
  @Input() videoSrc: string | ArrayBuffer | null = null;
  @ViewChild('videoPlayer') videoPlayer!: ElementRef<HTMLVideoElement>;
  startTime: number = 0;
  endTime: number = 0;
  trimmedVideoSrc: string | null = null;

  trimVideo(): void {
    const videoElement = this.videoPlayer.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const trimmedChunks: BlobPart[] = [];

    if (context) {
      videoElement.currentTime = this.startTime;
      videoElement.play();

      videoElement.addEventListener('timeupdate', () => {
        if (videoElement.currentTime >= this.endTime) {
          videoElement.pause();
          const blob = new Blob(trimmedChunks, { type: 'video/mp4' });
          this.trimmedVideoSrc = URL.createObjectURL(blob);
        } else {
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
          canvas.toBlob((blob) => {
            if (blob) {
              trimmedChunks.push(blob);
            }
          }, 'video/mp4');
        }
      });
    }
  }
}