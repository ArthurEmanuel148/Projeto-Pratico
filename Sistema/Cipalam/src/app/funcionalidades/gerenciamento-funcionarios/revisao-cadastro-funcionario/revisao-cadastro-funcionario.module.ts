import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RevisaoCadastroFuncionarioPageRoutingModule } from './revisao-cadastro-funcionario-routing.module';

import { RevisaoCadastroFuncionarioPage } from './revisao-cadastro-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RevisaoCadastroFuncionarioPageRoutingModule
  ],
  declarations: [RevisaoCadastroFuncionarioPage]
})
export class RevisaoCadastroFuncionarioPageModule {}
