import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { FuncionalidadeSistema } from '../models/funcionalidade-sistema.interface';
import { ApiConfigService } from './api-config.service';

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadesSistemaService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }
  private mockFuncionalidades: FuncionalidadeSistema[] = [
    {
      chave: 'painel',
      nomeAmigavel: 'Painel',
      descricao: 'Painel principal do sistema.',
      rota: '/paineis/painel',
      icone: 'home-outline'
    },
    {
      chave: 'funcionarios',
      nomeAmigavel: 'Funcionários',
      descricao: 'Menu de funcionários.',
      rota: '',
      icone: 'people-outline'
    },
    {
      chave: 'cadastroFuncionario',
      nomeAmigavel: 'Cadastro de Funcionário',
      descricao: 'Cadastrar e editar funcionários.',
      rota: '/paineis/gerenciamento-funcionarios/cadastro-funcionario',
      icone: 'person-add-outline',
      pai: 'funcionarios'
    },
    {
      chave: 'gerenciamentoFuncionarios',
      nomeAmigavel: 'Lista de Funcionários',
      descricao: 'Visualizar e gerenciar funcionários.',
      rota: '/paineis/gerenciamento-funcionarios',
      icone: 'list-outline',
      pai: 'funcionarios'
    },
    {
      chave: 'matriculas',
      nomeAmigavel: 'Matrículas',
      descricao: 'Menu de matrículas.',
      rota: '',
      icone: 'school-outline'
    },
    {
      chave: 'declaracoesInteresse',
      nomeAmigavel: 'Declarações de Interesse',
      descricao: 'Gerenciar declarações de interesse.',
      rota: '/paineis/interesse-matricula/lista-declaracoes',
      icone: 'document-text-outline',
      pai: 'matriculas'
    },
    {
      chave: 'configurarDocumentosCota',
      nomeAmigavel: 'Configurar Documentos por Cota',
      descricao: 'Configurar documentos por cota.',
      rota: '/paineis/interesse-matricula/configuracao-documentos',
      icone: 'settings-outline',
      pai: 'matriculas'
    },
    {
      chave: 'alunos',
      nomeAmigavel: 'Alunos',
      descricao: 'Menu de alunos.',
      rota: '',
      icone: 'people-circle-outline'
    },
    {
      chave: 'cadastroAluno',
      nomeAmigavel: 'Cadastro de Aluno',
      descricao: 'Cadastrar novos alunos.',
      rota: '/paineis/alunos/cadastro',
      icone: 'person-add-outline',
      pai: 'alunos'
    },
    {
      chave: 'listaAlunos',
      nomeAmigavel: 'Lista de Alunos',
      descricao: 'Visualizar e gerenciar alunos.',
      rota: '/paineis/alunos/lista',
      icone: 'list-outline',
      pai: 'alunos'
    },
    {
      chave: 'advertencias',
      nomeAmigavel: 'Advertências',
      descricao: 'Menu de advertências.',
      rota: '',
      icone: 'warning-outline'
    },
    {
      chave: 'advertenciasGerais',
      nomeAmigavel: 'Advertências Gerais',
      descricao: 'Gerenciar advertências gerais.',
      rota: '/paineis/advertencias/gerais',
      icone: 'alert-outline',
      pai: 'advertencias'
    },
    {
      chave: 'advertenciasRodaLeitura',
      nomeAmigavel: 'Advertências Roda de Leitura',
      descricao: 'Gerenciar advertências de roda de leitura.',
      rota: '/paineis/advertencias/roda-leitura',
      icone: 'book-outline',
      pai: 'advertencias'
    },
    {
      chave: 'biblioteca',
      nomeAmigavel: 'Biblioteca',
      descricao: 'Menu da biblioteca.',
      rota: '',
      icone: 'library-outline'
    },
    {
      chave: 'emprestimoLivros',
      nomeAmigavel: 'Empréstimo de Livros',
      descricao: 'Gerenciar empréstimos de livros.',
      rota: '/paineis/biblioteca/emprestimos',
      icone: 'book-outline',
      pai: 'biblioteca'
    },
    {
      chave: 'catalogoLivros',
      nomeAmigavel: 'Catálogo de Livros',
      descricao: 'Gerenciar catálogo de livros.',
      rota: '/paineis/biblioteca/catalogo',
      icone: 'library-outline',
      pai: 'biblioteca'
    },
    {
      chave: 'uniformes',
      nomeAmigavel: 'Uniformes',
      descricao: 'Menu de uniformes.',
      rota: '',
      icone: 'shirt-outline'
    },
    {
      chave: 'emprestimoUniformes',
      nomeAmigavel: 'Empréstimo de Uniformes',
      descricao: 'Gerenciar empréstimos de uniformes.',
      rota: '/paineis/uniformes/emprestimos',
      icone: 'shirt-outline',
      pai: 'uniformes'
    },
    {
      chave: 'estoqueUniformes',
      nomeAmigavel: 'Estoque de Uniformes',
      descricao: 'Gerenciar estoque de uniformes.',
      rota: '/paineis/uniformes/estoque',
      icone: 'cube-outline',
      pai: 'uniformes'
    },
    {
      chave: 'administracao',
      nomeAmigavel: 'Administração',
      descricao: 'Menu administrativo (apenas administradores).',
      rota: '',
      icone: 'shield-outline'
    },
    {
      chave: 'usuarios',
      nomeAmigavel: 'Gerenciar Usuários',
      descricao: 'Gerenciar usuários do sistema.',
      rota: '/paineis/administracao/usuarios',
      icone: 'people-outline',
      pai: 'administracao'
    },
    {
      chave: 'relatorios',
      nomeAmigavel: 'Relatórios',
      descricao: 'Gerar relatórios do sistema.',
      rota: '/paineis/administracao/relatorios',
      icone: 'bar-chart-outline',
      pai: 'administracao'
    },
    {
      chave: 'configuracoes',
      nomeAmigavel: 'Configurações',
      descricao: 'Configurações do sistema.',
      rota: '/paineis/administracao/configuracoes',
      icone: 'settings-outline',
      pai: 'administracao'
    },
    {
      chave: 'backup',
      nomeAmigavel: 'Backup',
      descricao: 'Realizar backup do sistema.',
      rota: '/paineis/administracao/backup',
      icone: 'cloud-upload-outline',
      pai: 'administracao'
    },
    {
      chave: 'logs',
      nomeAmigavel: 'Logs do Sistema',
      descricao: 'Visualizar logs do sistema.',
      rota: '/paineis/administracao/logs',
      icone: 'document-text-outline',
      pai: 'administracao'
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
}
