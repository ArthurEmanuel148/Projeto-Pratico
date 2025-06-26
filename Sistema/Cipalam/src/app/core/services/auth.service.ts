import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { ApiConfigService } from './api-config.service';

export interface LoginRequest {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  pessoa: {
    idPessoa: number;
    nmPessoa: string;
    cpfPessoa: string;
    caminhoImagem?: string;
    dtNascPessoa?: string;
    caminhoIdentidadePessoa?: string;
  };
  tipo: string;
  permissoes?: Record<string, boolean>;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private usuarioLogadoSubject = new BehaviorSubject<LoginResponse | null>(null);
  public usuarioLogado$ = this.usuarioLogadoSubject.asObservable();

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {
    // Verificar se há usuário logado no localStorage
    const usuarioSalvo = localStorage.getItem('usuarioLogado');
    if (usuarioSalvo) {
      this.usuarioLogadoSubject.next(JSON.parse(usuarioSalvo));
    }
  }

  login(usuario: string, senha: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { usuario, senha };

    return this.http.post<LoginResponse>(this.apiConfig.getLoginUrl(), loginRequest)
      .pipe(
        tap(response => {
          // Salvar usuário logado
          localStorage.setItem('usuarioLogado', JSON.stringify(response));
          this.usuarioLogadoSubject.next(response);
        })
      );
  }

  getFuncionarioLogado(): LoginResponse | null {
    return this.usuarioLogadoSubject.value;
  }

  getPermissoesFuncionario(): Record<string, boolean> {
    const funcionario = this.getFuncionarioLogado();
    if (funcionario) {
      // Se for admin, tem acesso a tudo
      if (funcionario.pessoa.nmPessoa === 'Administrador do Sistema' ||
          funcionario.tipo === 'admin') {
        return {
          'painel': true,
          'funcionarios': true,
          'cadastroFuncionario': true,
          'gerenciamentoFuncionarios': true,
          'matriculas': true,
          'declaracoesInteresse': true,
          'configurarDocumentosCota': true,
          'alunos': true,
          'cadastroAluno': true,
          'listaAlunos': true,
          'advertencias': true,
          'advertenciasGerais': true,
          'advertenciasRodaLeitura': true,
          'biblioteca': true,
          'emprestimoLivros': true,
          'catalogoLivros': true,
          'uniformes': true,
          'emprestimoUniformes': true,
          'estoqueUniformes': true,
          'administracao': true,
          'usuarios': true,
          'relatorios': true,
          'configuracoes': true,
          'backup': true,
          'logs': true
        };
      }

      // Se houver permissões vindas do backend, usar elas
      if (funcionario.permissoes) {
        return funcionario.permissoes;
      }

      // Fallback para permissões padrão baseadas no tipo
      if (funcionario.tipo === 'professor') {
        return {
          'painel': true,
          'funcionarios': true,
          'cadastroFuncionario': true,
          'gerenciamentoFuncionarios': true,
          'matriculas': true,
          'declaracoesInteresse': true,
          'configurarDocumentosCota': true,
          'alunos': true,
          'listaAlunos': true,
          'advertencias': true,
          'advertenciasGerais': true,
          'relatorios': false,
          'configuracoes': false,
          'usuarios': false,
          'backup': false,
          'logs': false
        };
      }

      // Permissões para outros tipos
      return {
        'painel': true,
        'funcionarios': false,
        'cadastroFuncionario': false,
        'gerenciamentoFuncionarios': false,
        'matriculas': true,
        'declaracoesInteresse': true,
        'configurarDocumentosCota': false,
        'alunos': false,
        'listaAlunos': true,
        'advertencias': false,
        'relatorios': false,
        'configuracoes': false,
        'usuarios': false,
        'backup': false,
        'logs': false
      };
    }
    return {};
  }

  isLoggedIn(): boolean {
    return this.usuarioLogadoSubject.value !== null;
  }

  getUserType(): string | null {
    const usuario = this.getFuncionarioLogado();
    return usuario ? usuario.tipo : null;
  }

  logout(): void {
    // Limpar todos os dados do usuário e cache
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('funcionalidades_sistema');
    localStorage.removeItem('funcionalidades_cache_info');

    // Notificar que o usuário foi deslogado
    this.usuarioLogadoSubject.next(null);

    console.log('Logout realizado - cache limpo');
  }
}
