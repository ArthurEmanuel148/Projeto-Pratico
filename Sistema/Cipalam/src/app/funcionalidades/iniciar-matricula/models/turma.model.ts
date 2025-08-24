export interface Turma {
  idtbTurma: number;
  nomeTurma: string;
  atividade: string;
  periodo: PeriodoEnum;
  capacidadeTotal: number;
  capacidadeOcupada: number;
  vagasDisponiveis: number;
  dataInicio?: Date;
  dataFim?: Date;
  horarioInicio?: string;
  horarioFim?: string;
  descricao?: string;
  idadeMinima?: number;
  idadeMaxima?: number;
}

export enum PeriodoEnum {
  MANHA = 'MANHA',
  TARDE = 'TARDE',
  NOITE = 'NOITE',
  INTEGRAL = 'INTEGRAL'
}

export interface IniciarMatriculaRequest {
  idTurma: number;
  nomeTurma: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  emailResponsavel: string;
  telefoneResponsavel: string;
  nomeAluno: string;
  dataNascimentoAluno: string;
  cpfAluno?: string;
  observacoes?: string;
}

export interface IniciarMatriculaResponse {
  sucesso: boolean;
  mensagem: string;
  idFamilia?: number;
  idAluno?: number;
  idResponsavel?: number;
  loginResponsavel?: string;
  senhaResponsavel?: string;
  documentosPendentes?: string[];
}

export interface TurmaDisponivel {
  turma: Turma;
  disponivel: boolean;
  motivoIndisponibilidade?: string;
}
