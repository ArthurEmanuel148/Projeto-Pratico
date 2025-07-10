import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl = 'http://localhost:8080/api';

  constructor() { }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  getPessoaUrl(): string {
    return `${this.baseUrl}/pessoa`;
  }

  getLoginUrl(): string {
    return `${this.baseUrl}/auth/login`;
  }

  getLoginResponsavelUrl(): string {
    return `${this.baseUrl}/auth/login-responsavel`;
  }

  getCadastroCompletoUrl(): string {
    return `${this.baseUrl}/pessoa/cadastro-completo`;
  }

  getCadastroFuncionarioUrl(): string {
    return `${this.baseUrl}/pessoa/cadastro-funcionario`;
  }

  getFuncionalidadesUrl(): string {
    return `${this.baseUrl}/funcionalidades`;
  }
}
