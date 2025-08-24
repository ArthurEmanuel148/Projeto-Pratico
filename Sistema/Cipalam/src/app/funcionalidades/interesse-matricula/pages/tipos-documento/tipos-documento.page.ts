import { Component, OnInit } from '@angular/core';
import { ModalController, AlertController, ToastController, LoadingController } from '@ionic/angular';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';

export interface TipoDocumento {
  idTipoDocumento?: number;
  nome: string;
  descricao?: string;
  obrigatorio: boolean;
  requerAssinatura: boolean;
  requerAnexo: boolean;
  tipoCota?: string;
  escopo: string;
  ativo: boolean;
  ordemExibicao: number;
  templateDocumento?: string;
}

@Component({
  selector: 'app-tipos-documento',
  templateUrl: './tipos-documento.page.html',
  styleUrls: ['./tipos-documento.page.scss'],
})
export class TiposDocumentoPage implements OnInit {
  tiposDocumento: TipoDocumento[] = [];
  carregando = true;
  searchTerm = '';

  tiposCota = [
    { value: null, label: 'Todas as cotas' },
    { value: 'livre', label: 'Ampla Concorrência' },
    { value: 'economica', label: 'Econômica' },
    { value: 'funcionario', label: 'Funcionário' }
  ];

  escopos = [
    { value: 'familia', label: 'Família' },
    { value: 'aluno', label: 'Aluno' },
    { value: 'ambos', label: 'Ambos' }
  ];

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private interesseService: InteresseMatriculaService
  ) { }

  ngOnInit() {
    this.carregarTiposDocumento();
  }

  async carregarTiposDocumento() {
    this.carregando = true;
    try {
      this.interesseService.getTiposDocumento().subscribe({
        next: (tipos) => {
          this.tiposDocumento = tipos;
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao carregar tipos de documento:', error);
          this.carregando = false;
          this.showToast('Erro ao carregar tipos de documento', 'danger');
        }
      });
    } catch (error) {
      console.error('Erro geral:', error);
      this.carregando = false;
    }
  }

  get tiposFiltrados() {
    if (!this.searchTerm) return this.tiposDocumento;

    return this.tiposDocumento.filter(tipo =>
      tipo.nome.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
      (tipo.descricao && tipo.descricao.toLowerCase().includes(this.searchTerm.toLowerCase()))
    );
  }

  async novoTipoDocumento() {
    const alert = await this.alertCtrl.create({
      header: 'Novo Tipo de Documento',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          placeholder: 'Nome do documento'
        },
        {
          name: 'descricao',
          type: 'textarea',
          placeholder: 'Descrição (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Criar',
          handler: (data) => {
            if (data.nome && data.nome.trim()) {
              this.criarTipoDocumento(data);
              return true;
            } else {
              this.showToast('Nome é obrigatório', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async criarTipoDocumento(data: any) {
    const loading = await this.loadingCtrl.create({
      message: 'Criando tipo de documento...'
    });
    await loading.present();

    const novoTipo: TipoDocumento = {
      nome: data.nome.trim(),
      descricao: data.descricao?.trim() || '',
      obrigatorio: true,
      requerAssinatura: false,
      requerAnexo: true,
      tipoCota: undefined,
      escopo: 'ambos',
      ativo: true,
      ordemExibicao: this.tiposDocumento.length + 1
    };

    try {
      // Chama a API para criar
      this.interesseService.criarTipoDocumento(novoTipo).subscribe({
        next: (tipoCreado) => {
          this.tiposDocumento.push(tipoCreado);
          this.showToast('Tipo de documento criado com sucesso!', 'success');
          loading.dismiss();
        },
        error: (error) => {
          console.error('Erro ao criar tipo:', error);
          this.showToast('Erro ao criar tipo de documento', 'danger');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Erro geral:', error);
      this.showToast('Erro ao criar tipo de documento', 'danger');
      loading.dismiss();
    }
  }

  async editarTipoDocumento(tipo: TipoDocumento) {
    const alert = await this.alertCtrl.create({
      header: 'Editar Tipo de Documento',
      inputs: [
        {
          name: 'nome',
          type: 'text',
          value: tipo.nome,
          placeholder: 'Nome do documento'
        },
        {
          name: 'descricao',
          type: 'textarea',
          value: tipo.descricao || '',
          placeholder: 'Descrição (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: (data) => {
            if (data.nome && data.nome.trim()) {
              this.atualizarTipoDocumento(tipo.idTipoDocumento!, {
                ...tipo,
                nome: data.nome.trim(),
                descricao: data.descricao?.trim() || ''
              });
              return true;
            } else {
              this.showToast('Nome é obrigatório', 'warning');
              return false;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async atualizarTipoDocumento(id: number, tipoAtualizado: TipoDocumento) {
    const loading = await this.loadingCtrl.create({
      message: 'Atualizando tipo de documento...'
    });
    await loading.present();

    try {
      this.interesseService.atualizarTipoDocumento(id, tipoAtualizado).subscribe({
        next: (tipoAtualizadoResponse) => {
          const index = this.tiposDocumento.findIndex(t => t.idTipoDocumento === id);
          if (index >= 0) {
            this.tiposDocumento[index] = tipoAtualizadoResponse;
          }
          this.showToast('Tipo de documento atualizado com sucesso!', 'success');
          loading.dismiss();
        },
        error: (error) => {
          console.error('Erro ao atualizar tipo:', error);
          this.showToast('Erro ao atualizar tipo de documento', 'danger');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Erro geral:', error);
      this.showToast('Erro ao atualizar tipo de documento', 'danger');
      loading.dismiss();
    }
  }

  async confirmarExclusao(tipo: TipoDocumento) {
    const alert = await this.alertCtrl.create({
      header: 'Confirmar Exclusão',
      message: `Tem certeza que deseja excluir o tipo "${tipo.nome}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => {
            this.excluirTipoDocumento(tipo);
          }
        }
      ]
    });

    await alert.present();
  }

  async excluirTipoDocumento(tipo: TipoDocumento) {
    const loading = await this.loadingCtrl.create({
      message: 'Excluindo tipo de documento...'
    });
    await loading.present();

    try {
      this.interesseService.excluirTipoDocumento(tipo.idTipoDocumento!).subscribe({
        next: () => {
          this.tiposDocumento = this.tiposDocumento.filter(t => t.idTipoDocumento !== tipo.idTipoDocumento);
          this.showToast('Tipo de documento excluído com sucesso!', 'success');
          loading.dismiss();
        },
        error: (error) => {
          console.error('Erro ao excluir tipo:', error);
          this.showToast('Erro ao excluir tipo de documento', 'danger');
          loading.dismiss();
        }
      });
    } catch (error) {
      console.error('Erro geral:', error);
      this.showToast('Erro ao excluir tipo de documento', 'danger');
      loading.dismiss();
    }
  }

  async toggleAtivo(tipo: TipoDocumento) {
    const novoStatus = !tipo.ativo;
    await this.atualizarTipoDocumento(tipo.idTipoDocumento!, {
      ...tipo,
      ativo: novoStatus
    });
  }

  getTipoCotaLabel(tipoCota: string | null): string {
    if (!tipoCota) return 'Todas';
    const encontrado = this.tiposCota.find(t => t.value === tipoCota);
    return encontrado ? encontrado.label : tipoCota;
  }

  getEscopoLabel(escopo: string): string {
    const encontrado = this.escopos.find(e => e.value === escopo);
    return encontrado ? encontrado.label : escopo;
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastCtrl.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
