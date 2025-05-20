import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '', // Quando a URL for '/interesse-matricula' (definido no AppRoutingModule)
    // Carrega o módulo da PÁGINA 'declaracao-interesse' que contém o orquestrador
    loadChildren: () => import('./pages/declaracao-interesse/declaracao-interesse.module').then(m => m.DeclaracaoInteressePageModule)
  },
  {
    path: 'declaracao-interesse',
    loadChildren: () => import('./pages/declaracao-interesse/declaracao-interesse.module').then( m => m.DeclaracaoInteressePageModule)
  }
  // Você poderia adicionar outras rotas de nível superior desta funcionalidade aqui, se necessário
  // Ex: { path: 'status', component: AlgumComponenteDeStatus }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InteresseMatriculaRoutingModule { }