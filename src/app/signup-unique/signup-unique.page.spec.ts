import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupUniquePage } from './signup-unique.page';

describe('SignupUniquePage', () => {
  let component: SignupUniquePage;
  let fixture: ComponentFixture<SignupUniquePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupUniquePage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupUniquePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
