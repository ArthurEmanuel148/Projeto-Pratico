import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { DashboardResponsavelPageRoutingModule } from './dashboard-responsavel-routing.module';

import { DashboardResponsavelPage } from './dashboard-responsavel.page';
import { ResponsavelInfoHeaderComponent } from './components/responsavel-info-header.component';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    HttpClientModule,
    DashboardResponsavelPageRoutingModule
  ],
  declarations: [
    DashboardResponsavelPage,
    ResponsavelInfoHeaderComponent
  ]
})
export class DashboardResponsavelPageModule {}
