// src/app/funcionalidades/gerenciamento-funcionarios/cadastro-funcionario/cadastro-funcionario.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // << IMPORTANTE: Importe ReactiveFormsModule
import { IonicModule } from '@ionic/angular';
import { CadastroFuncionarioPageRoutingModule } from './cadastro-funcionario-routing.module';
import { CadastroFuncionarioPage } from './cadastro-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // Mantenha se usar ngModel em algum lugar neste módulo
    ReactiveFormsModule, // << IMPORTANTE: Adicione aqui para [formGroup] e formControlName
    IonicModule,
    CadastroFuncionarioPageRoutingModule
  ],
  declarations: [CadastroFuncionarioPage]
})
export class CadastroFuncionarioPageModule { }
