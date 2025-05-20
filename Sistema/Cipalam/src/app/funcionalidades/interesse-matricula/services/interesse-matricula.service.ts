import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { InteresseMatricula } from '../models/interesse-matricula.interface';

@Injectable() // Será fornecido no InteresseMatriculaModule
export class InteresseMatriculaService {
  // private apiUrl = 'API_ENDPOINT/interesse-matricula';

  constructor(private http: HttpClient) { }

  enviarDeclaracao(dados: InteresseMatricula): Observable<any> {
    console.log('MOCK SERVICE: Enviando declaração:', JSON.stringify(dados, null, 2));
    // return this.http.post<any>(this.apiUrl, dados);
    return of({ success: true, message: 'Declaração de interesse enviada com sucesso! (Mock)', protocolo: `MOCK-${Date.now()}` }).pipe(
      delay(1000)
    );
  }
}