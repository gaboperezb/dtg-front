import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SignupGlobalPage } from './signup-global.page';

describe('SignupGlobalPage', () => {
  let component: SignupGlobalPage;
  let fixture: ComponentFixture<SignupGlobalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SignupGlobalPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupGlobalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
