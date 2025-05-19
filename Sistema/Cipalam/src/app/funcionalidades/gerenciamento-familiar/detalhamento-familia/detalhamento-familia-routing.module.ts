import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalhamentoFamiliaPage } from './detalhamento-familia.page';

const routes: Routes = [
  {
    path: '',
    component: DetalhamentoFamiliaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalhamentoFamiliaPageRoutingModule {}
