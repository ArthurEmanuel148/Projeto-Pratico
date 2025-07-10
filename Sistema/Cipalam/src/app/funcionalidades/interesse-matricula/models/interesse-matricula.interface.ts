import { DadosIntegranteRenda } from './dados-integrante-renda.interface';

export type TipoVaga = 'funcionario' | 'economica' | 'livre' | null;

export interface InteresseMatricula {
    id?: number; // ID do backend
    protocolo?: string; // Protocolo gerado para a declaração
    nomeCompleto?: string; // Campo do backend
    cpf?: string; // Campo do backend
    email?: string; // Campo do backend
    telefone?: string; // Campo do backend
    tipoEscola?: string; // Campo do backend
    anoLetivo?: string; // Campo do backend
    serieDesejada?: string; // Campo do backend
    tipoCota?: string; // Campo do backend
    status?: string; // Campo do backend
    dataEnvio?: string; // Campo do backend
    dataInicioMatricula?: string; // Campo do backend
    observacoes?: string; // Campo do backend
    dadosResponsavel?: {
        nomeResponsavel?: string;
        cpfResponsavel?: string;
        dataNascimentoResponsavel?: string;
        emailResponsavel?: string;
        telefoneResponsavel?: string;
    };
    tipoVaga?: {
        tipoCota?: TipoVaga;
    };
    infoRenda?: {
        integrantesRenda?: DadosIntegranteRenda[];
        enderecoCompleto?: string;
        rendaFamiliar?: number;
        rendaPerCapita?: number;
        numeroIntegrantes?: number;
    };
    dadosAluno?: {
        nomeAluno?: string;
        dataNascimentoAluno?: string;
        cpfAluno?: string;
    };
    horariosVaga?: {
        horariosSelecionados?: string[];
    };
    mensagemAdicional?: string;
}

export const TIPOS_VAGA = [
  { chave: 'funcionario', nome: 'Cota de Funcionário' },
  { chave: 'economica', nome: 'Cota Econômica (Renda)' },
  { chave: 'livre', nome: 'Cota Livre (Ampla Concorrência)' }
];
