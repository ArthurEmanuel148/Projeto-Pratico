import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DeclaracaoInteressePage } from './declaracao-interesse.page';

const routes: Routes = [
  {
    path: '',
    component: DeclaracaoInteressePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DeclaracaoInteressePageRoutingModule {}
