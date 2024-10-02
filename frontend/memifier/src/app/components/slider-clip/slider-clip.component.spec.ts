import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SliderClipComponent } from './slider-clip.component';

describe('SliderClipComponent', () => {
  let component: SliderClipComponent;
  let fixture: ComponentFixture<SliderClipComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ SliderClipComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(SliderClipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
