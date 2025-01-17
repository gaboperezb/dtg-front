import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewThreadPage } from './new-thread.page';

describe('NewThreadPage', () => {
  let component: NewThreadPage;
  let fixture: ComponentFixture<NewThreadPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewThreadPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewThreadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
