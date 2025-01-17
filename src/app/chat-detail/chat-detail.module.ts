import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { ChatDetailPage } from './chat-detail.page';
import { AutosizeModule } from 'ngx-autosize';
import { MessageComponent } from './message.component';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { SharedModule } from '../shared/shared.module';



const routes: Routes = [
  {
    path: '',
    component: ChatDetailPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SharedModule,
    NgxLinkifyjsModule,
    AutosizeModule,
    RouterModule.forChild(routes)
  ],
  declarations: [ChatDetailPage, MessageComponent]
})
export class ChatDetailPageModule {}
