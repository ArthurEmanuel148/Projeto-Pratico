import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelLayoutComponent } from '../painel-funcionario/components/painel-layout/painel-layout.component';
import { AuthGuard } from '../core/services/auth.guard';

const routes: Routes = [
  {
    path: '',
    component: PainelLayoutComponent,
    canActivate: [AuthGuard],
    children: [
      {
        path: 'painel-funcionario',
        loadChildren: () => import('../painel-funcionario/painel-funcionario.module').then(m => m.PainelFuncionarioPageModule)
      },
      {
        path: 'painel',
        loadChildren: () => import('../painel-funcionario/painel-funcionario.module').then(m => m.PainelFuncionarioPageModule)
      },
      {
        path: 'gerenciamento-funcionarios',
        loadChildren: () => import('../funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module').then(m => m.GerenciamentoFuncionariosModule)
      },
      {
        path: 'interesse-matricula',
        loadChildren: () => import('../funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule)
      },
      {
        path: '',
        redirectTo: 'painel-funcionario',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaineisRoutingModule { }
