import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TriviaTimelineDetailPage } from './trivia-timeline-detail.page';

describe('TriviaTimelineDetailPage', () => {
  let component: TriviaTimelineDetailPage;
  let fixture: ComponentFixture<TriviaTimelineDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriviaTimelineDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TriviaTimelineDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
