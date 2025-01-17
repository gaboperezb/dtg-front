import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TimelineDetailPage } from './timeline-detail.page';

describe('TimelineDetailPage', () => {
  let component: TimelineDetailPage;
  let fixture: ComponentFixture<TimelineDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TimelineDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TimelineDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
