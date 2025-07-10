import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MatriculaService } from '../core/services/matricula.service';
import { AuthService } from '../core/services/auth.service';
import {
  InteresseMatricula,
  DocumentoMatricula,
  DocumentosPendentesResponse,
  StatusDocumento
} from '../core/models/matricula.model';

@Component({
  selector: 'app-dashboard-responsavel',
  templateUrl: './dashboard-responsavel.page.html',
  styleUrls: ['./dashboard-responsavel.page.scss'],
  standalone: false
})
export class DashboardResponsavelPage implements OnInit, OnDestroy {
  statusMatricula: InteresseMatricula | null = null;
  documentosPendentes: DocumentosPendentesResponse | null = null;

  carregando = false;
  private subscriptions: Subscription[] = [];

  constructor(
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController,
    public matriculaService: MatriculaService,
    private authService: AuthService
  ) {}

  async ngOnInit() {
    await this.carregarDados();
    this.configurarAtualizacoesAutomaticas();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Carrega os dados do dashboard
   */
  async carregarDados() {
    this.carregando = true;

    try {
      // Carrega o status da matrícula
      this.statusMatricula = await this.matriculaService.buscarStatusMatricula().toPromise() || null;

      // Carrega os documentos pendentes
      this.documentosPendentes = await this.matriculaService.buscarDocumentosPendentes().toPromise() || null;

    } catch (error: any) {
      console.error('Erro ao carregar dados:', error);
      await this.mostrarToast('Erro ao carregar informações', 'danger');
    } finally {
      this.carregando = false;
    }
  }

  /**
   * Configura atualizações automáticas quando há mudanças
   */
  private configurarAtualizacoesAutomaticas() {
    const sub = this.matriculaService.matriculasAtualizadas$.subscribe(atualizado => {
      if (atualizado) {
        this.carregarDados();
      }
    });

    this.subscriptions.push(sub);
  }

  /**
   * Atualiza os dados manualmente
   */
  async atualizarDados() {
    const loading = await this.loadingController.create({
      message: 'Atualizando...',
      duration: 2000
    });

    await loading.present();
    await this.carregarDados();
    await loading.dismiss();
  }

  /**
   * Abre o documento para anexar/assinar
   */
  async abrirDocumento(documento: DocumentoMatricula) {
    if (documento.tipoDocumento.requerAssinatura) {
      await this.abrirAssinaturaDocumento(documento);
    } else if (documento.tipoDocumento.requerAnexo) {
      await this.abrirAnexoDocumento(documento);
    }
  }

  /**
   * Abre modal para anexar arquivo ao documento
   */
  async abrirAnexoDocumento(documento: DocumentoMatricula) {
    // Implementação simplificada - em um sistema real usaria um modal customizado para upload
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.jpg,.jpeg,.png,.pdf';
    input.onchange = (event: any) => {
      const arquivo = event.target.files[0];
      if (arquivo) {
        this.processarAnexo(documento, { arquivo, observacoes: '' });
      }
    };
    input.click();
  }

  /**
   * Abre modal para assinatura digital
   */
  async abrirAssinaturaDocumento(documento: DocumentoMatricula) {
    try {
      // Busca o template do documento
      const templateResponse = await this.matriculaService
        .buscarTemplateDocumento(documento.tipoDocumento.idTipoDocumento)
        .toPromise();

      if (!templateResponse?.template) {
        throw new Error('Template do documento não encontrado.');
      }

      // Aqui você implementaria um modal customizado para assinatura
      // Por simplicidade, vou usar um alert básico
      const alert = await this.alertController.create({
        header: 'Assinar Documento',
        subHeader: documento.tipoDocumento.nome,
        message: `
          <div style="text-align: left; max-height: 300px; overflow-y: auto; border: 1px solid #ccc; padding: 10px; font-size: 12px;">
            ${templateResponse.template.replace(/\n/g, '<br>')}
          </div>
          <br>
          <p><strong>Para assinar este documento, digite seu nome completo:</strong></p>
        `,
        inputs: [
          {
            name: 'nomeCompleto',
            type: 'text',
            placeholder: 'Nome completo para assinatura',
            attributes: {
              required: true,
              minlength: 5
            }
          },
          {
            name: 'observacoes',
            type: 'textarea',
            placeholder: 'Observações (opcional)',
            attributes: {
              rows: 2,
              maxlength: 200
            }
          }
        ],
        buttons: [
          {
            text: 'Cancelar',
            role: 'cancel'
          },
          {
            text: 'Assinar',
            handler: (data) => this.processarAssinatura(documento, data)
          }
        ]
      });

      await alert.present();

    } catch (error: any) {
      console.error('Erro ao abrir documento para assinatura:', error);
      await this.mostrarToast('Erro ao carregar documento', 'danger');
    }
  }

  /**
   * Processa o anexo de arquivo
   */
  async processarAnexo(documento: DocumentoMatricula, data: any) {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    const arquivo = fileInput?.files?.[0];

    if (!arquivo) {
      await this.mostrarToast('Selecione um arquivo', 'warning');
      return false;
    }

    // Valida o arquivo
    const validacao = this.matriculaService.validarArquivo(arquivo);
    if (!validacao.valido) {
      await this.mostrarToast(validacao.erro || 'Arquivo inválido', 'danger');
      return false;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando arquivo...',
      backdropDismiss: false
    });
    await loading.present();

    try {
      const response = await this.matriculaService.anexarDocumento({
        documentoId: documento.idDocumentoMatricula,
        arquivo: arquivo,
        observacoes: data.observacoes
      }).toPromise();

      if (response?.success) {
        await this.mostrarToast('Arquivo anexado com sucesso!', 'success');
        await this.carregarDados();
        return true;
      } else {
        throw new Error(response?.message || 'Erro ao anexar arquivo');
      }

    } catch (error: any) {
      console.error('Erro ao anexar arquivo:', error);
      await this.mostrarToast(error.message || 'Erro ao anexar arquivo', 'danger');
      return false;
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Processa a assinatura digital
   */
  async processarAssinatura(documento: DocumentoMatricula, data: any) {
    if (!data.nomeCompleto || data.nomeCompleto.trim().length < 5) {
      await this.mostrarToast('Nome completo é obrigatório', 'warning');
      return false;
    }

    const loading = await this.loadingController.create({
      message: 'Processando assinatura...',
      backdropDismiss: false
    });
    await loading.present();

    try {
      // Cria uma assinatura digital simples (em um sistema real, seria mais complexo)
      const assinaturaDigital = btoa(JSON.stringify({
        nomeCompleto: data.nomeCompleto,
        documento: documento.tipoDocumento.nome,
        dataAssinatura: new Date().toISOString(),
        ip: 'Cliente', // Em um sistema real, capturaria o IP
        userAgent: navigator.userAgent
      }));

      const response = await this.matriculaService.assinarDocumento({
        documentoId: documento.idDocumentoMatricula,
        assinatura: assinaturaDigital,
        observacoes: data.observacoes
      }).toPromise();

      if (response?.success) {
        await this.mostrarToast('Documento assinado com sucesso!', 'success');
        await this.carregarDados();
        return true;
      } else {
        throw new Error(response?.message || 'Erro ao assinar documento');
      }

    } catch (error: any) {
      console.error('Erro ao assinar documento:', error);
      await this.mostrarToast(error.message || 'Erro ao assinar documento', 'danger');
      return false;
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Remove anexo de um documento
   */
  async removerAnexo(documento: DocumentoMatricula) {
    const alert = await this.alertController.create({
      header: 'Remover Anexo',
      message: `Tem certeza que deseja remover o anexo do documento "${documento.tipoDocumento.nome}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: async () => {
            // Implementar remoção do anexo
            await this.mostrarToast('Funcionalidade em desenvolvimento', 'warning');
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Faz logout do sistema
   */
  async logout() {
    const alert = await this.alertController.create({
      header: 'Sair do Sistema',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

  // ==========================================
  // MÉTODOS AUXILIARES PARA O TEMPLATE
  // ==========================================

  trackByDocumento(index: number, documento: DocumentoMatricula): number {
    return documento.idDocumentoMatricula;
  }

  getIconeDocumento(documento: DocumentoMatricula): string {
    if (documento.status === 'aprovado') return 'checkmark-circle';
    if (documento.status === 'assinado') return 'create';
    if (documento.status === 'anexado') return 'attach';
    if (documento.status === 'rejeitado') return 'close-circle';
    return 'document-outline';
  }

  getCorDocumento(documento: DocumentoMatricula): string {
    if (documento.status === 'aprovado') return 'success';
    if (documento.status === 'assinado') return 'primary';
    if (documento.status === 'anexado') return 'warning';
    if (documento.status === 'rejeitado') return 'danger';
    return 'medium';
  }

  getTextoStatus(status: StatusDocumento): string {
    const statusMap: Record<StatusDocumento, string> = {
      'pendente': 'Pendente',
      'anexado': 'Anexado',
      'assinado': 'Assinado',
      'aprovado': 'Aprovado',
      'rejeitado': 'Rejeitado'
    };
    return statusMap[status] || status;
  }

  getCorStatus(status: StatusDocumento): string {
    const coresMap: Record<StatusDocumento, string> = {
      'pendente': 'medium',
      'anexado': 'warning',
      'assinado': 'primary',
      'aprovado': 'success',
      'rejeitado': 'danger'
    };
    return coresMap[status] || 'medium';
  }

  getIconeAcao(documento: DocumentoMatricula): string {
    if (documento.status === 'pendente') {
      return documento.tipoDocumento.requerAssinatura ? 'create-outline' : 'cloud-upload-outline';
    }
    if (documento.status === 'anexado') return 'eye-outline';
    if (documento.status === 'assinado') return 'eye-outline';
    if (documento.status === 'aprovado') return 'checkmark-outline';
    if (documento.status === 'rejeitado') return 'refresh-outline';
    return 'chevron-forward-outline';
  }

  getCorAcao(documento: DocumentoMatricula): string {
    if (documento.status === 'pendente') return 'primary';
    if (documento.status === 'anexado') return 'warning';
    if (documento.status === 'assinado') return 'primary';
    if (documento.status === 'aprovado') return 'success';
    if (documento.status === 'rejeitado') return 'danger';
    return 'medium';
  }

  podeEditarDocumento(documento: DocumentoMatricula): boolean {
    return documento.status === 'pendente' || documento.status === 'anexado' || documento.status === 'rejeitado';
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
