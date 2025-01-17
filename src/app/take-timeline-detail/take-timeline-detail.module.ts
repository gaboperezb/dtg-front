import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TakeTimelineDetailPage } from './take-timeline-detail.page';
import { SharedModule } from '../shared/shared.module';
import { AnswerItemComponent } from './take-answer-item.component';

const routes: Routes = [
  {
    path: '',
    component: TakeTimelineDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [TakeTimelineDetailPage, AnswerItemComponent]
})
export class TakeTimelineDetailPageModule {}
