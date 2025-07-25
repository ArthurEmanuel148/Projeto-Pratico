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
    path: 'paineis',
    loadChildren: () => import('./paineis/paineis.module').then(m => m.PaineisModule)
  },
  {
    path: 'interesse-matricula', // URL pública: seudominio.com/interesse-matricula
    loadChildren: () => import('./funcionalidades/interesse-matricula/interesse-matricula.module').then(m => m.InteresseMatriculaModule)
  },
  {
    path: 'dashboard-responsavel',
    loadChildren: () => import('./dashboard-responsavel/dashboard-responsavel.module').then(m => m.DashboardResponsavelPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
