import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, AlertController, LoadingController, ToastController } from '@ionic/angular';
import { MatriculaService } from '../../services/matricula.service';
import {
  Turma,
  TurmaDisponivel,
  IniciarMatriculaRequest,
  IniciarMatriculaResponse
} from '../../models/turma.model';

@Component({
  selector: 'app-matricula-funcionario',
  templateUrl: './matricula-funcionario-simple.page.html',
  styleUrls: ['./matricula-funcionario.page.scss'],
  standalone: false
})
export class MatriculaFuncionarioPage implements OnInit {

  matriculaForm!: FormGroup;
  turmaSelecionada: Turma | null = null;
  turmasDisponiveis: TurmaDisponivel[] = [];
  isLoading = false;
  maxDate = new Date().toISOString();

  constructor(
    private formBuilder: FormBuilder,
    private matriculaService: MatriculaService,
    private modalController: ModalController,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) {
    this.initializeForm();
  }

  ngOnInit() {
    this.carregarTurmasDisponiveis();
  }

  ionViewWillEnter() {
    // Recarrega as turmas toda vez que a página for exibida
    this.carregarTurmasDisponiveis();
  }

  private initializeForm() {
    this.matriculaForm = this.formBuilder.group({
      // Dados do Responsável
      nomeResponsavel: ['', [Validators.required, Validators.minLength(3)]],
      cpfResponsavel: ['', [Validators.required]],
      emailResponsavel: ['', [Validators.required, Validators.email]],
      telefoneResponsavel: ['', [Validators.required]],

      // Dados do Aluno
      nomeAluno: ['', [Validators.required, Validators.minLength(3)]],
      dataNascimentoAluno: ['', [Validators.required]],
      cpfAluno: [''],

      // Observações
      observacoes: ['']
    });
  }

  async carregarTurmasDisponiveis() {
    const loading = await this.loadingController.create({
      message: 'Carregando turmas disponíveis...',
      duration: 10000
    });
    await loading.present();

    this.matriculaService.getTurmasDisponiveis().subscribe({
      next: (turmas) => {
        this.turmasDisponiveis = turmas;
        loading.dismiss();
      },
      error: (error) => {
        console.error('Erro ao carregar turmas:', error);
        loading.dismiss();
        this.showErrorToast('Erro ao carregar turmas disponíveis');
      }
    });
  }

  async abrirSeletorTurma() {
    if (this.turmasDisponiveis.length === 0) {
      this.showErrorToast('Nenhuma turma disponível no momento');
      return;
    }

    // Por enquanto, vamos usar um alerta simples para seleção
    // TODO: Implementar modal sofisticado depois
    const alert = await this.alertController.create({
      header: 'Selecionar Turma',
      inputs: this.turmasDisponiveis
        .filter(t => t.disponivel)
        .map(turmaDisp => ({
          type: 'radio',
          label: `${turmaDisp.turma.nomeTurma} - ${turmaDisp.turma.atividade} (${turmaDisp.turma.vagasDisponiveis} vagas)`,
          value: turmaDisp.turma,
          checked: false
        })),
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: (turma) => {
            if (turma) {
              this.turmaSelecionada = turma;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  removerTurmaSelecionada() {
    this.turmaSelecionada = null;
  }

  // Formatação de campos
  formatarCPF(event: any) {
    const campo = event.target.getAttribute('formControlName');
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length <= 11) {
      valor = valor.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
      this.matriculaForm.get(campo)?.setValue(valor);
    }
  }

  formatarTelefone(event: any) {
    let valor = event.target.value.replace(/\D/g, '');

    if (valor.length <= 11) {
      if (valor.length === 11) {
        valor = valor.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
      } else if (valor.length === 10) {
        valor = valor.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
      }
      this.matriculaForm.get('telefoneResponsavel')?.setValue(valor);
    }
  }

  // Validações
  get isFormValid(): boolean {
    return this.matriculaForm.valid && this.turmaSelecionada !== null;
  }

  validarCPF(cpf: string): boolean {
    return this.matriculaService.validarCPF(cpf);
  }

  // Submissão do formulário
  async iniciarMatricula() {
    if (!this.isFormValid) {
      this.showErrorToast('Preencha todos os campos obrigatórios e selecione uma turma');
      return;
    }

    // Validar CPF do responsável
    const cpfResponsavel = this.matriculaForm.get('cpfResponsavel')?.value.replace(/\D/g, '');
    if (!this.validarCPF(cpfResponsavel)) {
      this.showErrorToast('CPF do responsável inválido');
      return;
    }

    // Validar CPF do aluno se preenchido
    const cpfAluno = this.matriculaForm.get('cpfAluno')?.value?.replace(/\D/g, '');
    if (cpfAluno && !this.validarCPF(cpfAluno)) {
      this.showErrorToast('CPF do aluno inválido');
      return;
    }

    const confirmacao = await this.confirmarMatricula();
    if (!confirmacao) return;

    await this.processarMatricula();
  }

  private async confirmarMatricula(): Promise<boolean> {
    const alert = await this.alertController.create({
      header: 'Confirmar Matrícula',
      message: `
        <div class="confirmacao-matricula">
          <p><strong>Turma:</strong> ${this.turmaSelecionada?.nomeTurma}</p>
          <p><strong>Responsável:</strong> ${this.matriculaForm.get('nomeResponsavel')?.value}</p>
          <p><strong>Aluno:</strong> ${this.matriculaForm.get('nomeAluno')?.value}</p>
          <br>
          <p>Esta ação irá:</p>
          <ul>
            <li>Criar automaticamente a família, aluno e responsável</li>
            <li>Gerar credenciais de acesso</li>
            <li>Criar documentos pendentes</li>
          </ul>
          <p><em>Deseja continuar?</em></p>
        </div>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => true
        }
      ]
    });

    await alert.present();
    const result = await alert.onDidDismiss();
    return result.role !== 'cancel';
  }

  private async processarMatricula() {
    const loading = await this.loadingController.create({
      message: 'Processando matrícula...',
    });
    await loading.present();

    const formValues = this.matriculaForm.value;

    const request: IniciarMatriculaRequest = {
      idTurma: this.turmaSelecionada!.idtbTurma,
      nomeTurma: this.turmaSelecionada!.nomeTurma,
      nomeResponsavel: formValues.nomeResponsavel,
      cpfResponsavel: formValues.cpfResponsavel.replace(/\D/g, ''),
      emailResponsavel: formValues.emailResponsavel,
      telefoneResponsavel: formValues.telefoneResponsavel.replace(/\D/g, ''),
      nomeAluno: formValues.nomeAluno,
      dataNascimentoAluno: formValues.dataNascimentoAluno,
      cpfAluno: formValues.cpfAluno?.replace(/\D/g, '') || undefined,
      observacoes: formValues.observacoes || undefined
    };

    this.matriculaService.iniciarMatriculaProcedural(request).subscribe({
      next: async (response) => {
        loading.dismiss();
        await this.exibirResultadoMatricula(response);
      },
      error: async (error) => {
        loading.dismiss();
        console.error('Erro na matrícula:', error);
        this.showErrorToast('Erro ao processar matrícula. Tente novamente.');
      }
    });
  }

  private async exibirResultadoMatricula(response: IniciarMatriculaResponse) {
    if (response.sucesso) {
      const alert = await this.alertController.create({
        header: 'Matrícula Realizada com Sucesso!',
        message: `
          <div class="resultado-sucesso">
            <ion-icon name="checkmark-circle" color="success" style="font-size: 48px;"></ion-icon>
            <p><strong>Credenciais de Acesso Geradas:</strong></p>
            <p><strong>Usuário:</strong> ${response.loginResponsavel}</p>
            <p><strong>Senha:</strong> ${response.senhaResponsavel}</p>
            <br>
            <p><strong>IDs Gerados:</strong></p>
            <p>Família: ${response.idFamilia}</p>
            <p>Responsável: ${response.idResponsavel}</p>
            <p>Aluno: ${response.idAluno}</p>
            <br>
            ${response.documentosPendentes && response.documentosPendentes.length > 0 ?
            `<p><strong>Documentos Pendentes:</strong></p>
               <ul>${response.documentosPendentes.map(doc => `<li>${doc}</li>`).join('')}</ul>` :
            ''}
            <p><em>Anote essas informações!</em></p>
          </div>
        `,
        buttons: [
          {
            text: 'Nova Matrícula',
            handler: () => {
              this.limparFormulario();
            }
          },
          {
            text: 'OK',
            role: 'cancel'
          }
        ]
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: 'Erro na Matrícula',
        message: response.mensagem,
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  limparFormulario() {
    this.matriculaForm.reset();
    this.turmaSelecionada = null;
    this.carregarTurmasDisponiveis();
  }

  private async showErrorToast(message: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }

  // Helpers para template
  getPeriodoTexto(periodo: string): string {
    const periodos: { [key: string]: string } = {
      'MANHA': 'Manhã',
      'TARDE': 'Tarde',
      'NOITE': 'Noite',
      'INTEGRAL': 'Integral'
    };
    return periodos[periodo] || periodo;
  }

  getCorPeriodo(periodo: string): string {
    const cores: { [key: string]: string } = {
      'MANHA': 'warning',
      'TARDE': 'primary',
      'NOITE': 'dark',
      'INTEGRAL': 'secondary'
    };
    return cores[periodo] || 'medium';
  }
}
