import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from './api-config.service';
import {
    TipoDocumento,
    TipoDocumentoListResponse,
    TipoDocumentoFilters
} from '../models/tipo-documento.interface';

@Injectable({
    providedIn: 'root'
})
export class TipoDocumentoService {

    constructor(
        private http: HttpClient,
        private apiConfig: ApiConfigService
    ) { }

    /**
     * Lista todos os tipos de documentos com paginação e filtros
     */
    listarTiposDocumentos(
        page: number = 0,
        size: number = 10,
        filters?: TipoDocumentoFilters
    ): Observable<TipoDocumentoListResponse> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filters) {
            if (filters.nome) {
                params = params.set('nome', filters.nome);
            }
            if (filters.modalidadeEntrega) {
                params = params.set('modalidadeEntrega', filters.modalidadeEntrega);
            }
            if (filters.quemDeveFornencer) {
                params = params.set('quemDeveFornencer', filters.quemDeveFornencer);
            }
            if (filters.ativo !== undefined) {
                params = params.set('ativo', filters.ativo.toString());
            }
        }

        return this.http.get<TipoDocumentoListResponse>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento`,
            { params }
        );
    }

    /**
     * Lista apenas os tipos de documentos ativos
     */
    listarTiposDocumentosAtivos(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/ativos`
        );
    }

    /**
     * Lista documentos organizados por modalidade
     */
    listarDocumentosOrganizados(): Observable<any> {
        return this.http.get<any>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/organizados`
        );
    }

    /**
     * Busca tipo de documento por ID
     */
    buscarPorId(id: number): Observable<TipoDocumento> {
        return this.http.get<TipoDocumento>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/${id}`
        );
    }

    /**
     * Cria novo tipo de documento
     */
    criarTipoDocumento(tipoDocumento: any): Observable<TipoDocumento> {
        return this.http.post<TipoDocumento>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento`,
            tipoDocumento
        );
    }

    /**
     * Atualiza tipo de documento existente
     */
    atualizarTipoDocumento(id: number, tipoDocumento: any): Observable<TipoDocumento> {
        return this.http.put<TipoDocumento>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/${id}`,
            tipoDocumento
        );
    }

    /**
     * Desativa tipo de documento (soft delete)
     */
    desativarTipoDocumento(id: number): Observable<{ mensagem: string }> {
        return this.http.patch<{ mensagem: string }>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/${id}/desativar`,
            {}
        );
    }

    /**
     * Remove permanentemente tipo de documento
     */
    removerTipoDocumento(id: number): Observable<{ mensagem: string }> {
        return this.http.delete<{ mensagem: string }>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/${id}`
        );
    }

    /**
     * Busca documentos por modalidade de entrega
     */
    buscarPorModalidadeEntrega(modalidade: string): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/modalidade/${modalidade}`
        );
    }

    /**
     * Busca documentos por quem deve fornecer
     */
    buscarPorQuemDeveFornencer(fornecedor: string): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/fornecedor/${fornecedor}`
        );
    }

    /**
     * Busca documentos por nome
     */
    buscarPorNome(nome: string): Observable<TipoDocumento[]> {
        const params = new HttpParams().set('nome', nome);
        return this.http.get<TipoDocumento[]>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/buscar`,
            { params }
        );
    }

    /**
     * Testa conectividade com a API
     */
    testarConectividade(): Observable<any> {
        return this.http.get<any>(
            `${this.apiConfig.getBaseUrl()}/tipos-documento/teste`
        );
    }

    /**
     * Busca um tipo de documento por ID
     */
    buscarTipoDocumentoPorId(id: number): Observable<TipoDocumento> {
        return this.http.get<TipoDocumento>(`${this.apiConfig.getBaseUrl()}/tipos-documento/${id}`);
    }

    /**
     * Exclui um tipo de documento
     */
    excluirTipoDocumento(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiConfig.getBaseUrl()}/tipos-documento/${id}`);
    }
}
