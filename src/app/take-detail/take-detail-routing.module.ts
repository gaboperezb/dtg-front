import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TakeDetailPage } from './take-detail.page';

const routes: Routes = [
  {
    path: '',
    component: TakeDetailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TakeDetailPageRoutingModule {}
