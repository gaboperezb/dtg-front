import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { NewTakePage } from './new-take.page';

const routes: Routes = [
  {
    path: '',
    component: NewTakePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class NewTakePageRoutingModule {}
