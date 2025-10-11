import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  constructor(
    private authService: AuthService,
    private router: Router
  ) { }

  /**
   * Redireciona o usuário para a página inicial apropriada baseada em seu tipo
   */
  redirectToHomePage(): void {
    const usuario = this.authService.getFuncionarioLogado();

    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const userType = usuario.tipo;
    console.log('Redirecionando usuário do tipo:', userType);

    switch (userType) {
      case 'admin':
        // Administrador vai para o dashboard do sistema
        console.log('Redirecionando administrador para dashboard');
        this.router.navigate(['/sistema/dashboard']);
        break;

      case 'professor':
      case 'funcionario':
        // Professores/funcionários vão para o dashboard (com suas permissões)
        console.log('Redirecionando professor/funcionário para dashboard');
        this.router.navigate(['/sistema/dashboard']);
        break;

      case 'responsavel':
        // Responsáveis vão para uma área específica com funcionalidades limitadas (SEM layout de funcionário)
        console.log('Redirecionando responsável para área de responsável');
        this.router.navigate(['/painel-responsavel']);
        break;

      default:
        // Se não identificar o tipo, redireciona para dashboard padrão
        console.warn('Tipo de usuário não identificado:', userType, 'Redirecionando para dashboard padrão');
        this.router.navigate(['/sistema/dashboard']);
        break;
    }
  }

  /**
   * Verifica se o usuário atual tem permissão para acessar uma funcionalidade
   */
  canAccess(permission: string): boolean {
    const permissions = this.authService.getPermissoesFuncionario();
    return permissions[permission] === true;
  }

  /**
   * Verifica se o usuário é de um tipo específico
   */
  isUserType(type: string | string[]): boolean {
    const usuario = this.authService.getFuncionarioLogado();
    if (!usuario) return false;

    const userType = usuario.tipo;
    const types = Array.isArray(type) ? type : [type];

    // Admin tem acesso como qualquer tipo EXCETO responsável
    if (userType === 'admin') {
      return !types.includes('responsavel');
    }

    return types.includes(userType || '');
  }

  /**
   * Verifica se o usuário está na URL correta para seu tipo
   */
  isUserInCorrectPanel(currentUrl: string): boolean {
    const usuario = this.authService.getFuncionarioLogado();
    if (!usuario) return false;

    const userType = usuario.tipo;

    switch (userType) {
      case 'responsavel':
      case 'admin':
      case 'professor':
      case 'funcionario':
        // Todos os usuários autenticados podem acessar o sistema
        return currentUrl.includes('/sistema/');

      default:
        return false;
    }
  }

  /**
   * Força o redirecionamento para o painel correto se o usuário estiver no lugar errado
   */
  enforceCorrectPanel(): void {
    const currentUrl = this.router.url;

    if (!this.isUserInCorrectPanel(currentUrl)) {
      console.warn('Usuário em painel incorreto. URL atual:', currentUrl);
      this.redirectToHomePage();
    }
  }
}
