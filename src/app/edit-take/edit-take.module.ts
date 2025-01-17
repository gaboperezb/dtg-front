import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { EditTakePageRoutingModule } from './edit-take-routing.module';

import { EditTakePage } from './edit-take.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    EditTakePageRoutingModule
  ],
  declarations: [EditTakePage]
})
export class EditTakePageModule {}
