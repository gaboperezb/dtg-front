import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';
import { NewThreadPage } from './new-thread.page';


const routes: Routes = [
  {
    path: '',
    component: NewThreadPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [NewThreadPage]
})
export class NewThreadPageModule {}
