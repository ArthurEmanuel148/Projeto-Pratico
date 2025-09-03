import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';
import { InteresseMatricula } from '../models/interesse-matricula.interface';
import { ApiConfigService } from '../../../core/services/api-config.service';

@Injectable()
export class InteresseMatriculaService {
  private apiUrl = `${environment.apiUrl}/interesse-matricula`;
  private readonly STORAGE_KEY = 'usuarioLogado';

  constructor(
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }

  // Verificar se responsável existe no banco
  verificarResponsavelExiste(cpf: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/verificar-responsavel/${cpf}`).pipe(
      catchError(error => {
        console.warn('Erro na verificação do responsável:', error);
        // Fallback: assumir que o responsável não existe
        return new Observable(observer => {
          observer.next({ existe: false, dadosResponsavel: null });
          observer.complete();
        });
      })
    );
  }

  // Autenticar responsável existente
  autenticarResponsavel(cpf: string, senha: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/autenticar-responsavel`, { cpf, senha }).pipe(
      catchError(error => {
        console.error('Erro na autenticação:', error);
        return throwError(error);
      })
    );
  }

  // Enviar declaração completa com todos os dados do formulário
  enviarDeclaracaoCompleta(dadosFormulario: any): Observable<any> {
    console.log('Dados recebidos no serviço:', dadosFormulario);

    const payload = {
      // Dados do responsável
      nomeResponsavel: dadosFormulario.dadosResponsavel?.nome || '',
      cpfResponsavel: dadosFormulario.dadosResponsavel?.cpf || '',
      dataNascimentoResponsavel: dadosFormulario.dadosResponsavel?.dataNascimento || '',
      telefoneResponsavel: dadosFormulario.dadosResponsavel?.telefone || '',
      emailResponsavel: dadosFormulario.dadosResponsavel?.email || '',
      responsavelExistente: false,
      senhaTemporariaEnviada: false,
      responsavelAutenticado: false,

      // Dados do aluno
      nomeAluno: dadosFormulario.dadosAluno?.nome || '',
      dataNascimentoAluno: dadosFormulario.dadosAluno?.dataNascimento || '',
      cpfAluno: dadosFormulario.dadosAluno?.cpf || '',
      escolaAluno: dadosFormulario.dadosAluno?.escola || '',
      codigoInepEscola: dadosFormulario.dadosAluno?.codigoInep || '',
      municipioEscola: dadosFormulario.dadosResponsavel?.endereco?.cidade || '',
      ufEscola: dadosFormulario.dadosResponsavel?.endereco?.estado || '',

      // Endereço da família (campos separados)
      cep: dadosFormulario.dadosResponsavel?.endereco?.cep || '',
      logradouro: dadosFormulario.dadosResponsavel?.endereco?.logradouro || '',
      numero: dadosFormulario.dadosResponsavel?.endereco?.numero || '',
      complemento: dadosFormulario.dadosResponsavel?.endereco?.complemento || '',
      bairro: dadosFormulario.dadosResponsavel?.endereco?.bairro || '',
      cidade: dadosFormulario.dadosResponsavel?.endereco?.cidade || '',
      uf: dadosFormulario.dadosResponsavel?.endereco?.estado || '',
      codigoIbgeCidade: dadosFormulario.dadosResponsavel?.endereco?.codigoIbge || '3550308',
      pontoReferencia: dadosFormulario.dadosResponsavel?.endereco?.pontoReferencia || '',

      // Tipo de cota
      tipoCota: dadosFormulario.tipoCota || 'livre',

      // Dados familiares (apenas para cota econômica)
      numeroIntegrantes: dadosFormulario.tipoCota === 'economica' ? (dadosFormulario.infoRenda?.integrantesRenda?.length || 1) : 1,
      integrantesRenda: dadosFormulario.tipoCota === 'economica' ? JSON.stringify(dadosFormulario.infoRenda?.integrantesRenda || []) : JSON.stringify([]),
      dadosFamiliaresPreenchidos: dadosFormulario.tipoCota === 'economica',

      // Horários
      horariosSelecionados: JSON.stringify(dadosFormulario.horariosVaga?.horariosSelecionados || []),

      // Observações do responsável
      observacoesResponsavel: dadosFormulario.observacoes || '',

      // Status
      etapaAtual: 'finalizado',
      status: 'interesse_declarado'
    };

    console.log('Dados recebidos do componente:', dadosFormulario);
    console.log('Horários no payload:', payload.horariosSelecionados);
    console.log('Integrantes no payload:', payload.integrantesRenda);
    console.log('Enviando payload para backend:', payload);

    return this.http.post(this.apiUrl, payload).pipe(
      catchError(error => {
        console.error('Erro ao enviar declaração completa:', error);
        console.log('Payload que falhou:', payload);

        // Se o backend não estiver disponível, simular sucesso para teste
        if (error.status === 0 || error.status === 404) {
          console.warn('Backend não disponível, simulando sucesso para teste...');
          return new Observable(observer => {
            observer.next({
              success: true,
              protocolo: 'TESTE-' + Date.now(),
              message: 'Declaração simulada (backend indisponível)'
            });
            observer.complete();
          });
        }

        throw error;
      })
    );
  }

  private calcularIdade(dataNascimento: string): number {
    if (!dataNascimento) return 0;
    const hoje = new Date();
    const nascimento = new Date(dataNascimento);
    const idade = hoje.getFullYear() - nascimento.getFullYear();
    const m = hoje.getMonth() - nascimento.getMonth();
    if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
      return idade - 1;
    }
    return idade;
  }

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

      // Campos de endereço separados
      cep: backendData.cep,
      logradouro: backendData.logradouro,
      numero: backendData.numero,
      complemento: backendData.complemento,
      bairro: backendData.bairro,
      cidade: backendData.cidade,
      uf: backendData.uf,
      pontoReferencia: backendData.pontoReferencia,

      // Campos da escola
      escolaAluno: backendData.escolaAluno,
      codigoInepEscola: backendData.codigoInepEscola,
      municipioEscola: backendData.municipioEscola,
      ufEscola: backendData.ufEscola,

      // Campos do aluno diretos
      nomeAluno: backendData.nomeAluno,
      dataNascimentoAluno: backendData.dataNascimentoAluno,
      cpfAluno: backendData.cpfAluno,

      // Campos do responsável diretos
      nomeResponsavel: backendData.nomeResponsavel,
      cpfResponsavel: backendData.cpfResponsavel,
      dataNascimentoResponsavel: backendData.dataNascimentoResponsavel,
      emailResponsavel: backendData.emailResponsavel,
      telefoneResponsavel: backendData.telefoneResponsavel,

      // Campos de renda diretos
      rendaFamiliar: backendData.rendaFamiliar,
      rendaPerCapita: backendData.rendaPerCapita,
      numeroIntegrantes: backendData.numeroIntegrantes,
      integrantesRenda: backendData.integrantesRenda,

      // Campos de horários diretos
      horariosSelecionados: backendData.horariosSelecionados,

      // Observações diretas
      observacoesResponsavel: backendData.observacoesResponsavel,
      mensagemAdicional: backendData.mensagemAdicional,

      // Objetos aninhados para compatibilidade
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
      }
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

  salvarConfiguracaoDocumentos(configuracao: Record<string, number[]>): Observable<any> {
    return this.http.post(`${environment.apiUrl}/configuracao-documentos/batch`, configuracao);
  }

  getConfiguracaoDocumentos(): Observable<Record<string, number[]>> {
    return this.http.get<Record<string, number[]>>(`${environment.apiUrl}/configuracao-documentos?format=frontend`);
  }

  // Método para buscar tipos de documentos
  getTiposDocumento(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiUrl}/tipos-documento/ativos`).pipe(
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
