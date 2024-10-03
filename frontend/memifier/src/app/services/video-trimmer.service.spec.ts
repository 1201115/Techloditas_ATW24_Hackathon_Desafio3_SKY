import { TestBed } from '@angular/core/testing';

import { VideoTrimmerService } from './video-trimmer.service';

describe('VideoTrimmerService', () => {
  let service: VideoTrimmerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VideoTrimmerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
