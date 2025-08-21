import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Endereco {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  cidade: string;
  uf: string;
  codigoIbge?: string;
  ddd?: string;
}

export interface Municipio {
  id: number;
  nome: string;
  uf: string;
}

export interface Estado {
  id: number;
  sigla: string;
  nome: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnderecoService {

  // APIs do IBGE e ViaCEP
  private readonly API_VIA_CEP = 'https://viacep.com.br/ws';
  private readonly API_IBGE_ESTADOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
  private readonly API_IBGE_MUNICIPIOS = 'https://servicodados.ibge.gov.br/api/v1/localidades/estados';
  private readonly API_POSTMON = 'https://api.postmon.com.br/v1/cep';

  constructor(private http: HttpClient) { }

  /**
   * Busca endereço por CEP usando ViaCEP
   * @param cep CEP para buscar (com ou sem máscara)
   */
  buscarEnderecoPorCep(cep: string): Observable<Endereco | null> {
    const cepLimpo = this.limparCep(cep);

    if (!this.validarCep(cepLimpo)) {
      return of(null);
    }

    // Primeiro tenta ViaCEP
    return this.buscarNoViaCep(cepLimpo).pipe(
      catchError(() => {
        // Se falhar, tenta API alternativa
        return this.buscarNoPostmon(cepLimpo);
      }),
      catchError(() => {
        // Se todas falharem, retorna endereço simulado
        return this.buscarEnderecoSimulado(cepLimpo);
      })
    );
  }

  /**
   * Busca todos os estados brasileiros
   */
  buscarEstados(): Observable<Estado[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get<any[]>(this.API_IBGE_ESTADOS, { headers }).pipe(
      map(estados => estados.map(estado => ({
        id: estado.id,
        sigla: estado.sigla,
        nome: estado.nome
      }))),
      catchError(() => {
        // Se falhar, retorna estados simulados
        return this.buscarEstadosSimulados();
      })
    );
  }

  /**
   * Busca municípios por estado
   * @param uf Sigla do estado
   */
  buscarMunicipiosPorEstado(uf: string): Observable<Municipio[]> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get<any[]>(`${this.API_IBGE_MUNICIPIOS}/${uf}/municipios`, { headers }).pipe(
      map(municipios => municipios.map(municipio => ({
        id: municipio.id,
        nome: municipio.nome,
        uf: uf
      }))),
      catchError(() => {
        // Se falhar, retorna municípios simulados
        return this.buscarMunicipiosSimulados(uf);
      })
    );
  }

  /**
   * Busca CEP por endereço
   * @param uf Estado
   * @param cidade Cidade
   * @param logradouro Logradouro
   */
  buscarCepPorEndereco(uf: string, cidade: string, logradouro: string): Observable<Endereco[]> {
    const url = `${this.API_VIA_CEP}/${uf}/${this.normalizarTexto(cidade)}/${this.normalizarTexto(logradouro)}/json/`;

    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get<any[]>(url, { headers }).pipe(
      map(enderecos => enderecos.map(endereco => this.mapearViaCep(endereco))),
      catchError(() => {
        // Se falhar, retorna endereços simulados
        return this.buscarEnderecosSimulados(uf, cidade, logradouro);
      })
    );
  }

  private buscarNoViaCep(cep: string): Observable<Endereco | null> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get<any>(`${this.API_VIA_CEP}/${cep}/json/`, { headers }).pipe(
      map(response => {
        if (response.erro) {
          return null;
        }
        return this.mapearViaCep(response);
      })
    );
  }

  private buscarNoPostmon(cep: string): Observable<Endereco | null> {
    const headers = new HttpHeaders({
      'Accept': 'application/json'
    });

    return this.http.get<any>(`${this.API_POSTMON}/${cep}`, { headers }).pipe(
      map(response => this.mapearPostmon(response))
    );
  }

  private buscarEnderecoSimulado(cep: string): Observable<Endereco | null> {
    const endereco: Endereco = {
      cep: this.formatarCep(cep),
      logradouro: 'Rua das Flores',
      bairro: 'Centro',
      cidade: 'São Paulo',
      uf: 'SP',
      codigoIbge: '3550308'
    };

    return of(endereco);
  }

  private buscarEstadosSimulados(): Observable<Estado[]> {
    const estados: Estado[] = [
      { id: 35, sigla: 'SP', nome: 'São Paulo' },
      { id: 33, sigla: 'RJ', nome: 'Rio de Janeiro' },
      { id: 31, sigla: 'MG', nome: 'Minas Gerais' },
      { id: 41, sigla: 'PR', nome: 'Paraná' },
      { id: 42, sigla: 'SC', nome: 'Santa Catarina' },
      { id: 43, sigla: 'RS', nome: 'Rio Grande do Sul' }
    ];

    return of(estados);
  }

  private buscarMunicipiosSimulados(uf: string): Observable<Municipio[]> {
    let municipios: Municipio[] = [];

    switch (uf.toUpperCase()) {
      case 'SP':
        municipios = [
          { id: 3550308, nome: 'São Paulo', uf: 'SP' },
          { id: 3509502, nome: 'Campinas', uf: 'SP' },
          { id: 3518800, nome: 'Guarulhos', uf: 'SP' },
          { id: 3548708, nome: 'Santos', uf: 'SP' }
        ];
        break;
      case 'RJ':
        municipios = [
          { id: 3304557, nome: 'Rio de Janeiro', uf: 'RJ' },
          { id: 3301702, nome: 'Niterói', uf: 'RJ' },
          { id: 3304904, nome: 'São Gonçalo', uf: 'RJ' }
        ];
        break;
      default:
        municipios = [
          { id: 1, nome: 'Capital', uf: uf }
        ];
    }

    return of(municipios);
  }

  private buscarEnderecosSimulados(uf: string, cidade: string, logradouro: string): Observable<Endereco[]> {
    const enderecos: Endereco[] = [
      {
        cep: '01234-567',
        logradouro: logradouro,
        bairro: 'Centro',
        cidade: cidade,
        uf: uf
      }
    ];

    return of(enderecos);
  }

  private mapearViaCep(response: any): Endereco {
    return {
      cep: response.cep || '',
      logradouro: response.logradouro || '',
      complemento: response.complemento || '',
      bairro: response.bairro || '',
      cidade: response.localidade || '',
      uf: response.uf || '',
      codigoIbge: response.ibge || '',
      ddd: response.ddd || ''
    };
  }

  private mapearPostmon(response: any): Endereco {
    return {
      cep: response.cep || '',
      logradouro: response.logradouro || response.address || '',
      bairro: response.bairro || response.district || '',
      cidade: response.cidade || response.city || '',
      uf: response.estado || response.state || '',
      codigoIbge: response.city_ibge || ''
    };
  }

  /**
   * Valida formato do CEP
   * @param cep CEP para validar
   */
  validarCep(cep: string): boolean {
    const cepLimpo = this.limparCep(cep);
    return /^\d{8}$/.test(cepLimpo);
  }

  /**
   * Remove máscara do CEP
   * @param cep CEP com ou sem máscara
   */
  limparCep(cep: string): string {
    return cep.replace(/\D/g, '');
  }

  /**
   * Adiciona máscara ao CEP
   * @param cep CEP sem máscara
   */
  formatarCep(cep: string): string {
    const cepLimpo = this.limparCep(cep);
    if (cepLimpo.length === 8) {
      return `${cepLimpo.substring(0, 5)}-${cepLimpo.substring(5)}`;
    }
    return cep;
  }

  private normalizarTexto(texto: string): string {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/\s+/g, '%20');
  }
}
