import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { TurmasRoutingModule } from './turmas-routing.module';
import { ListaTurmasPage } from './pages/lista-turmas/lista-turmas.page';
import { DetalheTurmaPage } from './pages/detalhe-turma/detalhe-turma.page';
import { DetalhesAlunoPage } from './pages/detalhes-aluno/detalhes-aluno.page';

@NgModule({
    declarations: [
        ListaTurmasPage,
        DetalheTurmaPage,
        DetalhesAlunoPage
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        TurmasRoutingModule
    ]
})
export class TurmasModule { }