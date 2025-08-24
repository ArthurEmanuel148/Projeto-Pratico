import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  Turma,
  TurmaDisponivel,
  IniciarMatriculaRequest,
  IniciarMatriculaResponse
} from '../models/turma.model';

@Injectable({
  providedIn: 'root'
})
export class MatriculaService {
  private readonly API_BASE_URL = 'http://localhost:8080/api/matricula';

  private httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) { }

  /**
   * Busca todas as turmas disponíveis para matrícula
   */
  getTurmasDisponiveis(): Observable<TurmaDisponivel[]> {
    return this.http.get<TurmaDisponivel[]>(`${this.API_BASE_URL}/turmas-disponiveis`, this.httpOptions)
      .pipe(
        map(response => {
          console.log('Turmas disponíveis recebidas:', response);
          return response;
        }),
        catchError(error => {
          console.error('Erro ao buscar turmas disponíveis:', error);
          // Retorna dados mock em caso de erro para demonstração
          return of(this.getMockTurmas());
        })
      );
  }

  /**
   * Inicia o processo de matrícula automática usando stored procedures
   */
  iniciarMatriculaProcedural(request: IniciarMatriculaRequest): Observable<IniciarMatriculaResponse> {
    // Primeiro, criar uma declaração de interesse
    const declaracaoInteresse = {
      nomeResponsavel: request.nomeResponsavel,
      cpfResponsavel: request.cpfResponsavel,
      emailResponsavel: request.emailResponsavel,
      telefoneResponsavel: request.telefoneResponsavel,
      dataNascimentoResponsavel: new Date().toISOString().split('T')[0], // Data padrão
      nomeAluno: request.nomeAluno,
      dataNascimentoAluno: request.dataNascimentoAluno,
      cpfAluno: request.cpfAluno || '',
      observacoesResponsavel: request.observacoes || '',
      tipoCota: 'LIVRE', // Tipo padrão
      status: 'pendente_analise'
    };

    // Criar declaração de interesse primeiro
    return this.http.post<any>(`http://localhost:8080/api/interesse-matricula`, declaracaoInteresse, this.httpOptions)
      .pipe(
        switchMap(declaracaoResponse => {
          console.log('Declaração criada:', declaracaoResponse);

          // Agora usar a declaração para iniciar matrícula
          const matriculaRequest = {
            idDeclaracao: declaracaoResponse.interesse.id,
            idTurma: request.idTurma,
            idFuncionario: 1 // ID padrão do funcionário (pode ser configurável)
          };

          return this.http.post<any>(`${this.API_BASE_URL}/iniciar-procedural`, matriculaRequest, this.httpOptions);
        }),
        map(response => {
          console.log('Resposta da matrícula procedural:', response);

          // Transformar resposta do backend para o formato esperado pelo frontend
          if (response.success && response.data) {
            return {
              sucesso: true,
              mensagem: response.message || 'Matrícula iniciada com sucesso!',
              idFamilia: response.data.idFamilia,
              idAluno: response.data.idAluno,
              idResponsavel: response.data.idResponsavel,
              loginResponsavel: response.data.loginResponsavel,
              senhaResponsavel: response.data.senhaTemporaria,
              documentosPendentes: []
            };
          } else {
            return {
              sucesso: false,
              mensagem: response.message || 'Erro ao iniciar matrícula',
              documentosPendentes: []
            };
          }
        }),
        catchError(error => {
          console.error('Erro ao iniciar matrícula procedural:', error);
          // Retorna resposta mock em caso de erro
          return of({
            sucesso: false,
            mensagem: 'Erro na comunicação com o servidor. Tente novamente.',
            documentosPendentes: []
          });
        })
      );
  }

  /**
   * Valida se um CPF é válido (implementação simplificada)
   */
  validarCPF(cpf: string): boolean {
    if (!cpf) return false;

    // Remove caracteres não numéricos
    cpf = cpf.replace(/[^\d]/g, '');

    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;

    // Verifica se não são todos iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;

    return true;
  }

  /**
   * Formata CPF para exibição
   */
  formatarCPF(cpf: string): string {
    if (!cpf) return '';
    cpf = cpf.replace(/[^\d]/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  }

  /**
   * Formata telefone para exibição
   */
  formatarTelefone(telefone: string): string {
    if (!telefone) return '';
    telefone = telefone.replace(/[^\d]/g, '');

    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }

    return telefone;
  }

  /**
   * Dados mock para demonstração quando a API não estiver disponível
   */
  private getMockTurmas(): TurmaDisponivel[] {
    return [
      {
        turma: {
          idtbTurma: 1,
          nomeTurma: 'Natação Infantil',
          atividade: 'Natação',
          periodo: 'MANHA' as any,
          capacidadeTotal: 20,
          capacidadeOcupada: 15,
          vagasDisponiveis: 5,
          dataInicio: new Date('2025-09-01'),
          dataFim: new Date('2025-12-15'),
          horarioInicio: '08:00',
          horarioFim: '09:00',
          descricao: 'Aulas de natação para crianças de 6 a 12 anos',
          idadeMinima: 6,
          idadeMaxima: 12
        },
        disponivel: true
      },
      {
        turma: {
          idtbTurma: 2,
          nomeTurma: 'Futebol Juvenil',
          atividade: 'Futebol',
          periodo: 'TARDE' as any,
          capacidadeTotal: 25,
          capacidadeOcupada: 22,
          vagasDisponiveis: 3,
          dataInicio: new Date('2025-09-01'),
          dataFim: new Date('2025-12-15'),
          horarioInicio: '14:00',
          horarioFim: '15:30',
          descricao: 'Treinos de futebol para jovens de 13 a 17 anos',
          idadeMinima: 13,
          idadeMaxima: 17
        },
        disponivel: true
      },
      {
        turma: {
          idtbTurma: 3,
          nomeTurma: 'Vôlei Adulto',
          atividade: 'Vôlei',
          periodo: 'NOITE' as any,
          capacidadeTotal: 16,
          capacidadeOcupada: 16,
          vagasDisponiveis: 0,
          dataInicio: new Date('2025-09-01'),
          dataFim: new Date('2025-12-15'),
          horarioInicio: '19:00',
          horarioFim: '20:30',
          descricao: 'Vôlei para adultos iniciantes e intermediários',
          idadeMinima: 18,
          idadeMaxima: 65
        },
        disponivel: false,
        motivoIndisponibilidade: 'Turma lotada'
      }
    ];
  }
}
