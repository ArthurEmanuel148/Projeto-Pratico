import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CriarAdvertenciaPageRoutingModule } from './criar-advertencia-routing.module';

import { CriarAdvertenciaPage } from './criar-advertencia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CriarAdvertenciaPageRoutingModule
  ],
  declarations: [CriarAdvertenciaPage]
})
export class CriarAdvertenciaPageModule {}
