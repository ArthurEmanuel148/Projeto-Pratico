import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PainelAdvertenciasPage } from './painel-advertencias.page';

const routes: Routes = [
  {
    path: '',
    component: PainelAdvertenciasPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PainelAdvertenciasPageRoutingModule {}
