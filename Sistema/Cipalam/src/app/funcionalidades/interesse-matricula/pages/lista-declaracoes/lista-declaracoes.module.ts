import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListaDeclaracoesPageRoutingModule } from './lista-declaracoes-routing.module';

import { ListaDeclaracoesPage } from './lista-declaracoes.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListaDeclaracoesPageRoutingModule
  ],
  declarations: [ListaDeclaracoesPage]
})
export class ListaDeclaracoesPageModule {}
