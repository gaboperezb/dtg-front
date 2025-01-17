import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TriviaTimelineDetailPageRoutingModule } from './trivia-timeline-detail-routing.module';

import { TriviaTimelineDetailPage } from './trivia-timeline-detail.page';
import { TriviaAnswerItemComponent } from './trivia-answer-item.component';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    SharedModule,
    IonicModule,
    TriviaTimelineDetailPageRoutingModule
  ],
  declarations: [TriviaTimelineDetailPage, TriviaAnswerItemComponent]
})
export class TriviaTimelineDetailPageModule {}
