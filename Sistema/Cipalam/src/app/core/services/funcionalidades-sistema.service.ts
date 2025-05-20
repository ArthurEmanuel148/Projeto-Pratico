import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { FuncionalidadeSistema } from '../models/funcionalidade-sistema.interface';

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadesSistemaService {
  private mockFuncionalidades: FuncionalidadeSistema[] = [
    { chave: 'gerenciarFuncionarios', nomeAmigavel: 'Gerenciar Funcionários', descricao: 'Permite cadastrar, editar e visualizar funcionários.' },
    { chave: 'gerenciarAlunos', nomeAmigavel: 'Gerenciar Alunos', descricao: 'Acesso completo aos dados e ações de alunos.' },
    { chave: 'emitirRelatoriosAdvertencias', nomeAmigavel: 'Relatórios de Advertências', descricao: 'Gerar relatórios sobre advertências.' },
    { chave: 'configuracoesSistema', nomeAmigavel: 'Configurações do Sistema', descricao: 'Acesso às configurações globais.' },
    { chave: 'visualizarFinanceiro', nomeAmigavel: 'Visualizar Financeiro', descricao: 'Apenas visualização de dados financeiros.' },
  ];

  constructor() { }

  getTodasFuncionalidades(): Observable<FuncionalidadeSistema[]> {
    return of(this.mockFuncionalidades);
  }
}