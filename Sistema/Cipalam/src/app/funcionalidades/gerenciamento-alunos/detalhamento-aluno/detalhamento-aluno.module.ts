import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalhamentoAlunoPageRoutingModule } from './detalhamento-aluno-routing.module';

import { DetalhamentoAlunoPage } from './detalhamento-aluno.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalhamentoAlunoPageRoutingModule
  ],
  declarations: [DetalhamentoAlunoPage]
})
export class DetalhamentoAlunoPageModule {}
