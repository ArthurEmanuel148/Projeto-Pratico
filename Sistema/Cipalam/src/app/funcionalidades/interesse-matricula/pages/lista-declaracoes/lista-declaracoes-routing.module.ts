import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaDeclaracoesPage } from './lista-declaracoes.page';

const routes: Routes = [
  {
    path: '',
    component: ListaDeclaracoesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListaDeclaracoesPageRoutingModule {}
