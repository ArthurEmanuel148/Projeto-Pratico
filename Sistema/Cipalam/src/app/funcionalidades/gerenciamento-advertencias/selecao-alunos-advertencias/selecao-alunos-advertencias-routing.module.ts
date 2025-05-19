import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelecaoAlunosAdvertenciasPage } from './selecao-alunos-advertencias.page';

const routes: Routes = [
  {
    path: '',
    component: SelecaoAlunosAdvertenciasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelecaoAlunosAdvertenciasPageRoutingModule {}
