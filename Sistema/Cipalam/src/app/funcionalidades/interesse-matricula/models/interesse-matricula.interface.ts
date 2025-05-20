import { DadosIntegranteRenda } from './dados-integrante-renda.interface';

export interface InteresseMatricula {
    dadosResponsavel?: {
        nomeResponsavel?: string;
        cpfResponsavel?: string;
        dataNascimentoResponsavel?: string;
        emailResponsavel?: string;
        telefoneResponsavel?: string;
    };
    tipoVaga?: {
        tipoCota?: 'funcionario' | 'economica' | 'livre' | null;
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