import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ApiConfigService } from '../../../core/services/api-config.service';
import { 
  ConfiguracaoDocumentosCota, 
  ConfiguracaoDocumentosCotaRequest,
  ConfiguracaoDocumentosCotaResponse,
  ConfiguracaoPorCota
} from '../models/configuracao-documentos-cota.interface';

@Injectable({
  providedIn: 'root'
})
export class ConfiguracaoDocumentosCotaService {

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  /**
   * Lista todas as configurações de documentos por cota
   */
  listarConfiguracoes(): Observable<ConfiguracaoDocumentosCota[]> {
    return this.http.get<ConfiguracaoDocumentosCota[]>(
      `${this.apiConfig.getBaseUrl()}/configuracao-documentos`
    );
  }

  /**
   * Lista configurações no formato otimizado para frontend
   */
  listarConfiguracoesFrontend(): Observable<ConfiguracaoPorCota> {
    return this.http.get<ConfiguracaoPorCota>(
      `${this.apiConfig.getBaseUrl()}/configuracao-documentos?format=frontend`
    );
  }

  /**
   * Busca configuração por tipo de cota
   */
  buscarPorTipoCota(tipoCota: string): Observable<ConfiguracaoDocumentosCota> {
    return this.http.get<ConfiguracaoDocumentosCota>(
      `${this.apiConfig.getBaseUrl()}/configuracao-documentos/${tipoCota}`
    );
  }

  /**
   * Salva ou atualiza configuração de documentos por cota
   */
  salvarConfiguracao(configuracao: ConfiguracaoDocumentosCotaRequest): Observable<ConfiguracaoDocumentosCotaResponse> {
    return this.http.post<ConfiguracaoDocumentosCotaResponse>(
      `${this.apiConfig.getBaseUrl()}/configuracao-documentos`,
      configuracao
    );
  }

  /**
   * Atualiza configuração existente
   */
  atualizarConfiguracao(id: number, configuracao: ConfiguracaoDocumentosCota): Observable<ConfiguracaoDocumentosCota> {
    return this.http.put<ConfiguracaoDocumentosCota>(
      `${this.apiConfig.getBaseUrl()}/configuracao-documentos/${id}`,
      configuracao
    );
  }

  /**
   * Deleta configuração
   */
  deletarConfiguracao(id: number): Observable<void> {
    return this.http.delete<void>(
      `${this.apiConfig.getBaseUrl()}/configuracao-documentos/${id}`
    );
  }
}
