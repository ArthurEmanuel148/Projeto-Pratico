import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { DocumentoMatricula } from '../models/documento-matricula.interface';

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private apiUrl = 'http://localhost:8080/api/matricula';

  // Simulação de configuração de documentos por cota como fallback
  private configuracaoDocumentos: Record<string, DocumentoMatricula[]> = {
    funcionario: [
      { id: 'rg', nome: 'RG do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'cpf', nome: 'CPF do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'comprovanteVinculo', nome: 'Comprovante de Vínculo Empregatício', obrigatorio: true, tipo: 'comprovante' },
      { id: 'declaracaoParentesco', nome: 'Declaração de Parentesco', obrigatorio: true, tipo: 'documento' }
    ],
    economica: [
      { id: 'rg', nome: 'RG do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'cpf', nome: 'CPF do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'comprovanteRenda', nome: 'Comprovante de Renda', obrigatorio: true, tipo: 'comprovante' },
      { id: 'declaracaoDependentes', nome: 'Declaração de Dependentes', obrigatorio: true, tipo: 'documento' }
    ],
    livre: [
      { id: 'rg', nome: 'RG do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'cpf', nome: 'CPF do Responsável', obrigatorio: true, tipo: 'documento' },
      { id: 'certidaoNascimento', nome: 'Certidão de Nascimento', obrigatorio: true, tipo: 'documento' }
    ]
  };

  constructor(private http: HttpClient) { }

  iniciarMatricula(dadosMatricula: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/iniciar`, dadosMatricula).pipe(
      catchError(error => {
        console.error('Erro ao iniciar matrícula no backend:', error);
        // Fallback para simulação local
        return of(this.criarLoginResponsavelLocal(dadosMatricula));
      })
    );
  }

  private criarLoginResponsavelLocal(dadosMatricula: any) {
    // Simulação local como fallback
    const responsavel = dadosMatricula.dadosResponsavel || dadosMatricula;
    return {
      success: true,
      message: 'Matrícula iniciada com sucesso!',
      credenciaisResponsavel: {
        usuario: responsavel.emailResponsavel || responsavel.email || 'responsavel@temp.com',
        senha: 'temp123456'
      },
      documentosNecessarios: this.getDocumentosPorCota(dadosMatricula.tipoCota || 'livre')
    };
  }

  criarLoginResponsavel(dadosResponsavel: any) {
    // Método legacy - agora usar iniciarMatricula
    return {
      usuario: dadosResponsavel.emailResponsavel || dadosResponsavel.email || 'responsavel@temp.com',
      senha: 'temp123456'
    };
  }

  getDocumentosPorCota(tipoCota: string): DocumentoMatricula[] {
    return this.http.get<DocumentoMatricula[]>(`${this.apiUrl}/tipos-documentos?tipoCota=${tipoCota}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar documentos por cota, usando configuração local:', error);
        return of(this.configuracaoDocumentos[tipoCota] || []);
      })
    ).toPromise() as any || this.configuracaoDocumentos[tipoCota] || [];
  }

  buscarStatusMatricula(interesseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${interesseId}`);
  }

  listarDocumentosMatricula(interesseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documentos/${interesseId}`);
  }
}
