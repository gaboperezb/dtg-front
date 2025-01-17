import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TriviaTimelineDetailPage } from './trivia-timeline-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TriviaTimelineDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TriviaTimelineDetailPageRoutingModule {}
