import { Component } from '@angular/core';
import { VideoUploadComponent } from '../video-upload/video-upload.component';
import { VideoTrimmerComponent } from '../video-trim/video-trimmer.component';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [VideoUploadComponent, VideoTrimmerComponent]
})
export class HomeComponent {
  videoSrc: string | ArrayBuffer | null = null;

  onVideoSelected(videoSrc: string | ArrayBuffer | null): void {
    this.videoSrc = videoSrc;
  }
}