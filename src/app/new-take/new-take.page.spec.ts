import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NewTakePage } from './new-take.page';

describe('NewTakePage', () => {
  let component: NewTakePage;
  let fixture: ComponentFixture<NewTakePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewTakePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NewTakePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
