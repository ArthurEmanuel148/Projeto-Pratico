import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { DocumentoMatricula } from '../models/documento-matricula.interface';

@Injectable({ providedIn: 'root' })
export class MatriculaService {
  private apiUrl = `${environment.apiUrl}/interesse-matricula`;

  constructor(private http: HttpClient) { }

  iniciarMatricula(dadosMatricula: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/iniciar`, dadosMatricula).pipe(
      catchError(error => {
        console.error('Erro ao iniciar matrícula no backend:', error);
        throw error;
      })
    );
  }

  /**
   * Busca turmas disponíveis para matrícula
   */
  getTurmasDisponiveis(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/turmas`).pipe(
      catchError(error => {
        console.error('Erro ao buscar turmas:', error);
        throw error;
      })
    );
  }

  /**
   * Busca declarações disponíveis para matrícula
   */
  getDeclaracoesParaMatricula(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}?status=interesse_declarado,matricula_iniciada`).pipe(
      catchError(error => {
        console.error('Erro ao buscar declarações:', error);
        throw error;
      })
    );
  }

  /**
   * Inicia o processo de matrícula com três parâmetros (formato correto do backend)
   */
  iniciarMatriculaComTurma(idDeclaracao: number, idTurma: number, idFuncionario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idDeclaracao}/iniciar-matricula-completa?turmaId=${idTurma}&funcionarioId=${idFuncionario}`, {}).pipe(
      catchError(error => {
        console.error('Erro ao iniciar matrícula:', error);
        throw error;
      })
    );
  }

  getDocumentosPorCota(tipoCota: string): Observable<DocumentoMatricula[]> {
    return this.http.get<DocumentoMatricula[]>(`${this.apiUrl}/tipos-documentos?tipoCota=${tipoCota}`).pipe(
      catchError(error => {
        console.error('Erro ao buscar documentos por cota:', error);
        throw error;
      })
    );
  }

  buscarStatusMatricula(interesseId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/status/${interesseId}`);
  }

  listarDocumentosMatricula(interesseId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/documentos/${interesseId}`);
  }

  /**
   * Finalizar matrícula (dados reais do backend)
   */
  finalizarMatricula(idDeclaracao: number, idFuncionario: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${idDeclaracao}/finalizar-matricula?funcionarioId=${idFuncionario}`, {}).pipe(
      catchError(error => {
        console.error('Erro ao finalizar matrícula:', error);
        throw error;
      })
    );
  }
}
