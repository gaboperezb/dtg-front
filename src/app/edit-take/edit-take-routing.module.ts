import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EditTakePage } from './edit-take.page';

const routes: Routes = [
  {
    path: '',
    component: EditTakePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EditTakePageRoutingModule {}
