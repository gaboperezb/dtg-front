import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCommentPage } from './add-comment.page';

describe('AddCommentPage', () => {
  let component: AddCommentPage;
  let fixture: ComponentFixture<AddCommentPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCommentPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCommentPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
