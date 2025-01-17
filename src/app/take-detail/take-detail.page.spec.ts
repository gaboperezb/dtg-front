import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TakeDetailPage } from './take-detail.page';

describe('TakeDetailPage', () => {
  let component: TakeDetailPage;
  let fixture: ComponentFixture<TakeDetailPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TakeDetailPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TakeDetailPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
