export enum TipoProcessamento {
    ANEXACAO = 'ANEXACAO',
    ASSINATURA = 'ASSINATURA'
}

export enum EscopoDocumento {
    FAMILIA = 'FAMILIA',
    ALUNO = 'ALUNO',
    TODOS_INTEGRANTES = 'TODOS_INTEGRANTES'
}

export interface TipoDocumento {
    idTipoDocumento?: number;
    nome: string;
    descricao?: string;
    tipoProcessamento: TipoProcessamento;
    escopo: EscopoDocumento;
    ativo: boolean;
    dataCriacao?: string;
    dataAtualizacao?: string;

    // Métodos calculados para compatibilidade
    requerAssinatura?: boolean;
    requerAnexo?: boolean;
    obrigatorio?: boolean;
    ordemExibicao?: number;
    templateDocumento?: string;
    documentoIdentidade?: boolean;
}

export interface TipoDocumentoCreateRequest {
    nome: string;
    descricao?: string;
    tipoProcessamento: TipoProcessamento;
    escopo: EscopoDocumento;
}

export interface TipoDocumentoUpdateRequest extends TipoDocumentoCreateRequest {
    idTipoDocumento: number;
}

export interface TipoDocumentoListResponse {
    content: TipoDocumento[];
    totalElements: number;
    totalPages: number;
    size: number;
    pageNumber: number;
    first: boolean;
    last: boolean;
}

export interface DocumentosOrganizados {
    documentosFamilia: TipoDocumento[];
    documentosAluno: TipoDocumento[];
    documentosTodosIntegrantes: TipoDocumento[];
}

export interface TipoDocumentoFilters {
    nome?: string;
    tipoProcessamento?: TipoProcessamento;
    escopo?: EscopoDocumento;
    ativo?: boolean;
}
