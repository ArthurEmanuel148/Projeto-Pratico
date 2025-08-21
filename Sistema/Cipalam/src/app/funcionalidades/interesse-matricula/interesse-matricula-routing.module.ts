import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'declaracoes',
    pathMatch: 'full'
  },
  {
    path: 'declaracao-interesse',
    loadChildren: () => import('./pages/declaracao-interesse/declaracao-interesse.module').then(m => m.DeclaracaoInteressePageModule)
  },
  {
    path: 'nova-declaracao', // Rota em português
    loadChildren: () => import('./pages/declaracao-interesse/declaracao-interesse.module').then(m => m.DeclaracaoInteressePageModule)
  },
  {
    path: 'lista-declaracoes', // Página administrativa - pode precisar de auth
    loadChildren: () => import('./pages/lista-declaracoes/lista-declaracoes.module').then(m => m.ListaDeclaracoesPageModule)
  },
  {
    path: 'declaracoes', // Rota em português
    loadChildren: () => import('./pages/lista-declaracoes/lista-declaracoes.module').then(m => m.ListaDeclaracoesPageModule)
  },
  {
    path: 'detalhe-declaracao/:protocolo', // :protocolo é um parâmetro dinâmico
    loadChildren: () => import('./pages/detalhe-declaracao/detalhe-declaracao.module').then(m => m.DetalheDeclaracaoPageModule)
  },
  {
    path: 'configuracao-documentos',
    loadChildren: () => import('./pages/configuracao-documentos/configuracao-documentos.module').then(m => m.ConfiguracaoDocumentosPageModule)
  },
  {
    path: 'configurar-documentos', // Rota em português
    loadChildren: () => import('./pages/configuracao-documentos/configuracao-documentos.module').then(m => m.ConfiguracaoDocumentosPageModule)
  },
  {
    path: 'inicio-matricula',
    loadChildren: () => import('./pages/inicio-matricula/inicio-matricula.module').then(m => m.InicioMatriculaPageModule)
  }



  // Você poderia adicionar outras rotas de nível superior desta funcionalidade aqui, se necessário
  // Ex: { path: 'status', component: AlgumComponenteDeStatus }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InteresseMatriculaRoutingModule { }