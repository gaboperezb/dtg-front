import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupAppPage } from './signup-app.page';

describe('SignupAppPage', () => {
  let component: SignupAppPage;
  let fixture: ComponentFixture<SignupAppPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupAppPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupAppPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
