import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'matricula-funcionario',
    pathMatch: 'full'
  },
  {
    path: 'matricula-funcionario',
    loadChildren: () => import('./pages/matricula-funcionario/matricula-funcionario.module').then(m => m.MatriculaFuncionarioPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IniciarMatriculaRoutingModule { }
