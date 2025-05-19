import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SelecaoAlunosAdvertenciasPageRoutingModule } from './selecao-alunos-advertencias-routing.module';

import { SelecaoAlunosAdvertenciasPage } from './selecao-alunos-advertencias.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SelecaoAlunosAdvertenciasPageRoutingModule
  ],
  declarations: [SelecaoAlunosAdvertenciasPage]
})
export class SelecaoAlunosAdvertenciasPageModule {}
