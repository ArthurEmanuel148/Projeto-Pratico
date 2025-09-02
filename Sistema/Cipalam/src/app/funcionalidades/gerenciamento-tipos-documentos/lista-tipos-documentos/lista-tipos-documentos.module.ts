import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';

import { ListaTiposDocumentosPage } from './lista-tipos-documentos.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        RouterModule.forChild([
            {
                path: '',
                component: ListaTiposDocumentosPage
            }
        ])
    ],
    declarations: [ListaTiposDocumentosPage]
})
export class ListaTiposDocumentosPageModule { }
