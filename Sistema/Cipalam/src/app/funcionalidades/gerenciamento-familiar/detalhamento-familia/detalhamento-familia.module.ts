import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DetalhamentoFamiliaPageRoutingModule } from './detalhamento-familia-routing.module';

import { DetalhamentoFamiliaPage } from './detalhamento-familia.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DetalhamentoFamiliaPageRoutingModule
  ],
  declarations: [DetalhamentoFamiliaPage]
})
export class DetalhamentoFamiliaPageModule {}
