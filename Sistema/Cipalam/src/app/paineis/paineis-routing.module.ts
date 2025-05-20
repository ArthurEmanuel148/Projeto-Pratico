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
        path: 'gerenciamento-funcionarios',
        loadChildren: () => import('../funcionalidades/gerenciamento-funcionarios/gerenciamento-funcionarios.module').then(m => m.GerenciamentoFuncionariosModule)
      },
      
      
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PaineisRoutingModule { }
