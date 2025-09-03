export interface ConfiguracaoDocumentosCota {
  id?: number;
  tipoCota: TipoCota;
  documentosObrigatorios: number[];
  dataAtualizacao?: string;
  funcionarioResponsavel?: any;
}

export enum TipoCota {
  LIVRE = 'LIVRE',
  ECONOMICA = 'ECONOMICA', 
  FUNCIONARIO = 'FUNCIONARIO'
}

export interface ConfiguracaoDocumentosCotaRequest {
  tipoCota: string;
  documentosObrigatorios: number[];
  funcionarioId?: number;
}

export interface ConfiguracaoDocumentosCotaResponse {
  success: boolean;
  message: string;
  data?: ConfiguracaoDocumentosCota;
}

export type ConfiguracaoPorCota = Record<string, number[]>;
