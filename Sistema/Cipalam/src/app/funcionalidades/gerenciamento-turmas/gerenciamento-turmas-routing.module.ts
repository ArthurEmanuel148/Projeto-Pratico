import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
    },
    {
        path: 'lista',
        loadChildren: () => import('./lista-turmas/lista-turmas.module').then(m => m.ListaTurmasPageModule)
    },
    {
        path: 'cadastro',
        loadChildren: () => import('./cadastro-turma/cadastro-turma.module').then(m => m.CadastroTurmaPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class GerenciamentoTurmasRoutingModule { }
