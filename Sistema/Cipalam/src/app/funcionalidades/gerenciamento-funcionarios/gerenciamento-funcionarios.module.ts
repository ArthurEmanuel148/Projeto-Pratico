// src/app/funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { GerenciamentoFuncionariosRoutingModule } from './gerenciamento-funcionarios-routing.module';
import { PermissoesFuncionarioComponent } from './components/permissoes-funcionario/permissoes-funcionario.component';

@NgModule({
  declarations: [
    PermissoesFuncionarioComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    GerenciamentoFuncionariosRoutingModule
  ],
  
})
export class GerenciamentoFuncionariosModule { }