import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PainelFuncionarioPage } from './painel-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: PainelFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PainelFuncionarioPageRoutingModule { }
