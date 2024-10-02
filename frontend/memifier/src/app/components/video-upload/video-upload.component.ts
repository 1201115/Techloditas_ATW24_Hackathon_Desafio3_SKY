import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-video-upload',
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css'],
  standalone: true,
  imports: [CommonModule]
})
export class VideoUploadComponent {
  @Output() videoSelected = new EventEmitter<string | ArrayBuffer | null>();
  videoSrc: string | ArrayBuffer | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.videoSrc = reader.result;
        this.videoSelected.emit(this.videoSrc);
      };
      reader.readAsDataURL(file);
    }
  }
}