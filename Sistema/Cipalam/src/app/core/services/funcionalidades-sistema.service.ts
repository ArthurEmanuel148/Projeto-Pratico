import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError, map } from 'rxjs/operators';
import { FuncionalidadeSistema } from '../models/funcionalidade-sistema.interface';
import { ApiConfigService } from './api-config.service';
import { RotasConfigService } from './rotas-config.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadesSistemaService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService,
    private rotasConfig: RotasConfigService
  ) { }

  private mockFuncionalidades: FuncionalidadeSistema[] = [
    {
      chave: 'painel',
      nomeAmigavel: 'Painel',
      descricao: 'Painel principal do sistema.',
      icone: 'home-outline',
      categoria: 'menu',
      ordemExibicao: 1
    },
    {
      chave: 'funcionarios',
      nomeAmigavel: 'Funcionários',
      descricao: 'Menu de funcionários.',
      icone: 'people-outline',
      categoria: 'menu',
      ordemExibicao: 2
    },
    {
      chave: 'cadastroFuncionario',
      nomeAmigavel: 'Cadastro de Funcionário',
      descricao: 'Cadastrar e editar funcionários.',
      icone: 'person-add-outline',
      pai: 'funcionarios',
      categoria: 'acao',
      ordemExibicao: 21
    },
    {
      chave: 'gerenciamentoFuncionarios',
      nomeAmigavel: 'Lista de Funcionários',
      descricao: 'Visualizar e gerenciar funcionários.',
      icone: 'list-outline',
      pai: 'funcionarios',
      categoria: 'acao',
      ordemExibicao: 22
    },
    {
      chave: 'matriculas',
      nomeAmigavel: 'Matrículas',
      descricao: 'Menu de matrículas.',
      icone: 'school-outline',
      categoria: 'menu',
      ordemExibicao: 3
    },
    {
      chave: 'declaracoesInteresse',
      nomeAmigavel: 'Declarações de Interesse',
      descricao: 'Gerenciar declarações de interesse.',
      icone: 'document-text-outline',
      pai: 'matriculas',
      categoria: 'acao',
      ordemExibicao: 31
    },
    {
      chave: 'configurarDocumentosCota',
      nomeAmigavel: 'Configurar Documentos por Cota',
      descricao: 'Configurar documentos por cota.',
      icone: 'settings-outline',
      pai: 'matriculas',
      categoria: 'configuracao',
      ordemExibicao: 32
    }
  ];

  getTodasFuncionalidades(): Observable<FuncionalidadeSistema[]> {
    // Primeiro tenta buscar do backend
    return this.http.get<FuncionalidadeSistema[]>(`${this.apiConfig.getBaseUrl()}/funcionalidades`)
      .pipe(
        catchError((error) => {
          console.warn('Erro ao buscar funcionalidades do backend, usando mock:', error);
          // Em caso de erro, retorna o mock
          return of(this.mockFuncionalidades);
        })
      );
  }

  getFuncionalidadesPorUsuario(pessoaId: number): Observable<FuncionalidadeSistema[]> {
    // Buscar funcionalidades específicas do usuário
    return this.http.get<FuncionalidadeSistema[]>(`${this.apiConfig.getBaseUrl()}/auth/funcionalidades/${pessoaId}`)
      .pipe(
        catchError((error) => {
          console.warn('Erro ao buscar funcionalidades do usuário, usando mock filtrado:', error);
          return of(this.mockFuncionalidades);
        })
      );
  }

  getMenuHierarquico(pessoaId: number): Observable<any[]> {
    // Buscar menu hierárquico do usuário
    return this.http.get<{ success: boolean, menu: any[] }>(`${this.apiConfig.getBaseUrl()}/auth/menu/${pessoaId}`)
      .pipe(
        map(response => response.menu),
        catchError((error) => {
          console.warn('Erro ao buscar menu hierárquico, usando fallback:', error);
          return this.getFuncionalidadesPorUsuario(pessoaId).pipe(
            map((funcionalidades: FuncionalidadeSistema[]) => this.buildMenuHierarquico(funcionalidades))
          );
        })
      );
  }

  private buildMenuHierarquico(funcionalidades: FuncionalidadeSistema[]): any[] {
    const principais = funcionalidades.filter(f => !f.pai);
    return principais.map(principal => {
      const filhos = funcionalidades.filter(f => f.pai === principal.chave);
      return {
        ...principal,
        rota: this.rotasConfig.getRota(principal.chave), // Adiciona rota aqui
        filhos: filhos.length > 0 ? filhos.map(filho => ({
          ...filho,
          rota: this.rotasConfig.getRota(filho.chave) // Adiciona rota para filhos
        })) : null
      };
    });
  }

  /**
   * Obtém uma funcionalidade com sua rota mapeada
   */
  getFuncionalidadeComRota(chave: string): Observable<FuncionalidadeSistema & { rota: string }> {
    return this.getTodasFuncionalidades().pipe(
      map(funcionalidades => {
        const funcionalidade = funcionalidades.find(f => f.chave === chave);
        if (!funcionalidade) {
          throw new Error(`Funcionalidade '${chave}' não encontrada`);
        }
        return {
          ...funcionalidade,
          rota: this.rotasConfig.getRota(chave)
        };
      })
    );
  }

  /**
   * Verifica se o usuário tem permissão para uma funcionalidade
   */
  temPermissao(pessoaId: number, chave: string): Observable<boolean> {
    return this.getFuncionalidadesPorUsuario(pessoaId).pipe(
      map(funcionalidades => funcionalidades.some(f => f.chave === chave))
    );
  }
}
