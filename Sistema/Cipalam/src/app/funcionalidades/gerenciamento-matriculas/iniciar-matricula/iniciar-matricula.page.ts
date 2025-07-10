// src/app/funcionalidades/gerenciamento-matriculas/iniciar-matricula/iniciar-matricula.page.ts

import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { MatriculaService } from '../../../core/services/matricula.service';
import { AuthService } from '../../../core/services/auth.service';
import { InteresseMatricula, TipoDocumento } from '../../../core/models/matricula.model';

@Component({
  selector: 'app-iniciar-matricula',
  templateUrl: './iniciar-matricula.page.html',
  styleUrls: ['./iniciar-matricula.page.scss']
})
export class IniciarMatriculaPage implements OnInit {
  interesse: InteresseMatricula | null = null;
  tiposDocumentos: TipoDocumento[] = [];
  formulario: FormGroup;

  carregando = false;
  carregandoDocumentos = false;
  iniciando = false;
  erro: string | null = null;

  private interesseId: number;
  private funcionarioId: number;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    public matriculaService: MatriculaService,
    private authService: AuthService
  ) {
    this.interesseId = Number(this.route.snapshot.paramMap.get('id'));
    this.funcionarioId = 1; // TODO: Implementar método para obter ID do usuário logado

    this.formulario = this.formBuilder.group({
      observacoes: ['', [Validators.maxLength(500)]]
    });
  }

  async ngOnInit() {
    await this.carregarDados();
  }

  /**
   * Carrega os dados da declaração de interesse
   */
  async carregarDados() {
    if (!this.interesseId) {
      this.erro = 'ID da declaração não encontrado.';
      return;
    }

    this.carregando = true;
    this.erro = null;

    try {
      // Carrega os dados da declaração
      const interesse = await this.matriculaService.buscarInteresseMatricula(this.interesseId).toPromise();
      this.interesse = interesse || null;

      if (!this.interesse) {
        throw new Error('Declaração de interesse não encontrada.');
      }

      // Verifica se a matrícula já foi iniciada
      if (this.interesse.status !== 'interesse_declarado') {
        await this.mostrarAlerta(
          'Aviso',
          'Esta declaração de interesse já possui uma matrícula em andamento.',
          () => this.voltar()
        );
        return;
      }

      // Carrega os tipos de documentos
      await this.carregarTiposDocumentos();

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      this.erro = error.message || 'Erro ao carregar os dados da declaração.';
    } finally {
      this.carregando = false;
    }
  }

  /**
   * Carrega os tipos de documentos necessários
   */
  async carregarTiposDocumentos() {
    if (!this.interesse) return;

    this.carregandoDocumentos = true;

    try {
      this.tiposDocumentos = await this.matriculaService
        .buscarTiposDocumentos(this.interesse.tipoCota)
        .toPromise() || [];

      // Ordena por ordem de exibição
      this.tiposDocumentos.sort((a, b) => a.ordemExibicao - b.ordemExibicao);

    } catch (error: any) {
      console.error('Erro ao carregar tipos de documentos:', error);
      await this.mostrarToast('Erro ao carregar tipos de documentos', 'danger');
    } finally {
      this.carregandoDocumentos = false;
    }
  }

  /**
   * Inicia o processo de matrícula
   */
  async iniciarMatricula() {
    if (!this.interesse || this.formulario.invalid) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Início de Matrícula',
      message: `
        Tem certeza que deseja iniciar a matrícula para <strong>${this.interesse.nomeCompleto}</strong>?
        <br><br>
        Esta ação irá:
        <ul style="text-align: left; margin: 10px 0;">
          <li>Criar um login para o responsável</li>
          <li>Enviar as credenciais por e-mail</li>
          <li>Disponibilizar os documentos para envio</li>
        </ul>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => this.confirmarInicioMatricula()
        }
      ]
    });

    await alert.present();
  }

  /**
   * Confirma e executa o início da matrícula
   */
  async confirmarInicioMatricula() {
    this.iniciando = true;

    const loading = await this.loadingController.create({
      message: 'Iniciando matrícula...',
      backdropDismiss: false
    });
    await loading.present();

    try {
      const response = await this.matriculaService.iniciarMatricula({
        interesseId: this.interesseId,
        funcionarioId: this.funcionarioId,
        observacoes: this.formulario.get('observacoes')?.value
      }).toPromise();

      if (response?.success) {
        await this.mostrarSucessoMatricula(response);
      } else {
        throw new Error(response?.message || 'Erro ao iniciar matrícula.');
      }

    } catch (error: any) {
      console.error('Erro ao iniciar matrícula:', error);
      await this.mostrarToast(
        error.message || 'Erro ao iniciar matrícula',
        'danger'
      );
    } finally {
      await loading.dismiss();
      this.iniciando = false;
    }
  }

  /**
   * Mostra o sucesso da matrícula com as credenciais
   */
  async mostrarSucessoMatricula(response: any) {
    const alert = await this.alertController.create({
      header: 'Matrícula Iniciada com Sucesso!',
      message: `
        <div style="text-align: left;">
          <p><strong>Login criado para o responsável:</strong></p>
          <p><strong>Usuário:</strong> ${response.credenciaisResponsavel.usuario}</p>
          <p><strong>Senha Temporária:</strong> ${response.credenciaisResponsavel.senhaTemporaria}</p>
          <br>
          <p><small><em>As credenciais foram enviadas por e-mail para ${this.interesse?.email}</em></small></p>
        </div>
      `,
      buttons: [
        {
          text: 'Entendi',
          handler: () => {
            this.router.navigate(['/paineis/interesse-matricula/lista-declaracoes']);
          }
        }
      ],
      backdropDismiss: false
    });

    await alert.present();
  }

  /**
   * Formata o tipo de cota para exibição
   */
  formatarTipoCota(tipoCota: string): string {
    const tipos: Record<string, string> = {
      'geral': 'Ampla Concorrência',
      'economica': 'Cota Econômica',
      'pcd': 'Pessoa com Deficiência',
      'etnico_racial': 'Cota Étnico-Racial'
    };

    return tipos[tipoCota] || tipoCota;
  }

  /**
   * Volta para a lista de declarações
   */
  voltar() {
    this.router.navigate(['/paineis/interesse-matricula/lista-declaracoes']);
  }

  /**
   * Mostra um alerta
   */
  private async mostrarAlerta(
    titulo: string,
    mensagem: string,
    callback?: () => void
  ) {
    const alert = await this.alertController.create({
      header: titulo,
      message: mensagem,
      buttons: [
        {
          text: 'OK',
          handler: callback
        }
      ]
    });

    await alert.present();
  }

  /**
   * Mostra um toast
   */
  private async mostrarToast(mensagem: string, cor: string = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top'
    });

    await toast.present();
  }
}
