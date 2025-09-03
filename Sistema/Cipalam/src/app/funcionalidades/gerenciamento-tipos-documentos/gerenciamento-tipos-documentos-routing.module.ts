import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { RoleGuard } from '../../core/services/role.guard';

const routes: Routes = [
    {
        path: '',
        redirectTo: 'lista',
        pathMatch: 'full'
    },
    {
        path: 'lista',
        loadComponent: () => import('./lista-tipos-documentos/lista-tipos-documentos.page').then(m => m.ListaTiposDocumentosPage),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'listarTiposDocumento' }
    },
    {
        path: 'cadastro',
        loadComponent: () => import('./cadastro-tipo-documento/cadastro-tipo-documento.page').then(m => m.CadastroTipoDocumentoPage),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'cadastroTipoDocumento' }
    },
    {
        path: 'editar/:id',
        loadComponent: () => import('./cadastro-tipo-documento/cadastro-tipo-documento.page').then(m => m.CadastroTipoDocumentoPage),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'cadastroTipoDocumento' }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class GerenciamentoTiposDocumentosRoutingModule { }
