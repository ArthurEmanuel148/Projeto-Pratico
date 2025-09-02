export enum TipoCota {
    LIVRE = 'LIVRE',
    ECONOMICA = 'ECONOMICA',
    FUNCIONARIO = 'FUNCIONARIO'
}

export enum EscopoDocumento {
    FAMILIA = 'FAMILIA',
    ALUNO = 'ALUNO',
    AMBOS = 'AMBOS'
}

export interface TipoDocumento {
    idTipoDocumento?: number;
    nome: string;
    descricao?: string;
    obrigatorio: boolean;
    requerAssinatura: boolean;
    requerAnexo: boolean;
    tipoCota?: TipoCota | null;
    escopo: EscopoDocumento;
    ativo: boolean;
    ordemExibicao: number;
    templateDocumento?: string;
    dataCriacao?: Date;
    dataAtualizacao?: Date;
}

export interface TipoDocumentoCreateRequest {
    nome: string;
    descricao?: string;
    obrigatorio: boolean;
    requerAssinatura: boolean;
    requerAnexo: boolean;
    tipoCota?: TipoCota | null;
    escopo: EscopoDocumento;
    ativo: boolean;
    ordemExibicao: number;
    templateDocumento?: string;
}

export interface TipoDocumentoUpdateRequest extends TipoDocumentoCreateRequest {
    idTipoDocumento: number;
}

export interface TipoDocumentoListResponse {
    content: TipoDocumento[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}

export interface TipoDocumentoFilter {
    nome?: string;
    tipoCota?: TipoCota;
    escopo?: EscopoDocumento;
    ativo?: boolean;
}
