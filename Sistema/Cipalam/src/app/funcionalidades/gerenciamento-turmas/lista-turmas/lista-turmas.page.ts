import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { TurmaService, Turma } from '../../../core/services/turma.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-lista-turmas',
    templateUrl: './lista-turmas.page.html',
    styleUrls: ['./lista-turmas.page.scss'],
    standalone: false
})
export class ListaTurmasPage implements OnInit {
    turmas: Turma[] = [];
    turmasFiltradas: Turma[] = [];
    loading = false;
    podeGerenciarTurmas = false;

    // Filtros
    filtroTexto = '';
    filtroPeriodo = '';
    filtroStatus = '';

    constructor(
        private turmaService: TurmaService,
        private authService: AuthService,
        private router: Router,
        private alertController: AlertController,
        private toastController: ToastController,
        private loadingController: LoadingController
    ) { }

    ngOnInit() {
        this.verificarPermissoes();
        this.carregarTurmas();
    }

    ionViewWillEnter() {
        this.carregarTurmas();
    }

    verificarPermissoes() {
        const usuario = this.authService.getFuncionarioLogado();
        this.podeGerenciarTurmas = !!(usuario?.tipo === 'admin' ||
            usuario?.tipo === 'funcionario' ||
            usuario?.permissoes?.['gerenciamentoTurmas']);
    }

    async carregarTurmas() {
        const loading = await this.loadingController.create({
            message: 'Carregando turmas...'
        });
        await loading.present();

        this.turmaService.listarTodas().subscribe({
            next: (turmas) => {
                console.log('Turmas recebidas do backend:', turmas);
                this.turmas = turmas.map(turma => ({
                    ...turma,
                    vagasDisponiveis: (turma.capacidadeMaxima || 0) - (turma.capacidadeAtual || 0),
                    temVagas: ((turma.capacidadeMaxima || 0) - (turma.capacidadeAtual || 0)) > 0
                }));
                this.aplicarFiltros();
                loading.dismiss();
            },
            error: (error) => {
                console.error('Erro ao carregar turmas:', error);
                loading.dismiss();
                this.showToast('Erro ao carregar turmas', 'danger');

                // Dados mock para demonstração
                this.turmas = [
                    {
                        id: 1,
                        nomeTurma: 'Turma A - Manhã',
                        capacidadeMaxima: 25,
                        capacidadeAtual: 20,
                        horarioInicio: '08:00',
                        horarioFim: '12:00',
                        ativo: true,
                        observacoes: 'Turma do período matutino',
                        vagasDisponiveis: 5,
                        temVagas: true
                    },
                    {
                        id: 2,
                        nomeTurma: 'Turma B - Tarde',
                        capacidadeMaxima: 20,
                        capacidadeAtual: 18,
                        horarioInicio: '14:00',
                        horarioFim: '18:00',
                        ativo: true,
                        observacoes: 'Turma do período vespertino',
                        vagasDisponiveis: 2,
                        temVagas: true
                    }
                ];
                this.aplicarFiltros();
            }
        });
    }

    aplicarFiltros() {
        this.turmasFiltradas = this.turmas.filter(turma => {
            let passa = true;

            // Filtro por texto
            if (this.filtroTexto) {
                const texto = this.filtroTexto.toLowerCase();
                passa = passa && (
                    turma.nomeTurma.toLowerCase().includes(texto) ||
                    (turma.observacoes?.toLowerCase().includes(texto) || false)
                );
            }

            // Filtro por período
            if (this.filtroPeriodo) {
                const periodoTurma = this.turmaService.getPeriodoDoDia(turma.horarioInicio);
                passa = passa && periodoTurma.toLowerCase() === this.filtroPeriodo.toLowerCase();
            }

            // Filtro por status
            if (this.filtroStatus) {
                if (this.filtroStatus === 'ativo') {
                    passa = passa && !!turma.ativo;
                } else if (this.filtroStatus === 'inativo') {
                    passa = passa && !turma.ativo;
                } else if (this.filtroStatus === 'com-vagas') {
                    passa = passa && !!turma.temVagas;
                } else if (this.filtroStatus === 'lotada') {
                    passa = passa && !turma.temVagas;
                }
            }

            return passa;
        });
    }

    limparFiltros() {
        this.filtroTexto = '';
        this.filtroPeriodo = '';
        this.filtroStatus = '';
        this.aplicarFiltros();
    }

    navegarParaCadastro() {
        this.router.navigate(['/sistema/turmas/cadastro']);
    }

    editarTurma(id: number) {
        this.router.navigate(['/sistema/turmas/cadastro'], { queryParams: { id } });
    }

    async confirmarExclusao(turma: Turma) {
        const alert = await this.alertController.create({
            header: 'Confirmar Exclusão',
            message: `Tem certeza que deseja excluir a turma "${turma.nomeTurma}"?`,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Excluir',
                    role: 'destructive',
                    handler: () => {
                        this.excluirTurma(turma.id!);
                    }
                }
            ]
        });

        await alert.present();
    }

    async excluirTurma(id: number) {
        const loading = await this.loadingController.create({
            message: 'Excluindo turma...'
        });
        await loading.present();

        this.turmaService.excluirTurma(id).subscribe({
            next: (response) => {
                loading.dismiss();
                this.showToast('Turma excluída com sucesso!', 'success');
                this.carregarTurmas();
            },
            error: (error) => {
                loading.dismiss();
                console.error('Erro ao excluir turma:', error);
                const message = error.error?.message || 'Erro ao excluir turma';
                this.showToast(message, 'danger');
            }
        });
    }

    getStatusVagas(turma: Turma): { cor: string, texto: string } {
        if (!turma.temVagas) {
            return { cor: 'danger', texto: 'Lotada' };
        }

        const percentualOcupacao = (turma.capacidadeAtual / turma.capacidadeMaxima) * 100;

        if (percentualOcupacao >= 80) {
            return { cor: 'warning', texto: 'Poucas vagas' };
        } else {
            return { cor: 'success', texto: 'Disponível' };
        }
    }

    getCorPeriodo(periodo: any): string {
        return this.turmaService.getCorPorHorario(periodo);
    }

    getPeriodoFormatado(turma: Turma): string {
        return this.turmaService.getPeriodoDoDia(turma.horarioInicio);
    }

    async showToast(message: string, color: string = 'medium') {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color,
            position: 'top'
        });
        toast.present();
    }

    /**
     * Navega para a página de gestão de turmas para ver alunos matriculados
     */
    verAlunosMatriculados(turmaId: number) {
        this.router.navigate(['/sistema/gestao-turmas/detalhe', turmaId]);
    }
}
