import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalhamentoFuncionarioPage } from './detalhamento-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: DetalhamentoFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalhamentoFuncionarioPageRoutingModule {}
