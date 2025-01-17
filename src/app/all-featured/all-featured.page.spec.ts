import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllFeaturedPage } from './all-featured.page';

describe('AllFeaturedPage', () => {
  let component: AllFeaturedPage;
  let fixture: ComponentFixture<AllFeaturedPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllFeaturedPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllFeaturedPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
