import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ConfiguracaoDocumentosCotaRoutingModule } from './configuracao-documentos-cota-routing.module';
import { ConfiguracaoDocumentosCotaPage } from './configuracao-documentos-cota.page';

@NgModule({
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        IonicModule,
        ConfiguracaoDocumentosCotaRoutingModule
    ],
    declarations: [ConfiguracaoDocumentosCotaPage]
})
export class ConfiguracaoDocumentosCotaModule { }
