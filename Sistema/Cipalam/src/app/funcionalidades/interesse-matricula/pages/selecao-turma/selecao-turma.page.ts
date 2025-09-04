import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { Observable, forkJoin } from 'rxjs';
import { MatriculaService } from '../../services/matricula.service';

// Interfaces para tipagem
interface TurmaDisponivel {
  id: number;
  nome: string;
  descricao?: string;
  vagasDisponiveis: number;
  totalVagas: number;
  horario?: string;
  turno?: string;
  capacidadeMaxima: number;
  descricaoCompleta?: string;
  temVagas: number;
}

interface DeclaracaoParaMatricula {
  id: number;
  protocolo: string;
  nomeCompleto: string;
  tipoCota: string;
  nomeAluno?: string;
  nomeResponsavel?: string;
  tipoCotaDescricao?: string;
  diasAguardando?: number;
  dataEnvio?: string;
}

interface IniciarMatriculaResponse {
  sucesso: boolean;
  mensagem: string;
  dadosMatricula?: any;
  matricula?: string;
  loginResponsavel?: string;
  senhaTemporaria?: string;
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
      if (this.idDeclaracao) {
        this.carregarDados();
      } else {
        this.showError('ID da declaração não encontrado');
        this.router.navigate(['/lista-declaracoes']);
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
            this.router.navigate(['/lista-declaracoes']);
            return;
          }

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
      message: `
        <div style="text-align: left;">
          <strong>Aluno:</strong> ${this.declaracaoSelecionada.nomeAluno}<br>
          <strong>Turma:</strong> ${this.turmaSelecionada.nome}<br>
          <strong>Turno:</strong> ${this.turmaSelecionada.turno}
        </div>
        <br>
        Confirmar início da matrícula?
      `,
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
          
          if (response.sucesso) {
            await this.showSuccessAlert(response);
          } else {
            this.showError(response.mensagem);
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
   * Mostra alerta de sucesso com dados da matrícula
   */
  async showSuccessAlert(response: IniciarMatriculaResponse) {
    const alert = await this.alertController.create({
      header: '✅ Matrícula Iniciada!',
      message: `
        <div style="text-align: left;">
          ${response.matricula ? `<strong>Matrícula:</strong> ${response.matricula}<br>` : ''}
          ${response.loginResponsavel ? `<strong>Login:</strong> ${response.loginResponsavel}<br>` : ''}
          ${response.senhaTemporaria ? `<strong>Senha:</strong> ${response.senhaTemporaria}<br><br>` : ''}
          <small>Use estes dados para acompanhar os documentos no sistema.</small>
        </div>
      `,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            // Redireciona para a lista de declarações
            this.router.navigate(['/sistema/paineis/declaracoes-interesse']);
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
    this.router.navigate(['/lista-declaracoes']);
  }

  /**
   * Retorna classe CSS baseada no número de vagas disponíveis
   */
  getVagasClass(vagas: number): string {
    if (vagas <= 2) return 'vagas-poucas';
    if (vagas <= 5) return 'vagas-moderadas';
    return 'vagas-muitas';
  }
}
