import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
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
    path: 'interesse-matricula', // URL pública
    loadChildren: () => import('./funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
