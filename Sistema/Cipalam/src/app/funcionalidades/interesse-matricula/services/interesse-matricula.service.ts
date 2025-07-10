import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { InteresseMatricula } from '../models/interesse-matricula.interface';
import { ApiConfigService } from '../../../core/services/api-config.service';

@Injectable()
export class InteresseMatriculaService {
  private apiUrl = 'http://localhost:8080/api/interesse-matricula';
  private readonly STORAGE_KEY = 'usuarioLogado';

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  // Métodos para manipular o usuário logado no localStorage
  salvarUsuarioLogado(usuario: any): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
  }

  obterUsuarioLogado(): any {
    const usuario = localStorage.getItem(this.STORAGE_KEY);
    return usuario ? JSON.parse(usuario) : null;
  }

  removerUsuarioLogado(): void {
    localStorage.removeItem(this.STORAGE_KEY);
  }

  enviarDeclaracao(declaracao: InteresseMatricula): Observable<any> {
    const backendData = this.mapFrontendToBackend(declaracao);
    return this.http.post(this.apiUrl, backendData).pipe(
      catchError(error => {
        console.error('Erro ao enviar declaração:', error);
        throw error;
      })
    );
  }

  getTodasDeclaracoes(): Observable<InteresseMatricula[]> {
    return this.http.get<any[]>(this.apiUrl).pipe(
      map(data => data.map(item => this.mapBackendToFrontend(item))),
      catchError(error => {
        console.error('Erro ao buscar declarações do servidor:', error);
        throw error;
      })
    );
  }

  private mapBackendToFrontend(backendData: any): InteresseMatricula {
    return {
      id: backendData.id,
      protocolo: backendData.protocolo,
      nomeCompleto: backendData.nomeResponsavel,
      cpf: backendData.cpfResponsavel,
      email: backendData.emailResponsavel,
      telefone: backendData.telefoneResponsavel,
      tipoCota: backendData.tipoCota,
      status: backendData.status,
      dataEnvio: backendData.dataEnvio,
      dataInicioMatricula: backendData.dataInicioMatricula,
      observacoes: backendData.observacoes,
      dadosResponsavel: {
        nomeResponsavel: backendData.nomeResponsavel,
        cpfResponsavel: backendData.cpfResponsavel,
        dataNascimentoResponsavel: backendData.dataNascimentoResponsavel,
        emailResponsavel: backendData.emailResponsavel,
        telefoneResponsavel: backendData.telefoneResponsavel
      },
      dadosAluno: {
        nomeAluno: backendData.nomeAluno,
        dataNascimentoAluno: backendData.dataNascimentoAluno,
        cpfAluno: backendData.cpfAluno
      },
      tipoVaga: {
        tipoCota: backendData.tipoCota
      },
      infoRenda: {
        enderecoCompleto: backendData.enderecoCompleto,
        rendaFamiliar: backendData.rendaFamiliar,
        rendaPerCapita: backendData.rendaPerCapita,
        numeroIntegrantes: backendData.numeroIntegrantes,
        integrantesRenda: backendData.integrantesRenda ? JSON.parse(backendData.integrantesRenda) : []
      },
      horariosVaga: {
        horariosSelecionados: backendData.horariosSelecionados ? JSON.parse(backendData.horariosSelecionados) : []
      },
      mensagemAdicional: backendData.mensagemAdicional
    };
  }

  private mapFrontendToBackend(frontendData: InteresseMatricula): any {
    const backendData: any = {
      nomeResponsavel: frontendData.dadosResponsavel?.nomeResponsavel,
      cpfResponsavel: frontendData.dadosResponsavel?.cpfResponsavel,
      dataNascimentoResponsavel: frontendData.dadosResponsavel?.dataNascimentoResponsavel,
      telefoneResponsavel: frontendData.dadosResponsavel?.telefoneResponsavel,
      emailResponsavel: frontendData.dadosResponsavel?.emailResponsavel,
      nomeAluno: frontendData.dadosAluno?.nomeAluno,
      dataNascimentoAluno: frontendData.dadosAluno?.dataNascimentoAluno,
      cpfAluno: frontendData.dadosAluno?.cpfAluno,
      tipoCota: frontendData.tipoVaga?.tipoCota,
      horariosSelecionados: frontendData.horariosVaga?.horariosSelecionados ?
        JSON.stringify(frontendData.horariosVaga.horariosSelecionados) : null,
      mensagemAdicional: frontendData.mensagemAdicional,
      rendaFamiliar: frontendData.infoRenda?.rendaFamiliar,
      rendaPerCapita: frontendData.infoRenda?.rendaPerCapita,
      numeroIntegrantes: frontendData.infoRenda?.numeroIntegrantes,
      enderecoCompleto: frontendData.infoRenda?.enderecoCompleto,
      integrantesRenda: frontendData.infoRenda?.integrantesRenda ?
        JSON.stringify(frontendData.infoRenda.integrantesRenda) : null
    };

    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    return backendData;
  }

  buscarPorProtocolo(protocolo: string): Observable<InteresseMatricula | undefined> {
    return this.http.get<any>(`${this.apiUrl}/protocolo/${protocolo}`).pipe(
      map(data => data ? this.mapBackendToFrontend(data) : undefined),
      catchError(error => {
        console.error('Erro ao buscar declaração por protocolo:', error);
        throw error;
      })
    );
  }

  buscarPorId(id: number): Observable<InteresseMatricula | undefined> {
    return this.http.get<any>(`${this.apiUrl}/${id}`).pipe(
      map(data => data ? this.mapBackendToFrontend(data) : undefined),
      catchError(error => {
        console.error('Erro ao buscar declaração por ID:', error);
        throw error;
      })
    );
  }

  salvarConfiguracaoDocumentos(configuracao: Record<string, string[]>): Observable<any> {
    return this.http.post(`${this.apiUrl}/configuracao-documentos`, configuracao);
  }

  getConfiguracaoDocumentos(): Observable<Record<string, string[]>> {
    return this.http.get<Record<string, string[]>>(`${this.apiUrl}/configuracao-documentos`);
  }

  // Método para buscar tipos de documentos
  getTiposDocumento(): Observable<any[]> {
    return this.http.get<any[]>('http://localhost:8080/api/tipos-documento').pipe(
      catchError(error => {
        console.error('Erro ao buscar tipos de documento:', error);
        throw error;
      })
    );
  }

  iniciarMatricula(interesseId: number, funcionarioId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${interesseId}/iniciar-matricula`, null, {
      params: { funcionarioId: funcionarioId.toString() }
    });
  }
}
