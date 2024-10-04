import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-export',
  templateUrl: './export.component.html',
  styleUrls: ['./export.component.css'],
})
export class ExportComponent {
  @Input() exportedUrl: string | null = null;
  @Input() mediaType: 'video' | 'image' | null = null;
}
