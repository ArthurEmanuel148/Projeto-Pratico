import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RevisaoCadastroFuncionarioPage } from './revisao-cadastro-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: RevisaoCadastroFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RevisaoCadastroFuncionarioPageRoutingModule {}
