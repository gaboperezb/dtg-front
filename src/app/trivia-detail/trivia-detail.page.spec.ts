import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TriviaDetailPage } from './trivia-detail.page';

describe('TriviaDetailPage', () => {
  let component: TriviaDetailPage;
  let fixture: ComponentFixture<TriviaDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TriviaDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TriviaDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
