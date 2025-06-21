import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FuncionalidadeSistema } from '../models/funcionalidade-sistema.interface';

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadesSistemaService {
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
    }
  ];

  constructor() { }

  getTodasFuncionalidades(): Observable<FuncionalidadeSistema[]> {
    return of(this.mockFuncionalidades);
  }
}