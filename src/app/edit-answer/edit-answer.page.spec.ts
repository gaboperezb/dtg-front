import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditAnswerPage } from './edit-answer.page';

describe('EditAnswerPage', () => {
  let component: EditAnswerPage;
  let fixture: ComponentFixture<EditAnswerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditAnswerPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditAnswerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
