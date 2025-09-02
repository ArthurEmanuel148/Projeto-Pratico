import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { CadastroTurmaPageRoutingModule } from './cadastro-turma-routing.module';
import { CadastroTurmaPage } from './cadastro-turma.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        CadastroTurmaPageRoutingModule
    ],
    declarations: [CadastroTurmaPage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class CadastroTurmaPageModule { }
