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
        data: { requiredRole: ['admin', 'professor', 'funcionario', 'responsavel'] }
      },
      {
        path: 'funcionarios',
        loadChildren: () => import('../funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module').then(m => m.GerenciamentoFuncionariosModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'gerenciamentoFuncionarios' }
      },
      {
        path: 'matriculas',
        loadChildren: () => import('../funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule),
        canActivate: [RoleGuard],
        data: { requiredPermission: 'declaracoesInteresse' }
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaineisRoutingModule { }
