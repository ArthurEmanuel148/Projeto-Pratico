import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalheDeclaracaoPageRoutingModule } from './detalhe-declaracao-routing.module';

import { DetalheDeclaracaoPage } from './detalhe-declaracao.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalheDeclaracaoPageRoutingModule
  ],
  declarations: [DetalheDeclaracaoPage]
})
export class DetalheDeclaracaoPageModule {}
