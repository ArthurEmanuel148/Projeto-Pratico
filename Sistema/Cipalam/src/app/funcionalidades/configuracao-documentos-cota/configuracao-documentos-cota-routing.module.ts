import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ConfiguracaoDocumentosCotaPage } from './configuracao-documentos-cota.page';

const routes: Routes = [
  {
    path: '',
    component: ConfiguracaoDocumentosCotaPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfiguracaoDocumentosCotaRoutingModule { }
