import { TestBed } from '@angular/core/testing';

import { VideoExportService } from './video-export.service';

describe('VideoExportService', () => {
  let service: VideoExportService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
