import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { GerenciamentoTurmasRoutingModule } from './gerenciamento-turmas-routing.module';

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        GerenciamentoTurmasRoutingModule
    ],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class GerenciamentoTurmasModule { }
