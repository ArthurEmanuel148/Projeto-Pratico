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
  ) { }

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

  // Verificar se o responsável existe por CPF
  verificarResponsavel(cpf: string): Observable<any> {
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove pontos e traços
    return this.http.get(`http://localhost:8080/api/pessoa/verificar-cpf/${cpfLimpo}`).pipe(
      catchError(error => {
        console.error('Erro ao verificar responsável:', error);
        throw error;
      })
    );
  }

  // Autenticar responsável com CPF e senha
  autenticarResponsavel(cpf: string, senha: string): Observable<any> {
    const cpfLimpo = cpf.replace(/\D/g, ''); // Remove pontos e traços
    const loginData = {
      usuario: cpfLimpo, // Usando CPF como usuário
      senha: senha
    };

    return this.http.post('http://localhost:8080/api/pessoa/login', loginData).pipe(
      catchError(error => {
        console.error('Erro ao autenticar responsável:', error);
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

      // Campos diretos para acesso no template
      nomeResponsavel: backendData.nomeResponsavel,
      cpfResponsavel: backendData.cpfResponsavel,
      dataNascimentoResponsavel: backendData.dataNascimentoResponsavel,
      emailResponsavel: backendData.emailResponsavel,
      telefoneResponsavel: backendData.telefoneResponsavel,
      nomeAluno: backendData.nomeAluno,
      dataNascimentoAluno: backendData.dataNascimentoAluno,
      cpfAluno: backendData.cpfAluno,
      escolaAluno: backendData.escolaAluno,
      codigoInepEscola: backendData.codigoInepEscola,
      municipioEscola: backendData.municipioEscola,
      ufEscola: backendData.ufEscola,
      cep: backendData.cep,
      logradouro: backendData.logradouro,
      numero: backendData.numero,
      complemento: backendData.complemento,
      bairro: backendData.bairro,
      cidade: backendData.cidade,
      uf: backendData.uf,
      pontoReferencia: backendData.pontoReferencia,
      observacoesResponsavel: backendData.observacoesResponsavel,
      rendaFamiliar: backendData.rendaFamiliar,
      rendaPerCapita: backendData.rendaPerCapita,
      numeroIntegrantes: backendData.numeroIntegrantes,
      integrantesRenda: backendData.integrantesRenda,
      horariosSelecionados: backendData.horariosSelecionados,

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

  private mapFrontendToBackend(frontendData: any): any {
    console.log('Frontend data recebido:', frontendData);

    // O frontend envia dados diretos do formulário, não na estrutura da interface
    const backendData: any = {
      // Dados do responsável (vem direto do formulário)
      nomeResponsavel: frontendData.dadosResponsavel?.nome,
      cpfResponsavel: frontendData.dadosResponsavel?.cpf,
      dataNascimentoResponsavel: frontendData.dadosResponsavel?.dataNascimento,
      telefoneResponsavel: frontendData.dadosResponsavel?.telefone,
      emailResponsavel: frontendData.dadosResponsavel?.email,
      responsavelExistente: false,
      senhaTemporariaEnviada: false,
      responsavelAutenticado: false,

      // Dados do aluno (vem direto do formulário)
      nomeAluno: frontendData.dadosAluno?.nome,
      dataNascimentoAluno: frontendData.dadosAluno?.dataNascimento,
      cpfAluno: frontendData.dadosAluno?.cpf,
      escolaAluno: frontendData.dadosAluno?.escola,

      // Endereço (vem direto do formulário)
      cep: frontendData.endereco?.cep,
      logradouro: frontendData.endereco?.logradouro,
      numero: frontendData.endereco?.numero,
      complemento: frontendData.endereco?.complemento,
      bairro: frontendData.endereco?.bairro,
      cidade: frontendData.endereco?.cidade,
      uf: frontendData.endereco?.uf,
      pontoReferencia: frontendData.endereco?.pontoReferencia,

      // Tipo de cota (vem direto do formulário)
      tipoCota: frontendData.tipoCota,

      // Horários selecionados (converte array em string JSON)
      horariosSelecionados: frontendData.horarios && frontendData.horarios.length > 0 ?
        JSON.stringify(frontendData.horarios) : null,

      // Observações
      observacoesResponsavel: frontendData.observacoes,

      // Status e etapa
      etapaAtual: 'finalizado',
      status: 'em_preenchimento'
    };

    // Se houver integrantes da família (para cota econômica)
    if (frontendData.integrantesFamilia && frontendData.integrantesFamilia.length > 0) {
      backendData.numeroIntegrantes = frontendData.integrantesFamilia.length;
      backendData.integrantesRenda = JSON.stringify(frontendData.integrantesFamilia);
      backendData.dadosFamiliaresPreenchidos = true;
    }

    // Remove campos undefined
    Object.keys(backendData).forEach(key => {
      if (backendData[key] === undefined) {
        delete backendData[key];
      }
    });

    console.log('Backend data mapeado:', backendData);
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
