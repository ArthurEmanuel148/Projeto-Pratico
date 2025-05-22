import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'cadastro-funcionario',
    pathMatch: 'full'
  },
  {
    path: 'cadastro-funcionario',
    loadChildren: () => import('./cadastro-funcionario/cadastro-funcionario.module').then(m => m.CadastroFuncionarioPageModule)
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GerenciamentoFuncionariosRoutingModule { }
