import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { FuncionalidadesSistemaService } from '../core/services/funcionalidades-sistema.service';
import { FuncionalidadesUsoService, FuncionalidadeUso } from '../core/services/funcionalidades-usos.service';
import { AuthService } from '../core/services/auth.service';
import { DocumentoService } from '../core/services/documento.service';



interface Feature {
  id: string;
  name: string;
  icon: string;
  route?: string; // Rota para navegação
  action?: () => void; // Ação customizada
  color?: string; // Cor do ícone (opcional)
}

@Component({
  selector: 'app-painel-funcionario',
  templateUrl: './painel-funcionario.page.html',
  styleUrls: ['./painel-funcionario.page.scss'],
  standalone: false,
})

export class PainelFuncionarioPage implements OnInit {
  usuarioLogado: any = null;
  mostUsedFeatures: any[] = [];
  estatisticasUso: any = null;
  isResponsavel: boolean = false;
  tipoCota: string = 'livre'; // Será carregado do backend
  documentosPendentes: any[] = [];
  documentosCarregando: boolean = false;

  constructor(
    private router: Router,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController,
    private authService: AuthService,
    private funcionalidadesService: FuncionalidadesSistemaService,
    private funcionalidadesUsosService: FuncionalidadesUsoService,
    private documentoService: DocumentoService
  ) { }

  ngOnInit() {
    // Carrega usuário logado
    this.usuarioLogado = this.authService.getFuncionarioLogado();

    // Detecta se é responsável
    this.isResponsavel = this.usuarioLogado?.tipo === 'responsavel';

    // Se for responsável, não carrega as funcionalidades de funcionário
    if (this.isResponsavel) {
      console.log('Usuário responsável detectado - exibindo painel específico');
      this.carregarDocumentosPendentes();
      return;
    }

    // Carrega funcionalidades mais usadas para o dashboard (apenas para funcionários)
    this.funcionalidadesUsosService.getDashboardItems().subscribe((dashboardItems: FuncionalidadeUso[]) => {
      this.mostUsedFeatures = dashboardItems.map((item: FuncionalidadeUso) => ({
        id: item.chave,
        name: item.nomeAmigavel,
        icon: item.icone,
        route: item.rota,
        color: 'primary',
        usageCount: item.contador,
        lastAccess: item.ultimoAcesso
      }));
    });

    // Carrega estatísticas de uso
    this.estatisticasUso = this.funcionalidadesUsosService.getEstatisticas();
  }

  async carregarDocumentosPendentes() {
    if (!this.usuarioLogado?.idPessoa) return;

    this.documentosCarregando = true;

    try {
      const documentos = await this.documentoService.listarDocumentosPendentes(this.usuarioLogado.idPessoa).toPromise();
      this.documentosPendentes = documentos || [];
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
      await this.mostrarToast('Erro ao carregar documentos pendentes', 'danger');
    } finally {
      this.documentosCarregando = false;
    }
  }

  obterDocumentosPorCategoria(categoria: string): any[] {
    return this.documentosPendentes.filter(doc =>
      doc.categoria?.toLowerCase() === categoria.toLowerCase()
    );
  }

  obterIconeDocumento(categoria: string): string {
    return this.documentoService.obterIconeDocumento(categoria);
  }

  obterCorStatus(status: string): string {
    return this.documentoService.obterCorStatus(status);
  }

  handleFeatureClick(feature: any) {
    // Registrar o acesso
    this.funcionalidadesUsosService.registrarAcesso({
      chave: feature.id,
      nomeAmigavel: feature.name,
      icone: feature.icon,
      rota: feature.route
    });

    // Navegar para a funcionalidade
    if (feature.route) {
      this.router.navigateByUrl(feature.route);
    }
  }

  /**
   * Método para anexar documentos específicos
   */
  async anexarDocumento(documento: any) {
    const alert = await this.alertController.create({
      header: 'Anexar Documento',
      message: `Selecionar arquivo para: ${documento.nomeDocumento || documento}`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Selecionar Arquivo',
          handler: () => {
            this.selecionarArquivo(documento);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Seleciona arquivo para upload
   */
  private async selecionarArquivo(documento: any) {
    // Criar input file dinamicamente
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.style.display = 'none';

    input.onchange = async (event: any) => {
      const arquivo = event.target.files[0];
      if (arquivo) {
        await this.enviarArquivo(arquivo, documento);
      }
    };

    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  /**
   * Envia arquivo para o servidor
   */
  private async enviarArquivo(arquivo: File, documento: any) {
    // Validar arquivo
    const validacao = this.documentoService.validarArquivo(arquivo);
    if (!validacao.valido) {
      await this.mostrarToast(validacao.erro!, 'danger');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Enviando documento...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const idDocumento = documento.idDocumento || documento;
      const resultado = await this.documentoService.anexarDocumento(
        arquivo,
        idDocumento,
        this.usuarioLogado.idPessoa
      ).toPromise();

      await this.mostrarToast(`Documento ${arquivo.name} anexado com sucesso!`, 'success');
      await this.carregarDocumentosPendentes(); // Recarregar lista

    } catch (error: any) {
      console.error('Erro ao anexar documento:', error);
      const mensagem = error?.error?.erro || 'Erro ao anexar documento';
      await this.mostrarToast(mensagem, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Baixa documento anexado
   */
  async baixarDocumento(documento: any) {
    if (documento.status === 'pendente') {
      await this.mostrarToast('Documento ainda não foi anexado', 'warning');
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Baixando documento...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      const blob = await this.documentoService.baixarDocumento(documento.idDocumento).toPromise();

      if (!blob) {
        await this.mostrarToast('Erro ao baixar documento', 'danger');
        return;
      }

      // Criar link para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nomeArquivoOriginal || `documento_${documento.idDocumento}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      await this.mostrarToast('Download concluído!', 'success');

    } catch (error: any) {
      console.error('Erro ao baixar documento:', error);
      await this.mostrarToast('Erro ao baixar documento', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Remove documento anexado
   */
  async removerDocumento(documento: any) {
    if (documento.status === 'pendente') {
      await this.mostrarToast('Documento não foi anexado ainda', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Remover Documento',
      message: `Tem certeza que deseja remover o documento: ${documento.nomeDocumento}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          cssClass: 'danger',
          handler: async () => {
            await this.confirmarRemocao(documento);
          }
        }
      ]
    });

    await alert.present();
  }

  private async confirmarRemocao(documento: any) {
    const loading = await this.loadingController.create({
      message: 'Removendo documento...',
      spinner: 'crescent'
    });
    await loading.present();

    try {
      await this.documentoService.removerDocumento(
        documento.idDocumento,
        this.usuarioLogado.idPessoa
      ).toPromise();

      await this.mostrarToast('Documento removido com sucesso!', 'success');
      await this.carregarDocumentosPendentes(); // Recarregar lista

    } catch (error: any) {
      console.error('Erro ao remover documento:', error);
      const mensagem = error?.error?.erro || 'Erro ao remover documento';
      await this.mostrarToast(mensagem, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Mostra toast com mensagem
   */
  private async mostrarToast(message: string, color: string = 'medium') {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    toast.present();
  }

  /**
   * Retorna o nome amigável do documento
   */
  private getNomeDocumento(tipoDocumento: string): string {
    const documentos: { [key: string]: string } = {
      'rg_responsavel': 'RG do Responsável',
      'cpf_responsavel': 'CPF do Responsável',
      'renda_responsavel': 'Comprovante de Renda',
      'comprovante_residencia': 'Comprovante de Residência',
      'composicao_familiar': 'Declaração de Composição Familiar',
      'certidao_nascimento': 'Certidão de Nascimento',
      'historico_escolar': 'Histórico Escolar',
      'cartao_vacinacao': 'Cartão de Vacinação',
      'comprovante_baixa_renda': 'Comprovante de Baixa Renda',
      'vinculo_funcionario': 'Comprovante de Vínculo Empregatício'
    };

    return documentos[tipoDocumento] || tipoDocumento;
  }

  /**
   * Retorna o nome da cota para exibição
   */
  getTipoCotaDisplay(): string {
    switch (this.tipoCota) {
      case 'economica':
        return 'Econômica';
      case 'funcionario':
        return 'Funcionário';
      case 'livre':
        return 'Livre';
      default:
        return 'Não Definida';
    }
  }
}
