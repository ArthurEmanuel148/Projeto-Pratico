import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CadastroFuncionarioPageRoutingModule } from './cadastro-funcionario-routing.module';

import { CadastroFuncionarioPage } from './cadastro-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CadastroFuncionarioPageRoutingModule
  ],
  declarations: [CadastroFuncionarioPage]
})
export class CadastroFuncionarioPageModule {}
