import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
    },
    {
        path: 'lista',
        loadChildren: () => import('./lista-tipos-documentos/lista-tipos-documentos.module').then(m => m.ListaTiposDocumentosPageModule)
    },
    {
        path: 'cadastro',
        loadChildren: () => import('./cadastro-tipo-documento/cadastro-tipo-documento.module').then(m => m.CadastroTipoDocumentoPageModule)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GerenciamentoTiposDocumentosRoutingModule { }
