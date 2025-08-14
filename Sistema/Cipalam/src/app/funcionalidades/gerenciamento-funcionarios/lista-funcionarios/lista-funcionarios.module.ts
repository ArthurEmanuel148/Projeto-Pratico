import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ListaFuncionariosPage } from './lista-funcionarios.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: ListaFuncionariosPage
            }
        ])
    ],
    declarations: [ListaFuncionariosPage]
})
export class ListaFuncionariosPageModule { }
