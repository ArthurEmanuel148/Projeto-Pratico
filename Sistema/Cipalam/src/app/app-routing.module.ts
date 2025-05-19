import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'painel-funcionario',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadChildren: () => import('./funcionalidades/autenticacao/login/login.module').then( m => m.LoginPageModule)
  },
  {
    path: 'painel-funcionario',
    loadChildren: () => import('./pages/painel-funcionario/painel-funcionario.module').then( m => m.PainelFuncionarioPageModule)
  },
  {
    path: 'dashboard',
    loadChildren: () => import('./pages/portal-responsavel/dashboard/dashboard.module').then( m => m.DashboardPageModule)
  },
  {
    path: 'detalhamento-funcionario',
    loadChildren: () => import('./funcionalidades/gerenciamento-funcionarios/detalhamento-funcionario/detalhamento-funcionario.module').then( m => m.DetalhamentoFuncionarioPageModule)
  },
  {
    path: 'cadastro-funcionario',
    loadChildren: () => import('./funcionalidades/gerenciamento-funcionarios/cadastro-funcionario/cadastro-funcionario.module').then( m => m.CadastroFuncionarioPageModule)
  },
  {
    path: 'revisao-cadastro-funcionario',
    loadChildren: () => import('./funcionalidades/gerenciamento-funcionarios/revisao-cadastro-funcionario/revisao-cadastro-funcionario.module').then( m => m.RevisaoCadastroFuncionarioPageModule)
  },
  {
    path: 'painel-advertencias',
    loadChildren: () => import('./funcionalidades/gerenciamento-advertencias/painel-advertencias/painel-advertencias.module').then( m => m.PainelAdvertenciasPageModule)
  },
  {
    path: 'selecao-alunos-advertencias',
    loadChildren: () => import('./funcionalidades/gerenciamento-advertencias/selecao-alunos-advertencias/selecao-alunos-advertencias.module').then( m => m.SelecaoAlunosAdvertenciasPageModule)
  },
  {
    path: 'criar-advertencia',
    loadChildren: () => import('./funcionalidades/gerenciamento-advertencias/criar-advertencia/criar-advertencia.module').then( m => m.CriarAdvertenciaPageModule)
  },
  {
    path: 'preview-advertencia',
    loadChildren: () => import('./funcionalidades/gerenciamento-advertencias/preview-advertencia/preview-advertencia.module').then( m => m.PreviewAdvertenciaPageModule)
  },
  {
    path: 'detalhamento-aluno',
    loadChildren: () => import('./funcionalidades/gerenciamento-alunos/detalhamento-aluno/detalhamento-aluno.module').then( m => m.DetalhamentoAlunoPageModule)
  },
  {
    path: 'detalhamento-familia',
    loadChildren: () => import('./funcionalidades/gerenciamento-familiar/detalhamento-familia/detalhamento-familia.module').then( m => m.DetalhamentoFamiliaPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
