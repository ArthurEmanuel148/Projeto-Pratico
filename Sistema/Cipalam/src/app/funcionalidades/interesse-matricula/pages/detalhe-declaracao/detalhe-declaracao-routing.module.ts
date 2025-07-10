import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DetalheDeclaracaoPage } from './detalhe-declaracao.page';

const routes: Routes = [
  {
    path: '',
    component: DetalheDeclaracaoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DetalheDeclaracaoPageRoutingModule {}
