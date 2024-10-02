import { Component } from '@angular/core';
import { SliderClipComponent } from '../slider-clip/slider-clip.component';
import { VideoTrimmerComponent } from '../video-trim/video-trimmer.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [CommonModule, SliderClipComponent, VideoTrimmerComponent]
})
export class HomeComponent {
  inputBase64!: string;
  outputBase64!: string;


  data(blobs: any) {
    console.log(blobs);
    this.outputBase64 = blobs;
  }

  async onInputChange(events: any) {
    try {
      if (!events?.target?.files?.length) return;
      this.inputBase64 = await this.getBase64(events.target.files[0]);
    } catch (error) {
      console.log(error);

    }
  }

  getBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      var reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = function () {
        resolve(reader.result as string);
      };
      reader.onerror = function (error) {
        reject(error);
      };
    })
  }
}