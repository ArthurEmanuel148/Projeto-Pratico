import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TiposDocumentoPage } from './tipos-documento.page';

const routes: Routes = [
  {
    path: '',
    component: TiposDocumentoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TiposDocumentoPageRoutingModule {}
