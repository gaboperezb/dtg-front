import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFormPage } from './edit-form.page';

describe('EditFormPage', () => {
  let component: EditFormPage;
  let fixture: ComponentFixture<EditFormPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditFormPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditFormPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
