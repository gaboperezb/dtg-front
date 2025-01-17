import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ThreadDetailPage } from './thread-detail.page';
import { SharedModule } from '../shared/shared.module';
import { TimelineItemComponent } from './timeline-item.component';


const routes: Routes = [
  {
    path: '',
    component: ThreadDetailPage
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
  declarations: [ThreadDetailPage, TimelineItemComponent]
})
export class ThreadDetailPageModule {}
