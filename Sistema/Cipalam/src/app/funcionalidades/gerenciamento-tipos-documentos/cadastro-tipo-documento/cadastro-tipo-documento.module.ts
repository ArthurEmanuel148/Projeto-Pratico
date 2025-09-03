import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CadastroTipoDocumentoPage } from './cadastro-tipo-documento.page';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: CadastroTipoDocumentoPage
            }
        ])
    ]
})
export class CadastroTipoDocumentoPageModule { }
