import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { map, tap, catchError, switchMap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiConfigService } from './api-config.service';

export interface LoginRequest {
  usuario: string;
  senha: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  usuario: string;
  pessoaId?: number;
  usuarioId?: number;
  nomePessoa: string;
  token: string;
  funcionalidades: any[];
  pessoa?: {
    idPessoa: number;
    nmPessoa: string;
    cpfPessoa: string;
    caminhoImagem?: string;
    dtNascPessoa?: string;
    caminhoIdentidadePessoa?: string;
  };
  tipo?: string;
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
    // Primeiro, tentar autenticar como responsável (usando CPF)
    return this.loginResponsavel(usuario, senha).pipe(
      catchError(responsavelError => {
        console.log('Falha na autenticação de responsável, tentando funcionário...');
        // Se falhar, tentar como funcionário/admin
        return this.loginFuncionario(usuario, senha);
      })
    );
  }

  // Método específico para login de responsável
  private loginResponsavel(cpf: string, senha: string): Observable<LoginResponse> {
    return this.http.post<any>(`${environment.apiUrl}/interesse-matricula/autenticar-responsavel`, { cpf, senha })
      .pipe(
        switchMap(response => {
          if (response.autenticado) {
            // Converter resposta do responsável para formato esperado
            const normalizedResponse: LoginResponse = {
              success: true,
              message: response.message,
              usuario: cpf,
              token: '',
              pessoa: {
                idPessoa: response.dadosResponsavel.idPessoa || 0,
                nmPessoa: response.dadosResponsavel.nome || '',
                cpfPessoa: response.dadosResponsavel.cpf || cpf,
              },
              pessoaId: response.dadosResponsavel.idPessoa || 0,
              usuarioId: response.dadosResponsavel.idPessoa || 0,
              nomePessoa: response.dadosResponsavel.nome || '',
              tipo: 'responsavel',
              funcionalidades: [],
              permissoes: {}
            };

            // Salvar usuário logado
            console.log('Login de responsável realizado com sucesso:', normalizedResponse);
            localStorage.setItem('usuarioLogado', JSON.stringify(normalizedResponse));
            this.usuarioLogadoSubject.next(normalizedResponse);

            return of(normalizedResponse);
          } else {
            return throwError(new Error(response.message || 'Falha na autenticação de responsável'));
          }
        })
      );
  }

  // Método específico para login de funcionário/admin  
  private loginFuncionario(usuario: string, senha: string): Observable<LoginResponse> {
    const loginRequest: LoginRequest = { usuario, senha };

    return this.http.post<LoginResponse>(this.apiConfig.getLoginUrl(), loginRequest)
      .pipe(
        tap(response => {
          // Converter resposta do backend para formato esperado pelo front-end
          const normalizedResponse: LoginResponse = {
            ...response,
            pessoa: {
              idPessoa: response.pessoaId || response.usuarioId || 0,
              nmPessoa: response.nomePessoa || '',
              cpfPessoa: '',
            },
            tipo: this.determineTipoUsuario(response),
            permissoes: this.buildPermissionsFromFuncionalidades(response.funcionalidades)
          };

          // Salvar usuário logado
          console.log('Login de funcionário realizado. Tipo de usuário determinado:', normalizedResponse.tipo);
          console.log('Permissões do usuário:', normalizedResponse.permissoes);
          localStorage.setItem('usuarioLogado', JSON.stringify(normalizedResponse));
          this.usuarioLogadoSubject.next(normalizedResponse);
        })
      );
  }

  private determineTipoUsuario(response: any): string {
    // Primeiro: verificar se o backend já retorna o tipo diretamente
    if (response.tipo) {
      return response.tipo;
    }

    // Segundo: verificar pelas funcionalidades retornadas
    if (response.funcionalidades && Array.isArray(response.funcionalidades)) {
      const funcionalidades = response.funcionalidades.map((f: any) => f.chave || f.nome || f);

      // Se tem funcionalidades administrativas, é admin
      if (funcionalidades.some((f: string) => f.includes('administracao') || f.includes('usuarios') || f.includes('backup'))) {
        return 'admin';
      }

      // Se tem funcionalidades de funcionário/professor mas não admin
      if (funcionalidades.some((f: string) => f.includes('funcionarios') || f.includes('matriculas') || f.includes('alunos'))) {
        return 'funcionario';
      }

      // Se só tem funcionalidades específicas de responsável
      if (funcionalidades.some((f: string) => f.includes('responsavel') || f.includes('dashboard-responsavel'))) {
        return 'responsavel';
      }
    }

    // Terceiro: verificar pelo nome da pessoa (fallback)
    const nomeNormalizado = response.nomePessoa ? response.nomePessoa.toLowerCase() : '';

    if (nomeNormalizado.includes('administrador')) {
      return 'admin';
    } else if (nomeNormalizado.includes('professor')) {
      return 'professor';
    } else if (nomeNormalizado.includes('funcionario')) {
      return 'funcionario';
    } else {
      // Por padrão, usuários que não são identificados são responsáveis
      return 'responsavel';
    }
  }

  private buildPermissionsFromFuncionalidades(funcionalidades: any[]): Record<string, boolean> {
    const permissoes: Record<string, boolean> = {};

    if (funcionalidades && Array.isArray(funcionalidades)) {
      funcionalidades.forEach(func => {
        permissoes[func.chave] = true;
      });
    }

    return permissoes;
  }

  getFuncionarioLogado(): LoginResponse | null {
    return this.usuarioLogadoSubject.value;
  }

  getPermissoesFuncionario(): Record<string, boolean> {
    const funcionario = this.getFuncionarioLogado();
    if (funcionario) {
      // Se for admin, tem acesso a tudo
      if (funcionario.pessoa && funcionario.pessoa.nmPessoa === 'Administrador do Sistema' ||
        funcionario.tipo === 'admin') {
        return {
          'painel': true,
          'funcionarios': true,
          'cadastroFuncionario': true,
          'gerenciamentoFuncionarios': true,
          'turmas': true,
          'listarTurmas': true,
          'cadastroTurma': true,
          'matriculas': true,
          'declaracoesInteresse': true,
          'configurarDocumentosCota': true,
          'iniciarMatricula': true,
          'tiposDocumento': true,
          'listarTiposDocumento': true,
          'cadastroTipoDocumento': true,
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
          'turmas': true,
          'listarTurmas': true,
          'cadastroTurma': true,
          'matriculas': true,
          'declaracoesInteresse': true,
          'configurarDocumentosCota': true,
          'iniciarMatricula': true,
          'tiposDocumento': true,
          'listarTiposDocumento': true,
          'cadastroTipoDocumento': true,
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

      // Permissões para funcionários específicos (não professor)
      if (funcionario.tipo === 'funcionario') {
        return {
          'painel': true,
          'funcionarios': true,
          'cadastroFuncionario': true,
          'gerenciamentoFuncionarios': true,
          'turmas': true,
          'listarTurmas': true,
          'cadastroTurma': true,
          'matriculas': true,
          'declaracoesInteresse': true,
          'configurarDocumentosCota': true,
          'iniciarMatricula': true,
          'tiposDocumento': true,
          'listarTiposDocumento': true,
          'cadastroTipoDocumento': true,
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
          'relatorios': false,
          'configuracoes': false,
          'usuarios': false,
          'backup': false,
          'logs': false
        };
      }

      // Permissões para responsáveis (apenas funcionalidades específicas)
      if (funcionario.tipo === 'responsavel') {
        return {
          'dashboard-responsavel': true, // Acesso ao próprio dashboard
          'interesse-matricula-publico': true, // Pode acessar declarações via URL pública
          // Todas as outras funcionalidades explicitamente negadas
          'painel': false,
          'funcionarios': false,
          'cadastroFuncionario': false,
          'gerenciamentoFuncionarios': false,
          'matriculas': false,
          'declaracoesInteresse': false,
          'configurarDocumentosCota': false,
          'alunos': false,
          'cadastroAluno': false,
          'listaAlunos': false,
          'advertencias': false,
          'advertenciasGerais': false,
          'advertenciasRodaLeitura': false,
          'biblioteca': false,
          'emprestimoLivros': false,
          'catalogoLivros': false,
          'uniformes': false,
          'emprestimoUniformes': false,
          'estoqueUniformes': false,
          'administracao': false,
          'usuarios': false,
          'relatorios': false,
          'configuracoes': false,
          'backup': false,
          'logs': false
        };
      }

      // Permissões padrão para outros tipos
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
    return usuario && usuario.tipo ? usuario.tipo : null;
  }

  logout(): void {
    // Limpar todos os dados do usuário e cache
    localStorage.removeItem('usuarioLogado');
    localStorage.removeItem('funcionalidades_sistema');
    localStorage.removeItem('funcionalidades_cache_info');
    localStorage.removeItem('funcionalidades_uso'); // Remover dados de uso das funcionalidades

    // Notificar que o usuário foi deslogado
    this.usuarioLogadoSubject.next(null);

    console.log('Logout realizado - cache limpo');
  }
}
