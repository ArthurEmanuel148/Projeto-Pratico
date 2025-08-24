import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class DocumentoService {
  private apiUrl = `${environment.apiUrl}/documentos`;

  constructor(private http: HttpClient) { }

  /**
   * Listar documentos pendentes para um responsável
   */
  listarDocumentosPendentes(idResponsavel: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/pendentes/${idResponsavel}`);
  }

  /**
   * Anexar documento
   */
  anexarDocumento(arquivo: File, idDocumento: number, idResponsavel: number): Observable<any> {
    const formData = new FormData();
    formData.append('arquivo', arquivo);
    formData.append('idDocumento', idDocumento.toString());
    formData.append('idResponsavel', idResponsavel.toString());

    return this.http.post(`${this.apiUrl}/anexar`, formData);
  }

  /**
   * Baixar documento
   */
  baixarDocumento(idDocumento: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/download/${idDocumento}`, {
      responseType: 'blob'
    });
  }

  /**
   * Remover documento
   */
  removerDocumento(idDocumento: number, idResponsavel: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/remover/${idDocumento}`, {
      params: { idResponsavel: idResponsavel.toString() }
    });
  }

  /**
   * Obter configuração de documentos por cota
   */
  obterConfiguracaoDocumentos(tipoCota: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/configuracao/${tipoCota}`);
  }

  /**
   * Validar arquivo antes do upload
   */
  validarArquivo(arquivo: File): { valido: boolean; erro?: string } {
    // Validar tamanho (5MB máximo)
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB
    if (arquivo.size > tamanhoMaximo) {
      return { valido: false, erro: 'Arquivo muito grande. Máximo 5MB permitido.' };
    }

    // Validar tipo
    const tiposPermitidos = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png'
    ];

    if (!tiposPermitidos.includes(arquivo.type)) {
      return { valido: false, erro: 'Tipo de arquivo não permitido. Use PDF, JPG, JPEG ou PNG.' };
    }

    return { valido: true };
  }

  /**
   * Formatar tamanho de arquivo
   */
  formatarTamanho(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const tamanhos = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + tamanhos[i];
  }

  /**
   * Obter ícone do documento por categoria
   */
  obterIconeDocumento(categoria: string): string {
    switch (categoria?.toLowerCase()) {
      case 'responsavel':
        return 'person';
      case 'familia':
        return 'home';
      case 'aluno':
        return 'school';
      case 'cota':
        return 'document-text';
      default:
        return 'document';
    }
  }

  /**
   * Obter cor do status
   */
  obterCorStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'anexado':
        return 'primary';
      case 'aprovado':
        return 'success';
      case 'rejeitado':
        return 'danger';
      default:
        return 'medium';
    }
  }
}
