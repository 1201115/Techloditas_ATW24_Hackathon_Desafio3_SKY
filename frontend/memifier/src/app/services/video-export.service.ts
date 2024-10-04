import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class VideoExportService {
  private readonly apiUrl = 'http://192.168.65.195:5000'; // Your Python API URL

  constructor(private readonly http: HttpClient) {}

  exportVideo(
    videoFile: File,
    exportType: string,
    texts: { text: string; color: string; x: number; y: number }[]
  ): Observable<Blob> {
    const formData = new FormData();
    formData.append('video', videoFile);
    formData.append('data', JSON.stringify({ exportType, texts }));

    return this.http.post(`${this.apiUrl}/export-video`, formData, { responseType: 'blob' });
  }

  exportImage(
    imageFile: File,
    texts: { text: string; color: string; x: number; y: number; fontSize: number }[]
  ): Observable<Blob> {
    const formData = new FormData();
    formData.append('image', imageFile);
    formData.append('data', JSON.stringify({ texts }));

    return this.http.post(`${this.apiUrl}/export-image`, formData, { responseType: 'blob' });
  }
}
