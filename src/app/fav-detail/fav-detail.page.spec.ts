import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FavDetailPage } from './fav-detail.page';

describe('FavDetailPage', () => {
  let component: FavDetailPage;
  let fixture: ComponentFixture<FavDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FavDetailPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FavDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
