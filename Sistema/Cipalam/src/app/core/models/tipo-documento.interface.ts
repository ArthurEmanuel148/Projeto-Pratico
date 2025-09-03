// Modalidade de entrega do documento
export enum ModalidadeEntrega {
    ASSINADO = 'ASSINADO',     // Documento que será assinado digitalmente
    ANEXADO = 'ANEXADO'        // Documento que será anexado/upload
}

// Quem deve fornecer o documento
export enum QuemDeveFornencer {
    RESPONSAVEL = 'RESPONSAVEL',           // Apenas o responsável
    ALUNO = 'ALUNO',                      // Apenas o aluno
    TODOS_INTEGRANTES = 'TODOS_INTEGRANTES', // Todos os integrantes da família
    FAMILIA = 'FAMILIA'                   // Documento da família
}

export interface TipoDocumento {
    idTipoDocumento?: number;
    nome: string;
    descricao?: string;
    modalidadeEntrega: ModalidadeEntrega; // ASSINADO ou ANEXADO
    quemDeveFornencer: QuemDeveFornencer; // RESPONSAVEL, ALUNO, TODOS_INTEGRANTES, FAMILIA
    ativo: boolean;
    observacoes?: string;
    dataInclusao?: Date;
    dataAlteracao?: Date;
}

// Request para criar tipo de documento
export interface CriarTipoDocumentoRequest {
    nome: string;
    descricao?: string;
    modalidadeEntrega: ModalidadeEntrega;
    quemDeveFornencer: QuemDeveFornencer;
    observacoes?: string;
}

// Request para atualizar tipo de documento
export interface AtualizarTipoDocumentoRequest {
    nome?: string;
    descricao?: string;
    modalidadeEntrega?: ModalidadeEntrega;
    quemDeveFornencer?: QuemDeveFornencer;
    ativo?: boolean;
    observacoes?: string;
}

// Response da API com paginação
export interface TipoDocumentoListResponse {
    content: TipoDocumento[];
    totalElements: number;
    totalPages: number;
    size: number;
    pageNumber: number;
    first: boolean;
    last: boolean;
}

// Filtros para pesquisa
export interface TipoDocumentoFilters {
    nome?: string;
    modalidadeEntrega?: ModalidadeEntrega;
    quemDeveFornencer?: QuemDeveFornencer;
    ativo?: boolean;
}
