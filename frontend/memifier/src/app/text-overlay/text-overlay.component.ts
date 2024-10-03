import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';

@Component({
  selector: 'text-overlay',
  templateUrl: './text-overlay.component.html',
  styleUrls: ['./text-overlay.component.css'],
})
export class TextOverlayComponent implements OnInit, AfterViewInit {
  @Input() mediaType: 'video' | 'image' | null = null;
  @Input() mediaSrc: string | null = null;
  text: string = '';
  isEditing: boolean = false;

  @ViewChild('textInput') textInput!: ElementRef;
  @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
  @ViewChild('overlayText') overlayText!: ElementRef;

  private isDragging = false;
  private startX = 0;
  private startY = 0;

  constructor() {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.isEditing) {
      this.textInput.nativeElement.focus();
    }
  }

  addText() {
    this.isEditing = true;
    setTimeout(() => {
      this.textInput.nativeElement.focus();
    }, 0);
  }

  saveText() {
    this.isEditing = false;
  }

  cancelText() {
    this.isEditing = false;
  }

  restartVideo(event: Event) {
    const videoElement = event.target as HTMLVideoElement;
    videoElement.currentTime = 0;
    videoElement.play();
  }

  startDrag(event: MouseEvent) {
    this.isDragging = true;
    this.startX = event.clientX - this.overlayText.nativeElement.offsetLeft;
    this.startY = event.clientY - this.overlayText.nativeElement.offsetTop;
    event.preventDefault();
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      this.overlayText.nativeElement.style.left = `${event.clientX - this.startX}px`;
      this.overlayText.nativeElement.style.top = `${event.clientY - this.startY}px`;
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
  }
}