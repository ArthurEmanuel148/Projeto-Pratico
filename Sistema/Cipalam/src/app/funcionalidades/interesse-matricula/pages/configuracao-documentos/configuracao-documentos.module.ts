import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ConfiguracaoDocumentosPageRoutingModule } from './configuracao-documentos-routing.module';

import { ConfiguracaoDocumentosPage } from './configuracao-documentos.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ConfiguracaoDocumentosPageRoutingModule
  ],
  declarations: [ConfiguracaoDocumentosPage]
})
export class ConfiguracaoDocumentosPageModule {}
