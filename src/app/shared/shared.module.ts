import { NgModule } from '@angular/core';

import { LikeThreadComponent } from './like-thread.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { SafeHtmlPipe } from '../safe-html.pipe';
import { ProfileTakeItemComponent } from './profile-take-item.component';
import { InViewportModule } from 'ng-in-viewport';


@NgModule({
  imports: [IonicModule,CommonModule, InViewportModule],
  declarations: [LikeThreadComponent, SafeHtmlPipe, ProfileTakeItemComponent],
  exports: [ LikeThreadComponent, SafeHtmlPipe, ProfileTakeItemComponent ]
})

export class SharedModule { }
