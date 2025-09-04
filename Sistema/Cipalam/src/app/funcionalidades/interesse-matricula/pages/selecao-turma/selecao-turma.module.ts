import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { SelecaoTurmaPageRoutingModule } from './selecao-turma-routing.module';
import { SelecaoTurmaPage } from './selecao-turma.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        SelecaoTurmaPageRoutingModule
    ],
    declarations: [SelecaoTurmaPage]
})
export class SelecaoTurmaPageModule { }
