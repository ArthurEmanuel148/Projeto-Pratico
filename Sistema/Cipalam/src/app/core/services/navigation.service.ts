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
  ) {}

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
        // Administrador vai para o painel completo de funcionário
        console.log('Redirecionando administrador para painel de funcionário');
        this.router.navigate(['/paineis/painel-funcionario']);
        break;
        
      case 'professor':
      case 'funcionario':
        // Professores/funcionários vão para o painel de funcionário (com suas permissões)
        console.log('Redirecionando professor/funcionário para painel de funcionário');
        this.router.navigate(['/paineis/painel-funcionario']);
        break;
        
      case 'responsavel':
        // Responsáveis vão para o dashboard específico deles
        console.log('Redirecionando responsável para dashboard específico');
        this.router.navigate(['/paineis/dashboard-responsavel']);
        break;
        
      default:
        // Se não identificar o tipo, redireciona para login
        console.warn('Tipo de usuário não identificado:', userType, 'Redirecionando para login');
        this.router.navigate(['/login']);
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
        // Responsáveis só podem estar no dashboard-responsavel
        return currentUrl.includes('dashboard-responsavel');
        
      case 'admin':
      case 'professor':
      case 'funcionario':
        // Estes tipos não podem estar no dashboard-responsavel
        return !currentUrl.includes('dashboard-responsavel');
        
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
