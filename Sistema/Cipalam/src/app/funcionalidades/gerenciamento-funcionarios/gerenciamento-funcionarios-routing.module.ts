import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'lista',
    pathMatch: 'full'
  },
  {
    path: 'lista',
    loadChildren: () => import('./lista-funcionarios/lista-funcionarios.module').then(m => m.ListaFuncionariosPageModule)
  },
  {
    path: 'cadastro',
    loadChildren: () => import('./cadastro-funcionario/cadastro-funcionario.module').then(m => m.CadastroFuncionarioPageModule)
  },
  {
    path: 'cadastro/:id',
    loadChildren: () => import('./cadastro-funcionario/cadastro-funcionario.module').then(m => m.CadastroFuncionarioPageModule)
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GerenciamentoFuncionariosRoutingModule { }
