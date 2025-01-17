import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { EditTakePage } from './edit-take.page';

describe('EditTakePage', () => {
  let component: EditTakePage;
  let fixture: ComponentFixture<EditTakePage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditTakePage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(EditTakePage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
