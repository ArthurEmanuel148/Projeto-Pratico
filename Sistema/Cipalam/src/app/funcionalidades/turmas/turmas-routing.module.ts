import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ListaTurmasPage } from './pages/lista-turmas/lista-turmas.page';
import { DetalheTurmaPage } from './pages/detalhe-turma/detalhe-turma.page';
import { DetalhesAlunoPage } from './pages/detalhes-aluno/detalhes-aluno.page';

const routes: Routes = [
    {
        path: '',
        component: ListaTurmasPage
    },
    {
        path: 'detalhe/:id',
        component: DetalheTurmaPage
    },
    {
        path: 'aluno/:id',
        component: DetalhesAlunoPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class TurmasRoutingModule { }