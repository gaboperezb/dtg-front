import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SharePostPage } from './share-post.page';

describe('SharePostPage', () => {
  let component: SharePostPage;
  let fixture: ComponentFixture<SharePostPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SharePostPage ],
      schemas: [CUSTOM_ELEMENTS_SCHEMA],
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SharePostPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
