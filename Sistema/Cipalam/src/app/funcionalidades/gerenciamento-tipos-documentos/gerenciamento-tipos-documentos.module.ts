import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { GerenciamentoTiposDocumentosRoutingModule } from './gerenciamento-tipos-documentos-routing.module';

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    GerenciamentoTiposDocumentosRoutingModule
  ]
})
export class GerenciamentoTiposDocumentosModule {}
