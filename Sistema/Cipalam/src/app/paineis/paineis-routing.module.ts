import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PainelLayoutComponent } from './components/painel-layout/painel-layout.component';

const routes: Routes = [
  {
    path: '',
    component: PainelLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'painel-funcionario',
        pathMatch: 'full'

      },
      {
        path: 'painel-funcionario',
        loadChildren: () => import('../painel-funcionario/painel-funcionario.module').then(m => m.PainelFuncionarioPageModule)
      },
      {
        path: 'dashboard-responsavel',
        loadChildren: () => import('../dashboard-responsavel/dashboard-responsavel.module').then(m => m.DashboardResponsavelPageModule)
      },
      {
        path: 'gerenciamento-funcionarios',
        loadChildren: () => import('../funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module').then(m => m.GerenciamentoFuncionariosModule)
      },
      {
        path: 'interesse-matricula',
        loadChildren: () => import('../funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule)
      }
      
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaineisRoutingModule { }
