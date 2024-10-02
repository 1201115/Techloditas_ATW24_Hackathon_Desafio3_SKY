import { Component, OnInit, ViewChild, ElementRef, Input, ChangeDetectorRef, Output, EventEmitter, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderClipComponent } from '../slider-clip/slider-clip.component';

declare var MediaRecorder: any;

@Component({
  selector: 'video-trimmer',
  templateUrl: './video-trimmer.component.html',
  styleUrls: ['./video-trimmer.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, SliderClipComponent]
})
export class VideoTrimmerComponent implements OnInit, AfterViewInit {

  private mediaSource = new MediaSource();
  private stream: any;
  private mediaRecorder: any;
  private recordedBlobs: any;
  private sourceBuffer: any;
  private superBuffer: any;

  private initTime = 0;
  private lastTime = 4;

  enableRecord = false;

  @ViewChild('video') video!: ElementRef<HTMLVideoElement>;
  //@ViewChild('video2') video2:ElementRef<HTMLVideoElement>;

  @Input('source') source!: string;

  @Output('base64') base64: EventEmitter<any> = new EventEmitter();

  duration = 0;

  constructor(
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    
  }

  ngAfterViewInit(): void {
    this.mediaSource.addEventListener('sourceopen', this.handleSourceOpen, false);
    this.video.nativeElement.ontimeupdate = () => {
      console.log("current", this.video.nativeElement.currentTime, this.lastTime);
      if (this.lastTime && this.video.nativeElement.currentTime >= this.lastTime) {
        this.video.nativeElement.pause();
        if (this.enableRecord) {
          this.stopRecording();
          this.enableRecord = false;
          this.cdr.detectChanges();
        }
      }
    }
    (window as any)['video'] = this.video;
    this.video.nativeElement.onloadeddata = () => {
      console.log("dectectChanges", this.video.nativeElement.duration);
      this.duration = this.video.nativeElement.duration;
      this.cdr.detectChanges();
    }
  }

  play() {
    this.video.nativeElement.currentTime = this.initTime;
    this.video.nativeElement.play();
    if (this.enableRecord) {
      this.startRecording();
    }
  }

  trimVideo(): void {
    const videoElement = this.video.nativeElement;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    const trimmedChunks: BlobPart[] = [];

    if (context) {
      videoElement.currentTime = this.initTime;
      videoElement.play();

      videoElement.addEventListener('timeupdate', () => {
        if (videoElement.currentTime >= this.lastTime) {
          videoElement.pause();
          const blob = new Blob(trimmedChunks, { type: 'video/mp4' });
          const trimmedVideoSrc = URL.createObjectURL(blob);

          // Download the trimmed video
          const a = document.createElement('a');
          a.href = trimmedVideoSrc;
          a.download = 'trimmed-video.mp4';
          a.click();

          // Clean up the object URL
          URL.revokeObjectURL(trimmedVideoSrc);
        } else {
          // Set canvas dimensions to match the video
          canvas.width = videoElement.videoWidth;
          canvas.height = videoElement.videoHeight;

          // Draw the current frame of the video onto the canvas
          context.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

          // Convert the canvas content to a Blob and add it to the trimmedChunks array
          canvas.toBlob((blob) => {
            if (blob) {
              trimmedChunks.push(blob);
            }
          }, 'video/mp4');
        }
      });
    }
  }

  setTimeInit(value: any) {
    if (this.video && this.video.nativeElement.duration) {
      this.initTime = value;
      console.log("value", this.initTime);
      this.video.nativeElement.currentTime = this.initTime;
    }
  }

  setTimeLast(value: any) {
    let timeFinish = value;
    this.lastTime = timeFinish;
  }

  handleSourceOpen() {
    this.sourceBuffer = this.mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
  }

  handleDataAvailable(event: any) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  }

  handleStop(event: any) {
    console.log('Recorder stopped: ', event);
    this.superBuffer = new Blob(this.recordedBlobs, { type: 'video/webm' });
    //this.video2.nativeElement.src = window.URL.createObjectURL(this.superBuffer);
    var reader = new FileReader();
    reader.readAsDataURL(this.superBuffer);
    reader.onloadend = () => {
      let base64data = reader.result;
      this.base64.emit(base64data);
    }

  }

  startRecording() {
    let options = { mimeType: 'video/webm' };
    this.recordedBlobs = [];
    if ((<any>this.video.nativeElement).captureStream) {
      this.stream = (<any>this.video.nativeElement).captureStream();
    } else if ((<any>this.video.nativeElement).mozCaptureStream) {
      this.stream = (<any>this.video.nativeElement).mozCaptureStream();
    }
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e0) {
      console.log('Unable to create MediaRecorder with options Object: ', e0);
      try {
        options = { mimeType: 'video/webm,codecs=vp9' };
        this.mediaRecorder = new MediaRecorder(this.stream, options);
      } catch (e1) {
        console.log('Unable to create MediaRecorder with options Object: ', e1);
        try {
          options = <any>'video/vp8'; // Chrome 47
          this.mediaRecorder = new MediaRecorder(this.stream, options);
        } catch (e2) {
          alert('MediaRecorder is not supported by this browser.\n\n' +
            'Try Firefox 29 or later, or Chrome 47 or later, ' +
            'with Enable experimental Web Platform features enabled from chrome://flags.');
          console.error('Exception while creating MediaRecorder:', e2);
          return;
        }
      }
    }
    console.log('Created MediaRecorder', this.mediaRecorder, 'with options', options);
    this.mediaRecorder.onstop = (event: any) => {
      this.handleStop(event);
    };
    this.mediaRecorder.ondataavailable = (event: any) => {
      this.handleDataAvailable(event);
    };
    this.mediaRecorder.start(100); // collect 100ms of data
    console.log('MediaRecorder started', this.mediaRecorder);
  }

  stopRecording() {
    this.mediaRecorder.stop();
    console.log('Recorded Blobs: ', this.recordedBlobs);
    //this.video2.nativeElement.controls = true;
  }

}
