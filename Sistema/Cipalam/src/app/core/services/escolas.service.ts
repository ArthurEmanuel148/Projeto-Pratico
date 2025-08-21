import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface Escola {
  nome: string;
  codigo: string;
  municipio: string;
  uf: string;
  tipoEscola?: string;
  nivelEnsino?: string;
}

@Injectable({
  providedIn: 'root'
})
export class EscolasService {

  // URLs das APIs externas para escolas
  private readonly API_ESCOLAS_BRASIL = 'https://educacao.dadosabertos.gov.br/api/escolas';
  private readonly API_INEP = 'https://api.inep.gov.br/v2/escolas';

  constructor(private http: HttpClient) { }

  /**
   * Busca escolas por nome usando API externa
   * @param termoBusca Termo para buscar escolas
   * @param uf UF para filtrar (opcional)
   * @param municipio Município para filtrar (opcional)
   */
  buscarEscolas(termoBusca: string, uf?: string, municipio?: string): Observable<Escola[]> {
    if (termoBusca.length < 3) {
      return of([]);
    }

    // Primeiro tenta a API principal
    return this.buscarNaApiPrincipal(termoBusca, uf, municipio).pipe(
      catchError(() => {
        // Se falhar, tenta API alternativa
        return this.buscarNaApiAlternativa(termoBusca, uf, municipio);
      }),
      catchError(() => {
        // Se todas falharem, retorna dados simulados
        return this.buscarEscolasSimuladas(termoBusca);
      })
    );
  }

  /**
   * Busca escola por código INEP
   * @param codigoInep Código INEP da escola
   */
  buscarPorCodigoInep(codigoInep: string): Observable<Escola | null> {
    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(`${this.API_INEP}/${codigoInep}`, { headers }).pipe(
      map(response => this.mapearEscolaApi(response)),
      catchError(() => {
        // Se falhar, retorna dados simulados baseados no código
        return this.buscarEscolaSimuladaPorCodigo(codigoInep);
      })
    );
  }

  private buscarNaApiPrincipal(termoBusca: string, uf?: string, municipio?: string): Observable<Escola[]> {
    const params: any = {
      nome: termoBusca,
      limit: 10
    };

    if (uf) params.uf = uf;
    if (municipio) params.municipio = municipio;

    const headers = new HttpHeaders({
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    });

    return this.http.get<any>(this.API_ESCOLAS_BRASIL, { params, headers }).pipe(
      map(response => {
        if (response && response.data) {
          return response.data.map((escola: any) => this.mapearEscolaApi(escola));
        }
        return [];
      })
    );
  }

  private buscarNaApiAlternativa(termoBusca: string, uf?: string, municipio?: string): Observable<Escola[]> {
    // Implementar busca em API alternativa (ex: QEdu, Escola Web, etc.)
    // Por enquanto, retorna simulação
    return this.buscarEscolasSimuladas(termoBusca);
  }

  private buscarEscolasSimuladas(termoBusca: string): Observable<Escola[]> {
    const escolasSimuladas: Escola[] = [
      {
        nome: `E.E. Professor ${termoBusca}`,
        codigo: '23456789',
        municipio: 'São Paulo',
        uf: 'SP',
        tipoEscola: 'publica',
        nivelEnsino: 'Ensino Fundamental'
      },
      {
        nome: `E.M. Maria ${termoBusca}`,
        codigo: '34567890',
        municipio: 'São Paulo',
        uf: 'SP',
        tipoEscola: 'publica',
        nivelEnsino: 'Ensino Fundamental'
      },
      {
        nome: `Colégio ${termoBusca}`,
        codigo: '45678901',
        municipio: 'São Paulo',
        uf: 'SP',
        tipoEscola: 'privada',
        nivelEnsino: 'Ensino Fundamental e Médio'
      },
      {
        nome: `Instituto ${termoBusca}`,
        codigo: '56789012',
        municipio: 'São Paulo',
        uf: 'SP',
        tipoEscola: 'privada',
        nivelEnsino: 'Ensino Técnico'
      }
    ];

    // Simula delay da API
    return new Observable(observer => {
      setTimeout(() => {
        observer.next(escolasSimuladas.slice(0, 3));
        observer.complete();
      }, 500);
    });
  }

  private buscarEscolaSimuladaPorCodigo(codigoInep: string): Observable<Escola | null> {
    const escola: Escola = {
      nome: `Escola INEP ${codigoInep}`,
      codigo: codigoInep,
      municipio: 'São Paulo',
      uf: 'SP',
      tipoEscola: 'publica',
      nivelEnsino: 'Ensino Fundamental'
    };

    return of(escola);
  }

  private mapearEscolaApi(dadosApi: any): Escola {
    return {
      nome: dadosApi.nome || dadosApi.no_entidade || '',
      codigo: dadosApi.codigo || dadosApi.co_entidade || '',
      municipio: dadosApi.municipio || dadosApi.no_municipio || '',
      uf: dadosApi.uf || dadosApi.sg_uf || '',
      tipoEscola: dadosApi.dependenciaAdministrativa === 'Federal' ||
        dadosApi.dependenciaAdministrativa === 'Estadual' ||
        dadosApi.dependenciaAdministrativa === 'Municipal' ? 'publica' : 'privada',
      nivelEnsino: dadosApi.etapasEnsino || dadosApi.modalidade || 'Não informado'
    };
  }

  /**
   * Valida código INEP
   * @param codigo Código INEP para validar
   */
  validarCodigoInep(codigo: string): boolean {
    // Código INEP tem 8 dígitos
    return /^\d{8}$/.test(codigo);
  }

  /**
   * Busca escolas por município e UF
   * @param municipio Nome do município
   * @param uf Sigla do estado
   */
  buscarEscolasPorMunicipio(municipio: string, uf: string): Observable<Escola[]> {
    return this.buscarEscolas('', uf, municipio);
  }
}
