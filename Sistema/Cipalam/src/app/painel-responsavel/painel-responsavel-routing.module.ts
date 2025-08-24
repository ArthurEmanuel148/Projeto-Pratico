import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PainelResponsavelPage } from './painel-responsavel.page';

const routes: Routes = [
  {
    path: '',
    component: PainelResponsavelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PainelResponsavelPageRoutingModule { }
