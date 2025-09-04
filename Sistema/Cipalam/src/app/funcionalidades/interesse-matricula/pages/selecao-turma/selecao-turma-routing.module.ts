import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SelecaoTurmaPage } from './selecao-turma.page';

const routes: Routes = [
  {
    path: '',
    component: SelecaoTurmaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SelecaoTurmaPageRoutingModule {}
