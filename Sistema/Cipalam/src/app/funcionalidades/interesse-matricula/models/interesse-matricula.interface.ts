import { DadosIntegranteRenda } from './dados-integrante-renda.interface';

export type TipoVaga = 'funcionario' | 'economica' | 'livre' | null;

export interface InteresseMatricula {
    protocolo?: string; // Protocolo gerado para a declaração
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