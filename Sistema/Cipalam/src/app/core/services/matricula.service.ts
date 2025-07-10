// src/app/core/services/matricula.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
  InteresseMatricula,
  TipoDocumento,
  DocumentoMatricula,
  LogMatricula,
  IniciarMatriculaRequest,
  IniciarMatriculaResponse,
  DocumentosPendentesResponse,
  AnexarDocumentoRequest,
  AssinarDocumentoRequest,
  AprovarDocumentoRequest,
  StatusMatricula,
  StatusMatriculaResponse,
  DocumentoUploadResponse,
  AssinaturaDigitalRequest,
  AssinaturaDigitalResponse,
  TemplateDocumentoResponse,
  ApiResponse
} from '../models/matricula.model';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private readonly apiUrl = 'http://localhost:8080/api/matricula';

  // Subject para notificar mudanças no status das matrículas
  private matriculasAtualizadas = new BehaviorSubject<boolean>(false);
  public matriculasAtualizadas$ = this.matriculasAtualizadas.asObservable();

  constructor(private http: HttpClient) {}

  // ==========================================
  // MÉTODOS PARA FUNCIONÁRIOS
  // ==========================================

  /**
   * Busca todas as declarações de interesse
   */
  listarInteressesMatricula(filtros?: {
    status?: StatusMatricula;
    tipoCota?: string;
    funcionarioResponsavel?: number;
  }): Observable<InteresseMatricula[]> {
    let params: any = {};
    if (filtros) {
      Object.keys(filtros).forEach(key => {
        if (filtros[key as keyof typeof filtros] !== undefined) {
          params[key] = filtros[key as keyof typeof filtros];
        }
      });
    }

    return this.http.get<InteresseMatricula[]>(`${this.apiUrl}/interesses`, { params })
      .pipe(
        map(response => response.map(interesse => ({
          ...interesse,
          dataEnvio: new Date(interesse.dataEnvio),
          dataInicioMatricula: interesse.dataInicioMatricula ? new Date(interesse.dataInicioMatricula) : undefined
        }))),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Busca uma declaração de interesse específica
   */
  buscarInteresseMatricula(id: number): Observable<InteresseMatricula> {
    return this.http.get<InteresseMatricula>(`${this.apiUrl}/interesses/${id}`)
      .pipe(
        map(interesse => ({
          ...interesse,
          dataEnvio: new Date(interesse.dataEnvio),
          dataInicioMatricula: interesse.dataInicioMatricula ? new Date(interesse.dataInicioMatricula) : undefined
        })),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Inicia o processo de matrícula
   */
  iniciarMatricula(request: IniciarMatriculaRequest): Observable<IniciarMatriculaResponse> {
    return this.http.post<IniciarMatriculaResponse>(`${this.apiUrl}/iniciar`, request)
      .pipe(
        tap(() => this.notificarAtualizacao()),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Busca os tipos de documentos necessários para uma cota específica
   */
  buscarTiposDocumentos(tipoCota: string): Observable<TipoDocumento[]> {
    return this.http.get<TipoDocumento[]>(`${this.apiUrl}/tipos-documentos`, {
      params: { tipoCota }
    }).pipe(catchError(err => throwError(() => err)));
  }

  // ==========================================
  // MÉTODOS PARA PAINEL DO RESPONSÁVEL
  // ==========================================

  /**
   * Busca status da matrícula para o responsável logado
   */
  buscarStatusMatricula(): Observable<InteresseMatricula> {
    // Buscar ID do usuário logado (mock por enquanto)
    const usuarioId = 1;

    return this.http.get<any>(`${this.apiUrl}/responsavel/status?usuarioId=${usuarioId}`)
      .pipe(
        map(response => ({
          ...response,
          dataEnvio: new Date(response.dataEnvio),
          dataInicioMatricula: response.dataInicioMatricula ? new Date(response.dataInicioMatricula) : undefined
        })),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Busca documentos pendentes para o responsável
   */
  buscarDocumentosPendentes(): Observable<DocumentosPendentesResponse> {
    // Buscar ID do usuário logado (mock por enquanto)
    const usuarioId = 1;

    return this.http.get<any>(`${this.apiUrl}/responsavel/documentos-pendentes?usuarioId=${usuarioId}`)
      .pipe(
        map(response => ({
          ...response,
          documentos: response.documentos.map((doc: any) => ({
            ...doc,
            dataEnvio: doc.dataEnvio ? new Date(doc.dataEnvio) : undefined,
            dataAssinatura: doc.dataAssinatura ? new Date(doc.dataAssinatura) : undefined,
            dataAprovacao: doc.dataAprovacao ? new Date(doc.dataAprovacao) : undefined
          }))
        })),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Anexa arquivo a um documento
   */
  anexarDocumento(request: AnexarDocumentoRequest): Observable<DocumentoUploadResponse> {
    const formData = new FormData();
    formData.append('arquivo', request.arquivo);
    formData.append('documentoId', request.documentoId.toString());

    if (request.observacoes) {
      formData.append('observacoes', request.observacoes);
    }

    return this.http.post<DocumentoUploadResponse>(`${this.apiUrl}/responsavel/anexar-documento`, formData)
      .pipe(
        tap(() => this.notificarAtualizacao()),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Assina documento digitalmente
   */
  assinarDocumento(request: AssinarDocumentoRequest): Observable<AssinaturaDigitalResponse> {
    return this.http.post<AssinaturaDigitalResponse>(`${this.apiUrl}/responsavel/assinar-documento`, request)
      .pipe(
        tap(() => this.notificarAtualizacao()),
        catchError(err => throwError(() => err))
      );
  }

  /**
   * Busca template de um documento para assinatura
   */
  buscarTemplateDocumento(tipoDocumentoId: number): Observable<TemplateDocumentoResponse> {
    return this.http.get<TemplateDocumentoResponse>(`${this.apiUrl}/responsavel/template-documento/${tipoDocumentoId}`)
      .pipe(
        catchError(err => throwError(() => err))
      );
  }

  // ==========================================
  // MÉTODOS AUXILIARES
  // ==========================================

  /**
   * Valida arquivo para upload
   */
  validarArquivo(arquivo: File): { valido: boolean; erro?: string } {
    // Verificar se o arquivo existe
    if (!arquivo) {
      return { valido: false, erro: 'Nenhum arquivo selecionado' };
    }

    // Verificar tamanho (10MB)
    const tamanhoMaximo = 10 * 1024 * 1024; // 10MB
    if (arquivo.size > tamanhoMaximo) {
      return { valido: false, erro: 'Arquivo muito grande. Máximo 10MB.' };
    }

    // Verificar tipo
    const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
    if (!tiposPermitidos.includes(arquivo.type)) {
      return { valido: false, erro: 'Tipo de arquivo não permitido. Use JPG, PNG ou PDF.' };
    }

    return { valido: true };
  }

  /**
   * Formata o nome do status para exibição
   */
  formatarStatus(status: StatusMatricula): string {
    const statusMap: Record<StatusMatricula, string> = {
      'interesse_declarado': 'Interesse Declarado',
      'matricula_iniciada': 'Matrícula Iniciada',
      'documentos_pendentes': 'Documentos Pendentes',
      'documentos_completos': 'Documentos Completos',
      'matricula_concluida': 'Matrícula Concluída',
      'matricula_cancelada': 'Matrícula Cancelada'
    };

    return statusMap[status] || status;
  }

  /**
   * Retorna a cor do status para exibição
   */
  corStatus(status: StatusMatricula): string {
    const coresMap: Record<StatusMatricula, string> = {
      'interesse_declarado': 'medium',
      'matricula_iniciada': 'primary',
      'documentos_pendentes': 'warning',
      'documentos_completos': 'success',
      'matricula_concluida': 'success',
      'matricula_cancelada': 'danger'
    };

    return coresMap[status] || 'medium';
  }

  /**
   * Notifica que houve uma atualização
   */
  private notificarAtualizacao(): void {
    this.matriculasAtualizadas.next(true);
  }
}
