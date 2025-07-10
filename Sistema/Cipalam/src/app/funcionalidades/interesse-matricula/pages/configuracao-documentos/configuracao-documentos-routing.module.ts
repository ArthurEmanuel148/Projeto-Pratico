import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ConfiguracaoDocumentosPage } from './configuracao-documentos.page';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracaoDocumentosPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ConfiguracaoDocumentosPageRoutingModule {}
