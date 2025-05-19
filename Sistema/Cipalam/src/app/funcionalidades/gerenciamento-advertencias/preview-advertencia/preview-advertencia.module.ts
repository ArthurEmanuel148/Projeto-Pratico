import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PreviewAdvertenciaPageRoutingModule } from './preview-advertencia-routing.module';

import { PreviewAdvertenciaPage } from './preview-advertencia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PreviewAdvertenciaPageRoutingModule
  ],
  declarations: [PreviewAdvertenciaPage]
})
export class PreviewAdvertenciaPageModule {}
