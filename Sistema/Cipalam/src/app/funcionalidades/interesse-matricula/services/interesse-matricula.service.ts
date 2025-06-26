import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { InteresseMatricula } from '../models/interesse-matricula.interface';
import { ApiConfigService } from '../../../core/services/api-config.service';

@Injectable()
export class InteresseMatriculaService {
  private apiUrl = 'http://localhost:8080/api/interesse-matricula'; // URL da API que será criada
  private STORAGE_KEY = 'declaracoesInteresse';

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  enviarDeclaracao(dados: InteresseMatricula): Observable<any> {
    // TODO: Implementar endpoint na API Spring Boot
    // return this.http.post(this.apiUrl, dados);

    // Por enquanto, continua salvando localmente
    const lista = this.getTodasDeclaracoesSync();
    const protocolo = `INT-${Date.now()}`;
    const declaracao = { ...dados, protocolo };
    lista.push(declaracao);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(lista));
    return of({ success: true, message: 'Declaração de interesse enviada com sucesso!', protocolo }).pipe(
      delay(500)
    );
  }

  getTodasDeclaracoes(): Observable<InteresseMatricula[]> {
    // TODO: Implementar endpoint na API Spring Boot
    // return this.http.get<InteresseMatricula[]>(this.apiUrl);

    // Por enquanto, busca do localStorage
    return of(this.getTodasDeclaracoesSync()).pipe(delay(300));
  }

  getTodasDeclaracoesSync(): InteresseMatricula[] {
    const lista = localStorage.getItem(this.STORAGE_KEY);
    return lista ? JSON.parse(lista) : [];
  }

  getDeclaracaoPorProtocolo(protocolo: string): Observable<InteresseMatricula | undefined> {
    // TODO: Implementar endpoint na API Spring Boot
    // return this.http.get<InteresseMatricula>(`${this.apiUrl}/${protocolo}`);

    // Por enquanto, busca do localStorage
    return of(this.getTodasDeclaracoesSync().find(d => d.protocolo === protocolo));
  }
}
