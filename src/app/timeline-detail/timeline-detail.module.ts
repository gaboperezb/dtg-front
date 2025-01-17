import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { TimelineDetailPage } from './timeline-detail.page';
import { SharedModule } from '../shared/shared.module';
import { AnswerItemComponent } from './answer-item.component';

const routes: Routes = [
  {
    path: '',
    component: TimelineDetailPage
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
  declarations: [TimelineDetailPage, AnswerItemComponent]
})
export class TimelineDetailPageModule {}
