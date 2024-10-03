import { Component } from '@angular/core';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
})
export class HomeComponent {
  currentStep = 1;
  responseData: string | null = null;
  responseType: 'video' | 'image' | null = null;
  

  nextStep() {
    if (this.currentStep < 3) {
      this.currentStep++;
    }
  }

  previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  onVideoTrimmed(videoUrl: string) {
    console.log('Video trimmed:', videoUrl);
    this.responseData = videoUrl;
    this.responseType = 'video';
    this.nextStep();
  }

  onFrameCaptured(frameUrl: string) {
    console.log('Frame captured:', frameUrl);
    this.responseData = frameUrl;
    this.responseType = 'image';
    this.nextStep();
  }
}
