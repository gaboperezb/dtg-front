import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { IonicModule } from '@ionic/angular';

import { FollowersPage } from './followers.page';
import { FollowersItemComponent } from './followers-item.component';


const routes: Routes = [
  {
    path: '',
    component: FollowersPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule.forChild(routes)
  ],
  declarations: [FollowersPage, FollowersItemComponent]
})
export class FollowersPageModule {}
