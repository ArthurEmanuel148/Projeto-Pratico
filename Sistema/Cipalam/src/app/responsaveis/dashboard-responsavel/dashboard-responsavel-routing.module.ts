import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardResponsavelPage } from './dashboard-responsavel.page';

const routes: Routes = [
  {
    path: '',
    component: DashboardResponsavelPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardResponsavelPageRoutingModule {}
