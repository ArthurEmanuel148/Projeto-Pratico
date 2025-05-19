import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PreviewAdvertenciaPage } from './preview-advertencia.page';

const routes: Routes = [
  {
    path: '',
    component: PreviewAdvertenciaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PreviewAdvertenciaPageRoutingModule {}
