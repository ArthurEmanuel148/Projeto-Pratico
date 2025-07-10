import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { InicioMatriculaPage } from './inicio-matricula.page';

const routes: Routes = [
  {
    path: '',
    component: InicioMatriculaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class InicioMatriculaPageRoutingModule {}
