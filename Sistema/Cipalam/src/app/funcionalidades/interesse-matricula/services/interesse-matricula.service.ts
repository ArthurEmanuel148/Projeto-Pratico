import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, map } from 'rxjs/operators';
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

  getTodasDeclaracoes(): Observable<InteresseMatricula[]> {
    // Quando o backend estiver pronto, descomente a linha abaixo e ajuste o endpoint:
    // return this.http.get<InteresseMatricula[]>(this.apiUrl);

    // MOCK: Retorna uma lista simulada de declarações
    const mockDeclaracoes: InteresseMatricula[] = [
      {
        protocolo: '1',
        dadosResponsavel: { nomeResponsavel: 'Maria Silva', cpfResponsavel: '123.456.789-00' },
        dadosAluno: { nomeAluno: 'João Silva', dataNascimentoAluno: '2016-05-12' },
        tipoVaga: { tipoCota: 'livre' },
        // Adicione outros campos necessários conforme sua interface
      },
      {
        protocolo: '2',
        dadosResponsavel: { nomeResponsavel: 'Carlos Souza', cpfResponsavel: '987.654.321-00' },
        dadosAluno: { nomeAluno: 'Ana Souza', dataNascimentoAluno: '2016-08-20' },
        tipoVaga: { tipoCota: 'economica' },
      }
    ];
    return of(mockDeclaracoes).pipe(delay(1000));
  }

  getDeclaracaoPorProtocolo(protocolo: string): Observable<InteresseMatricula | undefined> {
    // Quando o backend estiver pronto, descomente a linha abaixo e ajuste o endpoint:
    // return this.http.get<InteresseMatricula>(`${this.apiUrl}/${id}`);

    // MOCK: Busca por protocolo no array mockado
    return this.getTodasDeclaracoes().pipe(
      map(declaracoes => declaracoes.find(d => d.protocolo === protocolo))
    );
  }
}