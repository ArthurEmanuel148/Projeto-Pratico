import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { MatriculaFuncionarioPage } from './matricula-funcionario.page';

const routes: Routes = [
  {
    path: '',
    component: MatriculaFuncionarioPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MatriculaFuncionarioPageRoutingModule { }
