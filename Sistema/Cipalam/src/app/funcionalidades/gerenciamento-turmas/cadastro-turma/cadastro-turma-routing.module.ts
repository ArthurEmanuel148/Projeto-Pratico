import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CadastroTurmaPage } from './cadastro-turma.page';

const routes: Routes = [
    {
        path: '',
        component: CadastroTurmaPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class CadastroTurmaPageRoutingModule { }
