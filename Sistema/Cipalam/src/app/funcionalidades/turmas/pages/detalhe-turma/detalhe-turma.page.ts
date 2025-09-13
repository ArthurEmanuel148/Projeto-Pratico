import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TurmasService, AlunoTurma, DetalhesAluno } from '../../services/turmas.service';
import { AlertController } from '@ionic/angular';

@Component({
    selector: 'app-detalhe-turma',
    templateUrl: './detalhe-turma.page.html',
    styleUrls: ['./detalhe-turma.page.scss'],
    standalone: false
})
export class DetalheTurmaPage implements OnInit {
    turmaId!: number;
    turmaName = '';
    alunos: AlunoTurma[] = [];
    alunosFiltrados: AlunoTurma[] = [];
    carregando = true;
    termoPesquisa = '';

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private turmasService: TurmasService,
        private alertController: AlertController
    ) { }

    ngOnInit() {
        const id = this.route.snapshot.paramMap.get('id');
        if (id) {
            this.turmaId = parseInt(id, 10);
            this.carregarAlunos();
        }
    }

    carregarAlunos() {
        this.carregando = true;
        this.turmasService.listarAlunosDaTurma(this.turmaId).subscribe({
            next: (alunos) => {
                this.alunos = alunos;
                this.alunosFiltrados = [...alunos]; // Inicializa a lista filtrada
                this.carregando = false;
                // Se há alunos, pega o nome da turma do primeiro aluno (assumindo que todos têm a mesma turma)
                if (alunos.length > 0) {
                    this.turmaName = `Turma ${this.turmaId}`;
                }
            },
            error: (error) => {
                console.error('Erro ao carregar alunos:', error);
                this.carregando = false;
            }
        });
    }

    filtrarAlunos() {
        if (!this.termoPesquisa.trim()) {
            this.alunosFiltrados = [...this.alunos];
        } else {
            const termo = this.termoPesquisa.toLowerCase();
            this.alunosFiltrados = this.alunos.filter(aluno =>
                aluno.nome.toLowerCase().includes(termo) ||
                aluno.cpf.includes(termo)
            );
        }
    }

    verDetalhesCompletos(aluno: AlunoTurma) {
        // Navegar para uma página dedicada de detalhes
        this.router.navigate(['/sistema/gestao-turmas/aluno', aluno.id]);
    }

    async transferirAluno(aluno: AlunoTurma) {
        const alert = await this.alertController.create({
            header: 'Transferir Aluno',
            message: `Digite o ID da nova turma para ${aluno.nome}:`,
            inputs: [
                {
                    name: 'novaTurmaId',
                    type: 'number',
                    placeholder: 'ID da nova turma',
                    min: 1
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Transferir',
                    handler: (data) => {
                        if (data.novaTurmaId && data.novaTurmaId > 0) {
                            this.confirmarTransferencia(aluno, parseInt(data.novaTurmaId, 10));
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    confirmarTransferencia(aluno: AlunoTurma, novaTurmaId: number) {
        this.turmasService.transferirAluno(aluno.id, novaTurmaId).subscribe({
            next: () => {
                // Remove o aluno da lista atual
                this.alunos = this.alunos.filter(a => a.id !== aluno.id);
                this.alunosFiltrados = this.alunosFiltrados.filter(a => a.id !== aluno.id);
                this.mostrarSucesso(`${aluno.nome} foi transferido para a turma ${novaTurmaId}`);
            },
            error: (error) => {
                console.error('Erro ao transferir aluno:', error);
                this.mostrarErro('Erro ao transferir aluno. Verifique se a turma de destino existe.');
            }
        });
    }

    async mostrarSucesso(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'Sucesso',
            message: mensagem,
            buttons: ['OK']
        });
        await alert.present();
    }

    async mostrarErro(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'Erro',
            message: mensagem,
            buttons: ['OK']
        });
        await alert.present();
    }

    formatarTipoCota(tipoCota: string): string {
        const mapeamento: Record<string, string> = {
            'funcionario': 'Funcionário',
            'economica': 'Cota Econômica',
            'livre': 'Ampla Concorrência',
            'social': 'Cota Social',
            'pcd': 'Pessoa com Deficiência'
        };
        return mapeamento[tipoCota] || tipoCota;
    }

    formatarStatus(status: string): string {
        const mapeamento: Record<string, string> = {
            'matriculado': 'Matriculado',
            'matricula_aprovada': 'Matrícula Aprovada',
            'documentos_completos': 'Documentos Completos'
        };
        return mapeamento[status] || status;
    }
}