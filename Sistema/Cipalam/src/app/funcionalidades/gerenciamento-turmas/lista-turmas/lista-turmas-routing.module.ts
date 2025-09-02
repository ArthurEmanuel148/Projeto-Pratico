import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListaTurmasPage } from './lista-turmas.page';

const routes: Routes = [
    {
        path: '',
        component: ListaTurmasPage
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class ListaTurmasPageRoutingModule { }
