import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

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

    constructor(private http: HttpClient, private authService: AuthService) { }

    private getHttpOptions(): { headers: HttpHeaders } {
        const usuario = this.authService.getFuncionarioLogado();
        const token = usuario?.token || '';

        console.log('🔑 Token para requisição:', token ? 'Token presente' : 'Token ausente');

        const headers = new HttpHeaders({
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        });

        return { headers };
    }

    /**
     * Busca todos os documentos da família organizados por pessoa (DEPRECIADO - usa família)
     */
    getDocumentosPorFamilia(idResponsavel: number): Observable<FamiliaDocumentos> {
        const url = `${this.API_BASE_URL}/${idResponsavel}/familia/documentos`;
        console.log(`🌐 Fazendo requisição para: ${url}`);

        return this.http.get<FamiliaDocumentos>(url, this.getHttpOptions())
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
     * Busca documentos da matrícula/declaração do responsável (MÉTODO CORRETO)
     */
    getDocumentosPorMatricula(idResponsavel: number): Observable<FamiliaDocumentos> {
        // TEMPORÁRIO: usar declaração ID 4 diretamente para teste
        const url = `${this.API_BASE_URL}/declaracao/4/documentos`;
        console.log(`🌐 TESTE: Fazendo requisição direta para declaração ID 4: ${url}`);

        return this.http.get<FamiliaDocumentos>(url, this.getHttpOptions())
            .pipe(
                map(response => {
                    console.log('✅ Documentos da declaração recebidos do backend:', response);
                    return response;
                }),
                catchError(error => {
                    console.error('❌ Erro ao buscar documentos da declaração:', error);
                    console.error('URL tentativa:', url);
                    console.error('Status:', error.status);
                    console.error('Mensagem:', error.message);
                    throw error; // Propagar o erro real
                })
            );
    }

    /**
     * Busca documentos da matrícula FINALIZADA pelo ID do responsável
     * Usa endpoint de turmas-alunos que busca aluno vinculado ao responsável
     */
    getDocumentosPorResponsavelMatriculaFinalizada(idResponsavel: number): Observable<FamiliaDocumentos> {
        const url = `${environment.apiUrl}/turmas-alunos/responsavel/${idResponsavel}/documentos`;
        console.log(`🌐 Buscando documentos de matrícula finalizada para responsável ID ${idResponsavel}: ${url}`);

        return this.http.get<FamiliaDocumentos>(url, this.getHttpOptions())
            .pipe(
                map(response => {
                    console.log('✅ Documentos da matrícula finalizada recebidos do backend:', response);
                    return response;
                }),
                catchError(error => {
                    console.error('❌ Erro ao buscar documentos da matrícula finalizada:', error);
                    console.error('URL tentativa:', url);
                    console.error('Status:', error.status);
                    console.error('Mensagem:', error.message);
                    throw error; // Propagar o erro real
                })
            );
    }

    /**
     * Busca documentos de uma declaração específica para área administrativa
     */
    getDocumentosPorDeclaracao(idDeclaracao: number): Observable<any[]> {
        // Usar o endpoint correto com o ID da declaração
        const url = `${this.API_BASE_URL}/declaracao/${idDeclaracao}/documentos`;
        console.log(`🌐 Buscando documentos para declaração ID: ${idDeclaracao}`);

        return this.http.get<any>(url, this.getHttpOptions())
            .pipe(
                map((response: any) => {
                    console.log('✅ Documentos da declaração recebidos:', response);
                    // Flatten todos os documentos de todas as pessoas em um array único
                    const todosDocumentos: any[] = [];
                    if (response && response.documentosPorPessoa) {
                        response.documentosPorPessoa.forEach((pessoaDoc: any) => {
                            pessoaDoc.documentos.forEach((doc: any) => {
                                todosDocumentos.push({
                                    ...doc,
                                    nomeIntegrante: pessoaDoc.pessoa.nome,
                                    parentesco: pessoaDoc.pessoa.parentesco
                                });
                            });
                        });
                    }
                    console.log('✅ Documentos processados:', todosDocumentos);
                    return todosDocumentos;
                }),
                catchError(error => {
                    console.error('❌ Erro ao buscar documentos da declaração:', error);
                    return of([]); // Retornar array vazio em caso de erro
                })
            );
    }

    /**
     * Anexa um arquivo para um documento específico
     */
    anexarDocumento(arquivo: File, idDocumentoMatricula: number, idPessoa: number): Observable<any> {
        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('documentoId', idDocumentoMatricula.toString());

        const usuario = this.authService.getFuncionarioLogado();
        const token = usuario?.token || '';

        console.log('🔑 Token para anexo:', token ? 'Token presente' : 'Token ausente');

        // Para FormData, não definir Content-Type para deixar o browser definir automaticamente
        const headers = new HttpHeaders({
            ...(token && { 'Authorization': `Bearer ${token}` })
        });

        const url = `${environment.apiUrl}/responsavel/anexar-documento`;
        console.log(`🌐 Anexando documento via: ${url}`);

        return this.http.post(url, formData, { headers })
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
     * Anexa um arquivo para um documento de matrícula FINALIZADA
     * Salva em tbDocumentoMatricula vinculado às tabelas finais (tbFamilia, tbAluno, tbIntegranteFamilia)
     */
    anexarDocumentoMatriculaFinalizada(arquivo: File, idDocumentoMatricula: number, idResponsavel: number): Observable<any> {
        console.log('🔵 === INICIANDO ANEXAÇÃO MATRÍCULA FINALIZADA ===');
        console.log('📂 Arquivo:', arquivo.name, '- Tamanho:', arquivo.size, 'bytes');
        console.log('🆔 Documento ID:', idDocumentoMatricula);
        console.log('👤 Responsável ID:', idResponsavel);

        const formData = new FormData();
        formData.append('arquivo', arquivo);
        formData.append('documentoId', idDocumentoMatricula.toString());
        formData.append('responsavelId', idResponsavel.toString());

        console.log('📦 FormData criado com 3 campos');

        const usuario = this.authService.getFuncionarioLogado();
        const token = usuario?.token || '';

        console.log('🔑 Token para anexo (matrícula finalizada):', token ? 'Token presente' : 'Token ausente');

        // Para FormData, não definir Content-Type para deixar o browser definir automaticamente
        const headers = new HttpHeaders({
            ...(token && { 'Authorization': `Bearer ${token}` })
        });

        const url = `${environment.apiUrl}/turmas-alunos/responsavel/anexar-documento`;
        console.log(`🌐 URL da requisição: ${url}`);
        console.log('📡 Enviando requisição POST...');

        return this.http.post(url, formData, { headers })
            .pipe(
                map(response => {
                    console.log('✅ SUCESSO - Documento de matrícula finalizada anexado:', response);
                    return response;
                }),
                catchError(error => {
                    console.error('❌ ERRO ao anexar documento de matrícula finalizada:');
                    console.error('Status:', error.status);
                    console.error('Mensagem:', error.message);
                    console.error('Detalhes:', error);
                    throw error;
                })
            );
    }

    /**
     * Remove um documento anexado
     */
    removerDocumento(idDocumentoMatricula: number, idPessoa: number): Observable<any> {
        return this.http.delete(`${this.API_BASE_URL}/remover-documento/${idDocumentoMatricula}/${idPessoa}`, this.getHttpOptions())
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
     * Visualiza um documento em nova guia (DECLARAÇÃO)
     */
    visualizarDocumento(idDocumentoMatricula: number): Observable<Blob> {
        return this.http.get(`${this.API_BASE_URL}/familia/visualizar-documento/${idDocumentoMatricula}`, {
            responseType: 'blob'
        }).pipe(
            catchError(error => {
                console.error('❌ Erro ao visualizar documento:', error);
                throw error;
            })
        );
    }

    /**
     * Visualiza um documento em nova guia (MATRÍCULA FINALIZADA)
     * Usa o endpoint do backend que serve o arquivo com autenticação JWT
     */
    visualizarDocumentoMatriculaFinalizada(idDocumentoMatricula: number): Observable<Blob> {
        console.log('========================================');
        console.log('📥 SERVICE: Visualizando documento (Matrícula Finalizada)');
        console.log('ID do Documento:', idDocumentoMatricula);

        const url = `${environment.apiUrl}/turmas-alunos/documentos/${idDocumentoMatricula}/arquivo`;
        console.log('🌐 URL:', url);

        return this.http.get(url, {
            responseType: 'blob'
        }).pipe(
            map(blob => {
                console.log('✅ Arquivo recebido! Tamanho:', blob.size, 'bytes');
                console.log('========================================');
                return blob;
            }),
            catchError(error => {
                console.error('========================================');
                console.error('❌ Erro ao visualizar documento:', error);
                console.error('Status:', error.status);
                console.error('Mensagem:', error.message);
                console.error('========================================');
                throw error;
            })
        );
    }

    /**
     * Baixa um documento anexado
     */
    baixarDocumento(idDocumentoMatricula: number): Observable<Blob> {
        return this.http.get(`${this.API_BASE_URL}/familia/baixar-documento/${idDocumentoMatricula}`, {
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
