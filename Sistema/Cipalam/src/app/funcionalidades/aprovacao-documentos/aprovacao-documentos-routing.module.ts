import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./aprovacao-documentos.page').then(m => m.AprovacaoDocumentosPage)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class AprovacaoDocumentosPageRoutingModule { }
