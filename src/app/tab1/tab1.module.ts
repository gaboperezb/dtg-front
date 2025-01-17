import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Tab1Page } from './tab1.page';
import { SharedModule } from '../shared/shared.module';
import { TakesComponent } from './takes.component';
import { TakeItemComponent } from './take-item.component';
import { InViewportModule } from 'ng-in-viewport';
import { PlayComponent } from './play.component';
import { TriviaItemComponent } from './trivia-item.component';
import { PickItemComponent } from './pick-item.component';

@NgModule({
  imports: [
    IonicModule,
    InViewportModule,
    CommonModule,
    SharedModule,
    FormsModule,
    RouterModule.forChild([{ path: '', component: Tab1Page }])
  ],
  declarations: [Tab1Page, TakesComponent, TakeItemComponent, PlayComponent, TriviaItemComponent, PickItemComponent]
})
export class Tab1PageModule {}
