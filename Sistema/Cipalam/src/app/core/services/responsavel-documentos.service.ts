import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface DocumentoPorPessoa {
    pessoa: {
        id: number;
        nome: string;
        parentesco: string; // 'responsavel', 'aluno', 'integrante'
    };
    documentos: DocumentoIndividual[];
}

export interface DocumentoIndividual {
    id: number;
    idDocumentoMatricula: number;
    tipoDocumento: {
        id: number;
        nome: string;
        descricao: string;
        categoria: string; // FAMILIA, ALUNO, TODOS_INTEGRANTES
    };
    status: string; // 'pendente', 'anexado', 'aprovado', 'rejeitado'
    statusDescricao: string;
    nomeArquivo?: string;
    dataEnvio?: string;
    dataAprovacao?: string;
    observacoes?: string;
    obrigatorio: boolean;
}

export interface FamiliaDocumentos {
    familia: {
        id: number;
        responsavel: {
            id: number;
            nome: string;
            email: string;
        };
    };
    documentosPorPessoa: DocumentoPorPessoa[];
    resumo: {
        totalDocumentos: number;
        pendentes: number;
        anexados: number;
        aprovados: number;
        rejeitados: number;
    };
}

@Injectable({
    providedIn: 'root'
})
export class ResponsavelDocumentosService {
    private readonly API_BASE_URL = `${environment.apiUrl}/responsavel-documentos`;

    private httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json'
        })
    };

    constructor(private http: HttpClient) { }

    /**
     * Busca todos os documentos da família organizados por pessoa
     */
    getDocumentosPorFamilia(idResponsavel: number): Observable<FamiliaDocumentos> {
        const url = `${this.API_BASE_URL}/${idResponsavel}/familia/documentos`;
        console.log(`🌐 Fazendo requisição para: ${url}`);

        return this.http.get<FamiliaDocumentos>(url, this.httpOptions)
            .pipe(
                map(response => {
                    console.log('✅ Documentos por família recebidos do backend:', response);
                    return response;
                }),
                catchError(error => {
                    console.error('❌ Erro ao buscar documentos por família:', error);
                    console.error('URL tentativa:', `${this.API_BASE_URL}/${idResponsavel}/documentos`);
                    console.error('Status:', error.status);
                    console.error('Mensagem:', error.message);
                    throw error; // Propagar o erro real
                })
            );
    }

    /**
     * Anexa um arquivo para um documento específico
     */
    anexarDocumento(arquivo: File, idDocumentoMatricula: number, idPessoa: number): Observable<any> {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('idDocumentoMatricula', idDocumentoMatricula.toString());
        formData.append('idPessoa', idPessoa.toString());

        return this.http.post(`${this.API_BASE_URL}/anexar-documento`, formData)
            .pipe(
                map(response => {
                    console.log('✅ Documento anexado:', response);
                    return response;
                }),
                catchError(error => {
                    console.error('❌ Erro ao anexar documento:', error);
                    throw error;
                })
            );
    }

    /**
     * Remove um documento anexado
     */
    removerDocumento(idDocumentoMatricula: number, idPessoa: number): Observable<any> {
        return this.http.delete(`${this.API_BASE_URL}/remover-documento/${idDocumentoMatricula}/${idPessoa}`, this.httpOptions)
            .pipe(
                map(response => {
                    console.log('✅ Documento removido:', response);
                    return response;
                }),
                catchError(error => {
                    console.error('❌ Erro ao remover documento:', error);
                    throw error;
                })
            );
    }

    /**
     * Baixa um documento anexado
     */
    baixarDocumento(idDocumentoMatricula: number): Observable<Blob> {
        return this.http.get(`${this.API_BASE_URL}/baixar-documento/${idDocumentoMatricula}`, {
            responseType: 'blob'
        }).pipe(
            catchError(error => {
                console.error('❌ Erro ao baixar documento:', error);
                throw error;
            })
        );
    }

    /**
     * Valida se um arquivo é válido para upload
     */
    validarArquivo(arquivo: File): { valido: boolean; erro?: string } {
        // Tamanho máximo: 5MB
        const tamanhoMaximo = 5 * 1024 * 1024;
        if (arquivo.size > tamanhoMaximo) {
            return { valido: false, erro: 'Arquivo muito grande. Máximo permitido: 5MB' };
        }

        // Tipos permitidos
        const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
        if (!tiposPermitidos.includes(arquivo.type)) {
            return { valido: false, erro: 'Tipo de arquivo não permitido. Use PDF, JPG ou PNG' };
        }

        return { valido: true };
    }

    /**
     * Retorna ícone baseado na categoria do documento
     */
    obterIconeCategoria(categoria: string): string {
        switch (categoria.toUpperCase()) {
            case 'FAMILIA': return 'people-outline';
            case 'ALUNO': return 'person-outline';
            case 'TODOS_INTEGRANTES': return 'document-text-outline';
            default: return 'document-outline';
        }
    }

    /**
     * Retorna cor baseada no status do documento
     */
    obterCorStatus(status: string): string {
        switch (status?.toLowerCase()) {
            case 'pendente': return 'warning';
            case 'anexado': return 'primary';
            case 'aprovado': return 'success';
            case 'rejeitado': return 'danger';
            default: return 'medium';
        }
    }

}
