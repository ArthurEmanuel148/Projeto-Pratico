import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ListaTurmasPageRoutingModule } from './lista-turmas-routing.module';
import { ListaTurmasPage } from './lista-turmas.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        ListaTurmasPageRoutingModule
    ],
    declarations: [ListaTurmasPage],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class ListaTurmasPageModule { }
