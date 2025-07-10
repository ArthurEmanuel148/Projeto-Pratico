// src/app/core/models/matricula.model.ts

export interface InteresseMatricula {
  id: number;
  protocolo: string;
  nomeCompleto: string;
  cpf: string;
  email: string;
  telefone: string;
  tipoEscola: string;
  anoLetivo: string;
  serieDesejada: string;
  tipoCota: string;
  status: StatusMatricula;
  dataEnvio: Date;
  dataInicioMatricula?: Date;
  funcionarioResponsavel?: {
    id: number;
    nome: string;
  };
  responsavelLogin?: {
    id: number;
    nome: string;
  };
  observacoes?: string;
}

export type StatusMatricula =
  | 'interesse_declarado'
  | 'matricula_iniciada'
  | 'documentos_pendentes'
  | 'documentos_completos'
  | 'matricula_concluida'
  | 'matricula_cancelada';

export interface TipoDocumento {
  idTipoDocumento: number;
  nome: string;
  descricao: string;
  obrigatorio: boolean;
  requerAssinatura: boolean;
  requerAnexo: boolean;
  tipoCota?: string; // NULL = todos os tipos
  ativo: boolean;
  ordemExibicao: number;
  templateDocumento?: string;
}

export interface DocumentoMatricula {
  idDocumentoMatricula: number;
  tbInteresseMatricula_id: number;
  tipoDocumento: TipoDocumento;
  status: StatusDocumento;
  caminhoArquivo?: string;
  nomeArquivoOriginal?: string;
  tipoArquivo?: string;
  tamanhoArquivo?: number;
  assinaturaDigital?: string;
  dataEnvio?: Date;
  dataAssinatura?: Date;
  dataAprovacao?: Date;
  observacoes?: string;
  funcionarioAprovador?: {
    id: number;
    nome: string;
  };
}

export type StatusDocumento =
  | 'pendente'
  | 'anexado'
  | 'assinado'
  | 'aprovado'
  | 'rejeitado';

export interface LogMatricula {
  idLogMatricula: number;
  tbInteresseMatricula_id: number;
  acao: string;
  descricao?: string;
  usuario?: {
    id: number;
    nome: string;
  };
  dataAcao: Date;
  dadosAntes?: any;
  dadosDepois?: any;
}

export interface IniciarMatriculaRequest {
  interesseId: number;
  funcionarioId: number;
  observacoes?: string;
}

export interface IniciarMatriculaResponse {
  success: boolean;
  message: string;
  matricula: InteresseMatricula;
  credenciaisResponsavel: {
    usuario: string;
    senhaTemporaria: string;
  };
}

export interface DocumentosPendentesResponse {
  documentos: DocumentoMatricula[];
  totalPendentes: number;
  totalCompletos: number;
  percentualConclusao: number;
}

export interface AnexarDocumentoRequest {
  documentoId: number;
  arquivo: File;
  observacoes?: string;
}

export interface AssinarDocumentoRequest {
  documentoId: number;
  assinatura: string; // Base64 da assinatura digital
  observacoes?: string;
}

export interface AprovarDocumentoRequest {
  documentoId: number;
  aprovado: boolean;
  observacoes?: string;
  funcionarioId: number;
}

export interface StatusMatriculaResponse {
  matricula: InteresseMatricula;
  documentos: DocumentoMatricula[];
  progressoDocumentos: {
    total: number;
    completos: number;
    pendentes: number;
    percentual: number;
  };
}

export interface DocumentoUploadResponse {
  success: boolean;
  message: string;
  documento?: DocumentoMatricula;
}

export interface AssinaturaDigitalRequest {
  documentoId: number;
  conteudoAssinatura: string;
  observacoes?: string;
}

export interface AssinaturaDigitalResponse {
  success: boolean;
  message: string;
  documento?: DocumentoMatricula;
}

export interface ApiResponse {
  success: boolean;
  message: string;
}

export interface TemplateDocumentoResponse {
  template: string;
}
