import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

const routes: Routes = [
    {
        path: '',
        loadComponent: () => import('./upload-documentos.page').then(m => m.UploadDocumentosPage)
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule],
})
export class UploadDocumentosPageRoutingModule { }
