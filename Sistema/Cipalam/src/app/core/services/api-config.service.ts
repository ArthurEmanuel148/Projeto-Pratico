import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ApiConfigService {
  private readonly baseUrl = environment.apiUrl;

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
