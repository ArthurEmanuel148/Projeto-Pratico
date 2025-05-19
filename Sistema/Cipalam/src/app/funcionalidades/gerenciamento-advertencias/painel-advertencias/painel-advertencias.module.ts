import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PainelAdvertenciasPageRoutingModule } from './painel-advertencias-routing.module';

import { PainelAdvertenciasPage } from './painel-advertencias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PainelAdvertenciasPageRoutingModule
  ],
  declarations: [PainelAdvertenciasPage]
})
export class PainelAdvertenciasPageModule {}
