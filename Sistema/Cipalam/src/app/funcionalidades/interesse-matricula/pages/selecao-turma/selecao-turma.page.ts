import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Observable, forkJoin } from 'rxjs';
import { MatriculaService } from '../../services/matricula.service';

// Interfaces para tipagem
interface TurmaDisponivel {
    id: number;
    nome?: string;
    nomeTurma?: string;
    descricao?: string;
    vagasDisponiveis: number;
    totalVagas?: number;
    horario?: string;
    turno?: string;
    periodoFormatado?: string;
    capacidadeMaxima: number;
    capacidadeAtual?: number;
    descricaoCompleta?: string;
    observacoes?: string;
    temVagas: number;
    ativo?: boolean;
    horarioInicio?: string;
    horarioFim?: string;
}

interface DeclaracaoParaMatricula {
    id: number;
    protocolo: string;
    nomeCompleto?: string;
    tipoCota: string;
    nomeAluno?: string;
    nomeResponsavel?: string;
    tipoCotaDescricao?: string;
    diasAguardando?: number;
    dataEnvio?: string;
}

interface IniciarMatriculaResponse {
    success: boolean;
    message: string;
    dadosMatricula?: {
        idFamilia: number;
        nomeAluno: string;
        loginResponsavel: string;
        senhaTemporaria: string;
        protocoloDeclaracao: string;
        matricula: string;
        idAluno: number;
        idResponsavel: number;
        nomeResponsavel: string;
    };
}

@Component({
    selector: 'app-selecao-turma',
    templateUrl: './selecao-turma.page.html',
    styleUrls: ['./selecao-turma.page.scss'],
    standalone: false
})
export class SelecaoTurmaPage implements OnInit {

    declaracaoSelecionada!: DeclaracaoParaMatricula;
    turmasDisponiveis: TurmaDisponivel[] = [];
    turmaSelecionada?: TurmaDisponivel;
    isLoading = true;
    idDeclaracao!: number;

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private matriculaService: MatriculaService,
        private alertController: AlertController,
        private loadingController: LoadingController,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        // Captura o ID da declaração dos parâmetros da rota
        this.route.params.subscribe(params => {
            this.idDeclaracao = +params['idDeclaracao'];
            console.log('🔍 ID da declaração capturado:', this.idDeclaracao);
            if (this.idDeclaracao) {
                this.carregarDados();
            } else {
                this.showError('ID da declaração não encontrado');
                this.router.navigate(['/sistema/matriculas/lista-declaracoes']);
            }
        });
    }

    /**
     * Carrega dados da declaração e turmas disponíveis
     */
    async carregarDados() {
        const loading = await this.loadingController.create({
            message: 'Carregando turmas disponíveis...',
            duration: 10000
        });
        await loading.present();

        try {
            // Busca declarações e turmas em paralelo
            forkJoin({
                declaracoes: this.matriculaService.getDeclaracoesParaMatricula(),
                turmas: this.matriculaService.getTurmasDisponiveis()
            }).subscribe({
                next: (data) => {
                    // Encontra a declaração específica
                    this.declaracaoSelecionada = data.declaracoes.find((d: DeclaracaoParaMatricula) => d.id === this.idDeclaracao)!;

                    if (!this.declaracaoSelecionada) {
                        this.showError('Declaração não encontrada');
                        this.router.navigate(['/sistema/matriculas/lista-declaracoes']);
                        return;
                    }

                    // Processa dados adicionais da declaração
                    this.processarDadosDeclaracao();

                    // Carrega turmas disponíveis (filtra por vagas disponíveis > 0)
                    this.turmasDisponiveis = data.turmas.filter((turma: TurmaDisponivel) => turma.vagasDisponiveis > 0);

                    this.isLoading = false;
                    loading.dismiss();
                },
                error: (error) => {
                    console.error('❌ Erro ao carregar dados:', error);
                    this.isLoading = false;
                    loading.dismiss();
                    this.showError('Erro ao carregar dados. Tente novamente.');
                }
            });

        } catch (error) {
            this.isLoading = false;
            loading.dismiss();
            this.showError('Erro inesperado ao carregar dados');
        }
    }

    /**
     * Seleciona uma turma
     */
    selecionarTurma(turma: TurmaDisponivel) {
        this.turmaSelecionada = turma;
    }

    /**
     * Confirma a seleção da turma e inicia o processo de matrícula
     */
    async confirmarSelecao() {
        if (!this.turmaSelecionada) {
            this.showError('Por favor, selecione uma turma');
            return;
        }

        const alert = await this.alertController.create({
            header: 'Confirmar Matrícula',
            message: `Aluno: ${this.declaracaoSelecionada.nomeAluno}
Turma: ${this.turmaSelecionada.nomeTurma || this.turmaSelecionada.nome}
Horário: ${this.turmaSelecionada.horarioInicio} às ${this.turmaSelecionada.horarioFim}

Confirmar início da matrícula?`,
            buttons: [
                {
                    text: 'Não',
                    role: 'cancel'
                },
                {
                    text: 'Sim',
                    handler: () => {
                        this.iniciarMatricula();
                    }
                }
            ]
        });

        await alert.present();
    }

    /**
     * Inicia o processo de matrícula
     */
    async iniciarMatricula() {
        console.log('🚀 Iniciando matrícula com dados:', {
            idDeclaracao: this.idDeclaracao,
            turmaId: this.turmaSelecionada?.id,
            turmaNome: this.turmaSelecionada?.nomeTurma
        });

        const loading = await this.loadingController.create({
            message: 'Iniciando matrícula...',
            duration: 15000
        });
        await loading.present();

        try {
            // ID do funcionário logado (você pode pegar do serviço de autenticação)
            const idFuncionario = 1; // Por enquanto hardcoded

            this.matriculaService.iniciarMatriculaComTurma(
                this.idDeclaracao,
                this.turmaSelecionada!.id,
                idFuncionario
            ).subscribe({
                next: async (response: IniciarMatriculaResponse) => {
                    loading.dismiss();
                    console.log('✅ Resposta da matrícula:', response);

                    if (response.success) {
                        await this.showSuccessAlert(response.dadosMatricula);
                    } else {
                        console.error('❌ Erro na matrícula:', response.message);
                        this.showError(response.message);
                    }
                },
                error: (error: any) => {
                    loading.dismiss();
                    console.error('❌ Erro ao iniciar matrícula:', error);
                    this.showError('Erro ao iniciar matrícula. Tente novamente.');
                }
            });

        } catch (error) {
            loading.dismiss();
            this.showError('Erro inesperado ao iniciar matrícula');
        }
    }

    /**
     * Mostra alert de sucesso com dados da matrícula
     */
    async showSuccessAlert(dadosMatricula: any) {
        let message = 'Matrícula iniciada com sucesso!\n\n';

        if (dadosMatricula?.matricula) {
            message += `Matrícula: ${dadosMatricula.matricula}\n`;
        }
        if (dadosMatricula?.loginResponsavel) {
            message += `Login: ${dadosMatricula.loginResponsavel}\n`;
        }
        if (dadosMatricula?.senhaTemporaria) {
            message += `Senha: ${dadosMatricula.senhaTemporaria}\n\n`;
        }

        message += 'Use estes dados para acompanhar os documentos no sistema.';

        const alert = await this.alertController.create({
            header: '✅ Matrícula Iniciada!',
            message: message,
            buttons: [
                {
                    text: 'OK',
                    handler: () => {
                        // Redireciona para a lista de declarações
                        this.router.navigate(['/sistema/matriculas/lista-declaracoes']);
                    }
                }
            ]
        });

        await alert.present();
    }

    /**
     * Mostra mensagem de erro
     */
    async showError(message: string) {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color: 'danger',
            position: 'top'
        });
        await toast.present();
    }

    /**
     * Volta para a lista de declarações
     */
    voltar() {
        this.router.navigate(['/sistema/matriculas/lista-declaracoes']);
    }

    /**
     * Retorna classe CSS baseada no número de vagas disponíveis
     */
    getVagasClass(vagas: number): string {
        if (vagas <= 2) return 'vagas-poucas';
        if (vagas <= 5) return 'vagas-moderadas';
        return 'vagas-muitas';
    }

    /**
     * Processa dados adicionais da declaração
     */
    private processarDadosDeclaracao() {
        if (!this.declaracaoSelecionada) return;

        // Converter tipo de cota para descrição legível
        const tiposCota: { [key: string]: string } = {
            'livre': 'Livre Concorrência',
            'economica': 'Econômica',
            'funcionario': 'Funcionário'
        };
        this.declaracaoSelecionada.tipoCotaDescricao = tiposCota[this.declaracaoSelecionada.tipoCota] || this.declaracaoSelecionada.tipoCota;

        // Calcular dias aguardando
        if (this.declaracaoSelecionada.dataEnvio) {
            const dataEnvio = new Date(this.declaracaoSelecionada.dataEnvio);
            const agora = new Date();
            const diffTime = Math.abs(agora.getTime() - dataEnvio.getTime());
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            this.declaracaoSelecionada.diasAguardando = diffDays;
        } else {
            this.declaracaoSelecionada.diasAguardando = 0;
        }
    }
}
