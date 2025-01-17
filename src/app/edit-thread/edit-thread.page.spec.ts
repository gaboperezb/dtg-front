import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditThreadPage } from './edit-thread.page';

describe('EditThreadPage', () => {
  let component: EditThreadPage;
  let fixture: ComponentFixture<EditThreadPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditThreadPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditThreadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
