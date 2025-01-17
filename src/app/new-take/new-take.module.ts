import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { NewTakePageRoutingModule } from './new-take-routing.module';

import { NewTakePage } from './new-take.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    NewTakePageRoutingModule
  ],
  declarations: [NewTakePage]
})
export class NewTakePageModule {}
