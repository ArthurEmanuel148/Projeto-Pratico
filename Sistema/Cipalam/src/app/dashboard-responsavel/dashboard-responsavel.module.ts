import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardResponsavelPageRoutingModule } from './dashboard-responsavel-routing.module';

import { DashboardResponsavelPage } from './dashboard-responsavel.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    DashboardResponsavelPageRoutingModule
  ],
  declarations: [DashboardResponsavelPage]
})
export class DashboardResponsavelPageModule { }
