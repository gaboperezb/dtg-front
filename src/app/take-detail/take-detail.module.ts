import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TakeDetailPageRoutingModule } from './take-detail-routing.module';

import { TakeDetailPage } from './take-detail.page';
import { TakeTimelineItemComponent } from './take-timeline-item.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TakeDetailPageRoutingModule
  ],
  declarations: [TakeDetailPage, TakeTimelineItemComponent]
})
export class TakeDetailPageModule {}
