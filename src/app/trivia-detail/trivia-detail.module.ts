import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';


import { SharedModule } from '../shared/shared.module';
import { TriviaDetailPage } from './trivia-detail.page';
import { TriviaTimelineItemComponent } from './trivia-timeline-item.component';


const routes: Routes = [
  {
    path: '',
    component: TriviaDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TriviaDetailPage, TriviaTimelineItemComponent]
})
export class TriviaDetailPageModule {}
