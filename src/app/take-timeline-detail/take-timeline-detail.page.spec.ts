import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TakeTimelineDetailPage } from './take-timeline-detail.page';

describe('TimelineDetailPage', () => {
  let component: TakeTimelineDetailPage;
  let fixture: ComponentFixture<TakeTimelineDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeTimelineDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TakeTimelineDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
