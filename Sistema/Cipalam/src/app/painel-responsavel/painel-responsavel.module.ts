import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PainelResponsavelPageRoutingModule } from './painel-responsavel-routing.module';

import { PainelResponsavelPage } from './painel-responsavel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PainelResponsavelPageRoutingModule
  ],
  declarations: [PainelResponsavelPage]
})
export class PainelResponsavelPageModule { }
