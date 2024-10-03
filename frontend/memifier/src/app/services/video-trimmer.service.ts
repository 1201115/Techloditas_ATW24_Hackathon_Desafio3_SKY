import { Injectable } from '@angular/core';
import { HttpClient, HttpEventType, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoTrimmerService {
  private apiUrl = 'http://localhost:5000'; // Your Python API URL

  constructor(private http: HttpClient) {}

  // Function to send the video and trim times to the API
  trimVideo(
    videoFile: File,
    trimStart: number,
    trimEnd: number
  ): Observable<Blob> {
    const formData = new FormData();
    formData.append('video', videoFile); // Append video file
    formData.append('trimStart', trimStart.toString()); // Append trim start time
    formData.append('trimEnd', trimEnd.toString()); // Append trim end time

    return this.http.post(`${this.apiUrl}/trim-to-gif`, formData, { responseType: 'blob' });
  }

  // Request a frame at a specific timestamp
  getFrameAtTime(videoFile: File, timestamp: number): Observable<Blob> {
    const formData = new FormData();
    formData.append('video', videoFile); // Append the video file
    formData.append('timestamp', timestamp.toString()); // Append the requested timestamp

    return this.http.post(`${this.apiUrl}/frame-at-time`, formData, {
      responseType: 'blob',
    });
  }
}
