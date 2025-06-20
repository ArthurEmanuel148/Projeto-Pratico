import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Quando tiver backend, troque para buscar do backend
  getFuncionarioLogado(): any {
    const funcionario = sessionStorage.getItem('funcionarioLogado');
    return funcionario ? JSON.parse(funcionario) : null;
  }

  getPermissoesFuncionario(): Record<string, boolean> {
    const funcionario = this.getFuncionarioLogado();
    return funcionario && funcionario.permissoes ? funcionario.permissoes : {};
  }

  logout() {
    sessionStorage.removeItem('funcionarioLogado');
  }
}
