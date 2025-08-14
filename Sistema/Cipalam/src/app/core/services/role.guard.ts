import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  canActivate(route: ActivatedRouteSnapshot): boolean {
    // Verificar se está logado
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    // Obter funcionalidade requerida da rota
    const requiredRole = route.data['requiredRole'];
    const requiredPermission = route.data['requiredPermission'];

    const usuario = this.authService.getFuncionarioLogado();

    if (!usuario) {
      this.router.navigate(['/login']);
      return false;
    }

    // Se for verificação por tipo de usuário
    if (requiredRole) {
      if (this.hasRequiredRole(usuario.tipo || '', requiredRole)) {
        return true;
      } else {
        this.redirectToAuthorizedPage(usuario.tipo || '');
        return false;
      }
    }

    // Se for verificação por permissão específica
    if (requiredPermission) {
      const permissions = this.authService.getPermissoesFuncionario();
      if (permissions[requiredPermission]) {
        return true;
      } else {
        this.redirectToAuthorizedPage(usuario.tipo || '');
        return false;
      }
    }

    return true;
  }

  private hasRequiredRole(userType: string, requiredRole: string | string[]): boolean {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    // Responsáveis só podem acessar funcionalidades de responsável
    if (userType === 'responsavel') {
      return roles.includes('responsavel');
    }

    // Admin tem acesso a qualquer funcionalidade EXCETO dashboard-responsavel
    if (userType === 'admin') {
      return !roles.includes('responsavel');
    }

    // Professor e funcionário seguem as regras normais
    return roles.includes(userType);
  }

  private redirectToAuthorizedPage(userType: string): void {
    switch (userType) {
      case 'admin':
        this.router.navigate(['/sistema/dashboard']);
        break;
      case 'professor':
      case 'funcionario':
        this.router.navigate(['/sistema/dashboard']);
        break;
      case 'responsavel':
        this.router.navigate(['/sistema/dashboard']);
        break;
      default:
        this.router.navigate(['/login']);
    }
  }
}
