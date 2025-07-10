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
        path: 'painel-funcionario',
        loadChildren: () => import('../painel-funcionario/painel-funcionario.module').then(m => m.PainelFuncionarioPageModule),
        canActivate: [RoleGuard],
        data: { requiredRole: ['admin', 'professor', 'funcionario'] }
      },
      {
        path: 'painel',
        loadChildren: () => import('../painel-funcionario/painel-funcionario.module').then(m => m.PainelFuncionarioPageModule),
        canActivate: [RoleGuard],
        data: { requiredRole: ['admin', 'professor', 'funcionario'] }
      },
      {
        path: 'gerenciamento-funcionarios',
        loadChildren: () => import('../funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module').then(m => m.GerenciamentoFuncionariosModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'gerenciamentoFuncionarios' }
      },
      {
        path: 'interesse-matricula',
        loadChildren: () => import('../funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'declaracoesInteresse' }
      },
      {
        path: 'dashboard-responsavel',
        loadChildren: () => import('../dashboard-responsavel/dashboard-responsavel.module').then(m => m.DashboardResponsavelPageModule),
        canActivate: [RoleGuard],
        data: { requiredRole: 'responsavel' }
      },
      {
        path: '',
        component: PainelLayoutComponent,
        canActivate: [AuthGuard]
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaineisRoutingModule { }
