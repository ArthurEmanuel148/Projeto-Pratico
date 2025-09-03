import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ListaTiposDocumentosPage } from './lista-tipos-documentos.page';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: ListaTiposDocumentosPage
            }
        ])
    ]
})
export class ListaTiposDocumentosPageModule { }
