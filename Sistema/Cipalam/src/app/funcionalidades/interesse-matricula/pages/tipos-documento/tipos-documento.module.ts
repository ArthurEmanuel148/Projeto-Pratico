import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TiposDocumentoPageRoutingModule } from './tipos-documento-routing.module';

import { TiposDocumentoPage } from './tipos-documento.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TiposDocumentoPageRoutingModule
  ],
  declarations: [TiposDocumentoPage]
})
export class TiposDocumentoPageModule {}
