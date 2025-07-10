import { TipoVaga } from './interesse-matricula.interface';

export interface DocumentoMatricula {
  id: string;
  nome: string;
  descricao?: string;
  obrigatorio: boolean;
  tipo: 'documento' | 'declaracao' | 'comprovante';
}

export interface ConfiguracaoDocumentos {
  tipoVaga: TipoVaga;
  documentos: DocumentoMatricula[];
}