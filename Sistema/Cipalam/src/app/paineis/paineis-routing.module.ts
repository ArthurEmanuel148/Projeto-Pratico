import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelLayoutComponent } from '../painel-funcionario/components/painel-layout/painel-layout.component';
import { AuthGuard } from '../core/services/auth.guard';
import { RoleGuard } from '../core/services/role.guard';

const routes: Routes = [
  {
    path: '',
    component: PainelLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadChildren: () => import('../painel-funcionario/painel-funcionario.module').then(m => m.PainelFuncionarioPageModule),
        canActivate: [RoleGuard],
        data: { requiredRole: ['admin', 'professor', 'funcionario'] }
      },
      {
        path: 'responsavel',
        loadChildren: () => import('../painel-responsavel/painel-responsavel.module').then(m => m.PainelResponsavelPageModule),
        canActivate: [RoleGuard],
        data: { requiredRole: ['responsavel'] }
      },
      {
        path: 'funcionarios',
        loadChildren: () => import('../funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module').then(m => m.GerenciamentoFuncionariosModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'gerenciamentoFuncionarios' }
      },
      {
        path: 'turmas',
        loadChildren: () => import('../funcionalidades/gerenciamento-turmas/gerenciamento-turmas.module').then(m => m.GerenciamentoTurmasModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'turmas' }
      },
      {
        path: 'matriculas',
        loadChildren: () => import('../funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'declaracoesInteresse' }
      },
      {
        path: 'iniciar-matricula',
        loadChildren: () => import('../funcionalidades/iniciar-matricula/iniciar-matricula.module').then(m => m.IniciarMatriculaModule),
        canActivate: [RoleGuard],
        data: { requiredRole: ['admin', 'funcionario'] }
      },
      {
        path: 'documentos',
        loadComponent: () => import('../funcionalidades/gerenciamento-documentos/gerenciamento-documentos.page').then(m => m.GerenciamentoDocumentosPage),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'aprovacaoDocumentos' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaineisRoutingModule { }
