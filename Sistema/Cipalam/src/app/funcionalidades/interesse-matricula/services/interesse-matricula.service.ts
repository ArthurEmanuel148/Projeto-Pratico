import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
import { InteresseMatricula } from '../models/interesse-matricula.interface';

@Injectable()
export class InteresseMatriculaService {
  // private apiUrl = 'API_ENDPOINT/interesse-matricula';
  private STORAGE_KEY = 'declaracoesInteresse';

  constructor(private http: HttpClient) { }

  enviarDeclaracao(dados: InteresseMatricula): Observable<any> {
    // --- Quando for backend, use a linha abaixo:
    // return this.http.post<any>(this.apiUrl, dados);

    // Salva no localStorage (mock)
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
    // --- Quando for backend, use a linha abaixo:
    // return this.http.get<InteresseMatricula[]>(this.apiUrl);

    // Busca do localStorage (mock)
    return of(this.getTodasDeclaracoesSync()).pipe(delay(300));
  }

  getTodasDeclaracoesSync(): InteresseMatricula[] {
    const lista = localStorage.getItem(this.STORAGE_KEY);
    return lista ? JSON.parse(lista) : [];
  }

  getDeclaracaoPorProtocolo(protocolo: string): Observable<InteresseMatricula | undefined> {
    // --- Quando for backend, use a linha abaixo:
    // return this.http.get<InteresseMatricula>(`${this.apiUrl}/${protocolo}`);

    // Busca do localStorage (mock)
    return of(this.getTodasDeclaracoesSync().find(d => d.protocolo === protocolo));
  }
}