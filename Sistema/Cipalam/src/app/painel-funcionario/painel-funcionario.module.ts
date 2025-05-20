import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PainelFuncionarioPageRoutingModule } from './painel-funcionario-routing.module';

import { PainelFuncionarioPage } from './painel-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PainelFuncionarioPageRoutingModule
  ],
  declarations: [PainelFuncionarioPage]
})
export class PainelFuncionarioPageModule { }
