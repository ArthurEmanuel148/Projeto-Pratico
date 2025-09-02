import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { UploadDocumentosPageRoutingModule } from './upload-documentos-routing.module';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        IonicModule,
        UploadDocumentosPageRoutingModule
    ]
})
export class UploadDocumentosPageModule { }
