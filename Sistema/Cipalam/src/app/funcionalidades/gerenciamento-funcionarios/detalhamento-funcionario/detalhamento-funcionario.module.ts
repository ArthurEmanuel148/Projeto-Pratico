import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalhamentoFuncionarioPageRoutingModule } from './detalhamento-funcionario-routing.module';

import { DetalhamentoFuncionarioPage } from './detalhamento-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalhamentoFuncionarioPageRoutingModule
  ],
  declarations: [DetalhamentoFuncionarioPage]
})
export class DetalhamentoFuncionarioPageModule {}
