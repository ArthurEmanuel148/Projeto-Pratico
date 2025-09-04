import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface TurmaDisponivel {
  id: number;
  nome: string;
  turno: string;
  capacidadeMaxima: number;
  vagasDisponiveis: number;
  temVagas: number;
  descricaoCompleta: string;
}

export interface DeclaracaoParaMatricula {
  id: number;
  protocolo: string;
  nomeAluno: string;
  nomeResponsavel: string;
  tipoCotaDescricao: string;
  diasAguardando: number;
  dataEnvio: string;
}

export interface IniciarMatriculaRequest {
  idDeclaracao: number;
  idTurma: number;
  idFuncionario: number;
}

export interface IniciarMatriculaResponse {
  sucesso: boolean;
  mensagem: string;
  idFamilia?: number;
  idResponsavel?: number;
  idAluno?: number;
  matricula?: string;
  loginResponsavel?: string;
  senhaTemporaria?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private readonly API_BASE_URL = `${environment.apiUrl}/api/matriculas`;

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Busca todas as declarações disponíveis para matrícula
   */
  getDeclaracoesParaMatricula(): Observable<DeclaracaoParaMatricula[]> {
    return this.http.get<DeclaracaoParaMatricula[]>(`${this.API_BASE_URL}/declaracoes`, this.httpOptions)
      .pipe(
        map(response => {
          console.log('✅ Declarações recebidas:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar declarações:', error);
          return of([]);
        })
      );
  }

  /**
   * Busca todas as turmas disponíveis para matrícula
   */
  getTurmasDisponiveis(): Observable<TurmaDisponivel[]> {
    return this.http.get<TurmaDisponivel[]>(`${this.API_BASE_URL}/turmas`, this.httpOptions)
      .pipe(
        map(response => {
          console.log('✅ Turmas disponíveis recebidas:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao buscar turmas disponíveis:', error);
          return of([]);
        })
      );
  }

  /**
   * Valida se a matrícula pode ser iniciada
   */
  validarIniciarMatricula(idDeclaracao: number, idTurma: number, idFuncionario: number): Observable<{ valido: boolean, mensagem: string }> {
    const request = { idDeclaracao, idTurma, idFuncionario };
    return this.http.post<{ valido: boolean, mensagem: string }>(`${this.API_BASE_URL}/validar`, request, this.httpOptions)
      .pipe(
        map(response => {
          console.log('✅ Validação recebida:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro na validação:', error);
          return of({ valido: false, mensagem: 'Erro na validação' });
        })
      );
  }

  /**
   * Inicia o processo de matrícula
   */
  iniciarMatricula(idDeclaracao: number, idTurma: number, idFuncionario: number): Observable<IniciarMatriculaResponse> {
    const request = { idDeclaracao, idTurma, idFuncionario };
    return this.http.post<IniciarMatriculaResponse>(`${this.API_BASE_URL}/iniciar`, request, this.httpOptions)
      .pipe(
        map(response => {
          console.log('✅ Matrícula iniciada:', response);
          return response;
        }),
        catchError(error => {
          console.error('❌ Erro ao iniciar matrícula:', error);
          return of({
            sucesso: false,
            mensagem: 'Erro ao iniciar matrícula: ' + (error?.error?.message || error.message)
          });
        })
      );
  }
}
