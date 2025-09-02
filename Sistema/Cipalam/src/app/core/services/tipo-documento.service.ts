import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import {
    TipoDocumento,
    TipoDocumentoCreateRequest,
    TipoDocumentoUpdateRequest,
    TipoDocumentoListResponse,
    TipoCota,
    EscopoDocumento
} from '../../funcionalidades/gerenciamento-tipos-documentos/models/tipo-documento.interface';

@Injectable({
    providedIn: 'root'
})
export class TipoDocumentoService {
    private readonly apiUrl = `${environment.apiUrl}/tipos-documento`;

    constructor(private http: HttpClient) { }

    /**
     * Lista todos os tipos de documentos com paginação opcional
     */
    listarTiposDocumentos(page: number = 0, size: number = 10, filtros?: any): Observable<TipoDocumento[]> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());

        if (filtros) {
            if (filtros.nome) {
                params = params.set('nome', filtros.nome);
            }
            if (filtros.tipoCota) {
                params = params.set('tipoCota', filtros.tipoCota);
            }
            if (filtros.escopo) {
                params = params.set('escopo', filtros.escopo);
            }
            if (filtros.ativo !== undefined) {
                params = params.set('ativo', filtros.ativo.toString());
            }
        }

        return this.http.get<TipoDocumentoListResponse>(`${this.apiUrl}`, { params })
            .pipe(
                map(response => response.content || response as any),
                catchError(error => {
                    console.error('Erro ao listar tipos de documentos:', error);
                    // Dados mock para desenvolvimento
                    return of([
                        {
                            idTipoDocumento: 1,
                            nome: 'Certidão de Nascimento',
                            descricao: 'Documento oficial de nascimento do aluno',
                            obrigatorio: true,
                            requerAssinatura: false,
                            requerAnexo: true,
                            tipoCota: null,
                            escopo: EscopoDocumento.ALUNO,
                            ativo: true,
                            ordemExibicao: 1
                        },
                        {
                            idTipoDocumento: 2,
                            nome: 'Comprovante de Renda',
                            descricao: 'Comprovante de renda familiar para cotas econômicas',
                            obrigatorio: true,
                            requerAssinatura: true,
                            requerAnexo: true,
                            tipoCota: TipoCota.ECONOMICA,
                            escopo: EscopoDocumento.FAMILIA,
                            ativo: true,
                            ordemExibicao: 2
                        },
                        {
                            idTipoDocumento: 3,
                            nome: 'Declaração de Vínculo',
                            descricao: 'Declaração de vínculo empregatício para funcionários',
                            obrigatorio: true,
                            requerAssinatura: true,
                            requerAnexo: true,
                            tipoCota: TipoCota.FUNCIONARIO,
                            escopo: EscopoDocumento.FAMILIA,
                            ativo: true,
                            ordemExibicao: 3
                        }
                    ]);
                })
            );
    }

    /**
     * Busca um tipo de documento por ID
     */
    buscarTipoDocumentoPorId(id: number): Observable<TipoDocumento> {
        return this.http.get<TipoDocumento>(`${this.apiUrl}/${id}`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao buscar tipo de documento:', error);
                    // Mock data para desenvolvimento
                    return of({
                        idTipoDocumento: id,
                        nome: 'Documento Mock',
                        descricao: 'Descrição mock para desenvolvimento',
                        obrigatorio: true,
                        requerAssinatura: false,
                        requerAnexo: true,
                        tipoCota: null,
                        escopo: EscopoDocumento.AMBOS,
                        ativo: true,
                        ordemExibicao: 1
                    });
                })
            );
    }

    /**
     * Cria um novo tipo de documento
     */
    criarTipoDocumento(tipoDocumento: TipoDocumentoCreateRequest): Observable<TipoDocumento> {
        return this.http.post<TipoDocumento>(this.apiUrl, tipoDocumento)
            .pipe(
                catchError(error => {
                    console.error('Erro ao criar tipo de documento:', error);
                    // Simula sucesso para desenvolvimento
                    return of({
                        ...tipoDocumento,
                        idTipoDocumento: Math.floor(Math.random() * 1000),
                        dataCriacao: new Date(),
                        dataAtualizacao: new Date()
                    } as TipoDocumento);
                })
            );
    }

    /**
     * Atualiza um tipo de documento existente
     */
    atualizarTipoDocumento(tipoDocumento: TipoDocumentoUpdateRequest): Observable<TipoDocumento> {
        return this.http.put<TipoDocumento>(`${this.apiUrl}/${tipoDocumento.idTipoDocumento}`, tipoDocumento)
            .pipe(
                catchError(error => {
                    console.error('Erro ao atualizar tipo de documento:', error);
                    // Simula sucesso para desenvolvimento
                    return of({
                        ...tipoDocumento,
                        dataAtualizacao: new Date()
                    } as TipoDocumento);
                })
            );
    }

    /**
     * Remove um tipo de documento
     */
    removerTipoDocumento(id: number): Observable<boolean> {
        return this.http.delete<void>(`${this.apiUrl}/${id}`)
            .pipe(
                map(() => true),
                catchError(error => {
                    console.error('Erro ao remover tipo de documento:', error);
                    // Simula sucesso para desenvolvimento
                    return of(true);
                })
            );
    }

    /**
     * Alterna o status ativo/inativo de um tipo de documento
     */
    alternarStatusTipoDocumento(id: number): Observable<TipoDocumento> {
        return this.http.patch<TipoDocumento>(`${this.apiUrl}/${id}/alternar-status`, {})
            .pipe(
                catchError(error => {
                    console.error('Erro ao alternar status do tipo de documento:', error);
                    // Simula sucesso para desenvolvimento
                    return this.buscarTipoDocumentoPorId(id);
                })
            );
    }

    /**
     * Lista tipos de documentos por tipo de cota
     */
    listarPorTipoCota(tipoCota: TipoCota): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/cota/${tipoCota}`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar tipos de documentos por cota:', error);
                    return of([]);
                })
            );
    }

    /**
     * Lista tipos de documentos por escopo
     */
    listarPorEscopo(escopo: EscopoDocumento): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/escopo/${escopo}`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar tipos de documentos por escopo:', error);
                    return of([]);
                })
            );
    }

    /**
     * Lista documentos obrigatórios para uma cota
     */
    listarObrigatoriosPorCota(tipoCota: TipoCota): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/obrigatorios/cota/${tipoCota}`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar documentos obrigatórios por cota:', error);
                    return of([]);
                })
            );
    }

    /**
     * Lista documentos que requerem assinatura
     */
    listarQueRequeremAssinatura(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/assinatura`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar documentos de assinatura:', error);
                    return of([]);
                })
            );
    }

    /**
     * Lista documentos que requerem anexo
     */
    listarQueRequeremAnexo(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/anexo`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar documentos de anexo:', error);
                    return of([]);
                })
            );
    }

    /**
     * Busca tipos de documentos por nome
     */
    buscarPorNome(nome: string): Observable<TipoDocumento[]> {
        const params = new HttpParams().set('nome', nome);
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/buscar`, { params })
            .pipe(
                catchError(error => {
                    console.error('Erro ao buscar tipos de documentos por nome:', error);
                    return of([]);
                })
            );
    }

    /**
     * Alterna o status ativo/inativo de um tipo de documento
     */
    alternarStatus(id: number): Observable<TipoDocumento> {
        return this.http.patch<TipoDocumento>(`${this.apiUrl}/${id}/alternar-status`, {})
            .pipe(
                catchError(error => {
                    console.error('Erro ao alternar status do tipo de documento:', error);
                    throw error;
                })
            );
    }

    /**
     * Reordena tipos de documentos
     */
    reordenarTiposDocumentos(idsOrdenados: number[]): Observable<any> {
        return this.http.put(`${this.apiUrl}/reordenar`, idsOrdenados)
            .pipe(
                catchError(error => {
                    console.error('Erro ao reordenar tipos de documentos:', error);
                    throw error;
                })
            );
    }

    /**
     * Valida se um tipo de documento pode ser removido
     */
    podeRemoverTipoDocumento(id: number): Observable<boolean> {
        return this.http.get<{ podeRemover: boolean }>(`${this.apiUrl}/${id}/pode-remover`)
            .pipe(
                map(response => response.podeRemover),
                catchError(error => {
                    console.error('Erro ao verificar se pode remover tipo de documento:', error);
                    // Por padrão, permite remoção
                    return of(true);
                })
            );
    }

    // =====================================================================
    // MÉTODOS ESPECÍFICOS PARA CONFIGURAÇÃO POR COTA
    // =====================================================================

    /**
     * Lista documentos configuráveis por cota (para página de configuração)
     */
    listarDocumentosConfiguracao(tipoCota: TipoCota): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/configuracao/${tipoCota}`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar documentos de configuração:', error);
                    return of([]);
                })
            );
    }

    /**
     * Lista todos os documentos disponíveis para configuração
     */
    listarTodosParaConfiguracao(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/configuracao/todos`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar todos documentos para configuração:', error);
                    return of([]);
                })
            );
    }

    /**
     * Aplica configuração de documentos por cota
     */
    aplicarConfiguracaoCota(tipoCota: TipoCota, configuracao: any): Observable<any> {
        return this.http.post(`${this.apiUrl}/configuracao/${tipoCota}/aplicar`, configuracao)
            .pipe(
                catchError(error => {
                    console.error('Erro ao aplicar configuração de cota:', error);
                    throw error;
                })
            );
    }

    /**
     * Obtém estatísticas de documentos por cota
     */
    obterEstatisticasCota(tipoCota: TipoCota): Observable<any> {
        return this.http.get(`${this.apiUrl}/configuracao/${tipoCota}/estatisticas`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao obter estatísticas da cota:', error);
                    return of({
                        totalDocumentos: 0,
                        documentosObrigatorios: 0,
                        documentosAssinatura: 0,
                        documentosAnexo: 0,
                        tipoCota: tipoCota
                    });
                })
            );
    }

    // =====================================================================
    // MÉTODOS DE COMPATIBILIDADE COM VERSÕES ANTERIORES
    // =====================================================================

    /**
     * Lista todos os tipos de documentos (compatibilidade)
     */
    listarTodos(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/todos`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar todos tipos de documentos:', error);
                    return of([]);
                })
            );
    }

    /**
     * Lista tipos de documentos ativos (compatibilidade)
     */
    listarAtivos(): Observable<TipoDocumento[]> {
        return this.http.get<TipoDocumento[]>(`${this.apiUrl}/ativos`)
            .pipe(
                catchError(error => {
                    console.error('Erro ao listar tipos de documentos ativos:', error);
                    return of([]);
                })
            );
    }

    /**
     * Método auxiliar para detectar se é documento de identidade
     */
    isDocumentoIdentidade(nomeDocumento: string): boolean {
        const documentosIdentidade = ['rg', 'cnh', 'identidade', 'carteira'];
        return documentosIdentidade.some(termo =>
            nomeDocumento.toLowerCase().includes(termo)
        );
    }

    /**
     * Método para verificar tipo de processamento do documento
     */
    getTipoProcessamento(tipoDocumento: TipoDocumento): 'ASSINATURA' | 'ANEXO' | 'AMBOS' {
        if (tipoDocumento.requerAssinatura && tipoDocumento.requerAnexo) {
            return 'AMBOS';
        } else if (tipoDocumento.requerAssinatura) {
            return 'ASSINATURA';
        } else {
            return 'ANEXO';
        }
    }
}
