import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'entrada-publica',
    pathMatch: 'full'
  },
  {
    path: 'entrada-publica', // Página inicial pública
    loadChildren: () => import('./pages/entrada-publica/entrada-publica.module').then(m => m.EntradaPublicaPageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./funcionalidades/autenticacao/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'sistema',
    loadChildren: () => import('./paineis/paineis.module').then(m => m.PaineisModule)
  },
  {
    path: 'interesse-matricula', // URL pública - SEM autenticação
    loadChildren: () => import('./funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule)
  },
  {
    path: 'declaracao-publica', // Rota completamente pública para declaração
    loadChildren: () => import('./funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.module').then(m => m.DeclaracaoInteressePageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
