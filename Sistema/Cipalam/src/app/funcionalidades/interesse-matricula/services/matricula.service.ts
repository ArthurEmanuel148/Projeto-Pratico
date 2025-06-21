import { Injectable } from '@angular/core';
import { DocumentoMatricula } from '../models/documento-matricula.interface';

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  // Simulação de configuração de documentos por cota
  private configuracaoDocumentos: Record<string, DocumentoMatricula[]> = {
    funcionario: [
      { id: 'rg', nome: 'RG do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'cpf', nome: 'CPF do Responsável', obrigatorio: true, tipo: 'documento' }
    ],
    economica: [
      { id: 'comprovanteRenda', nome: 'Comprovante de Renda', obrigatorio: true, tipo: 'comprovante' }
    ],
    livre: [
      { id: 'certidaoNascimento', nome: 'Certidão de Nascimento', obrigatorio: true, tipo: 'documento' }
    ]
  };

  constructor() { }

  criarLoginResponsavel(dadosResponsavel: any) {
    // Aqui será chamada a API futuramente
    // return this.http.post('/api/responsaveis', dadosResponsavel);
    return {
      usuario: dadosResponsavel.emailResponsavel,
      senha: 'senhaGerada123'
    };
  }

  getDocumentosPorCota(tipoCota: string): DocumentoMatricula[] {
    // No futuro: buscar do backend
    // return this.http.get<DocumentoMatricula[]>(`/api/documentos-cota/${tipoCota}`);
    return this.configuracaoDocumentos[tipoCota] || [];
  }
}
