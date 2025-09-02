import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ModalController, AlertController, ToastController } from '@ionic/angular';
import { DocumentoService } from '../../core/services/documento.service';

@Component({
  selector: 'app-gerenciamento-documentos',
  templateUrl: './gerenciamento-documentos.page.html',
  styleUrls: ['./gerenciamento-documentos.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class GerenciamentoDocumentosPage implements OnInit {
  documentosParaAprovacao: any[] = [];
  tiposDocumento: any[] = [];
  configuracaoDocumentos: any = {
    livre: {},
    economica: {},
    funcionario: {}
  };
  cotaAtiva = 'livre';

  isLoading = false;
  currentTab = 'aprovacao';

  filtros = {
    status: 'todos',
    tipoCota: 'todos',
    busca: ''
  };

  documentosFiltrados: any[] = [];

  // CRUD Tipos de Documento
  tipoDocumentoForm = {
    id: null,
    nome: '',
    categoria: 'responsavel',
    obrigatorio: true,
    descricao: '',
    tipoCota: null,
    ativo: true
  };

  constructor(
    private documentoService: DocumentoService,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    this.isLoading = true;
    try {
      await Promise.all([
        this.carregarDocumentosParaAprovacao(),
        this.carregarTiposDocumento(),
        this.carregarConfiguracaoDocumentos()
      ]);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      await this.mostrarToast('Erro ao carregar dados', 'danger');
    } finally {
      this.isLoading = false;
    }
  }

  async carregarDocumentosParaAprovacao() {
    try {
      this.documentosParaAprovacao = await this.documentoService.listarDocumentosParaAprovacao().toPromise() || [];
      this.aplicarFiltros();
    } catch (error) {
      console.error('Erro ao carregar documentos para aprovação:', error);
    }
  }

  async carregarTiposDocumento() {
    try {
      this.tiposDocumento = await this.documentoService.listarTiposDocumento().toPromise() || [];
    } catch (error) {
      console.error('Erro ao carregar tipos de documento:', error);
      // Fallback para dados simulados em caso de erro
      this.tiposDocumento = [
        { id: 1, nome: 'RG do Responsável', categoria: 'responsavel', obrigatorio: true, ativo: true },
        { id: 2, nome: 'CPF do Responsável', categoria: 'responsavel', obrigatorio: true, ativo: true },
        { id: 3, nome: 'Comprovante de Renda', categoria: 'familia', obrigatorio: false, ativo: true },
        { id: 4, nome: 'Comprovante de Endereço', categoria: 'familia', obrigatorio: false, ativo: true },
        { id: 5, nome: 'Certidão de Nascimento do Aluno', categoria: 'aluno', obrigatorio: true, ativo: true }
      ];
    }
  }

  async carregarConfiguracaoDocumentos() {
    try {
      // Inicializar configurações com base nos tipos de documento existentes
      this.configuracaoDocumentos = {
        livre: {},
        economica: {},
        funcionario: {}
      };

      // Carregar configuração salva do backend (simulado por enquanto)
      // TODO: Implementar endpoint para carregar configuração salva
      this.tiposDocumento.forEach(tipo => {
        // Por padrão, documentos obrigatórios ficam marcados para todas as cotas
        this.configuracaoDocumentos.livre[tipo.idTipoDocumento] = tipo.obrigatorio;
        this.configuracaoDocumentos.economica[tipo.idTipoDocumento] = tipo.obrigatorio;
        this.configuracaoDocumentos.funcionario[tipo.idTipoDocumento] = tipo.obrigatorio;
      });
    } catch (error) {
      console.error('Erro ao carregar configuração de documentos:', error);
    }
  }

  onCotaChange() {
    // Método chamado quando muda a aba de cota
    console.log('Cota ativa:', this.cotaAtiva);
  }

  getCotaNome(cota: string): string {
    switch (cota) {
      case 'livre': return 'Ampla Concorrência';
      case 'economica': return 'Cota Econômica';
      case 'funcionario': return 'Cota Funcionário';
      default: return cota;
    }
  }

  async salvarConfiguracaoCota() {
    try {
      // TODO: Implementar endpoint para salvar configuração
      console.log('Salvando configuração:', this.configuracaoDocumentos);
      await this.mostrarToast(`Configuração da cota ${this.getCotaNome(this.cotaAtiva)} salva!`, 'success');
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      await this.mostrarToast('Erro ao salvar configuração', 'danger');
    }
  }

  // Filtros para documentos para aprovação
  aplicarFiltros() {
    let documentos = [...this.documentosParaAprovacao];

    if (this.filtros.status !== 'todos') {
      documentos = documentos.filter(doc => doc.status === this.filtros.status);
    }

    if (this.filtros.tipoCota !== 'todos') {
      documentos = documentos.filter(doc => doc.tipoCota === this.filtros.tipoCota);
    }

    if (this.filtros.busca.trim()) {
      const busca = this.filtros.busca.toLowerCase();
      documentos = documentos.filter(doc =>
        doc.nomeResponsavel?.toLowerCase().includes(busca) ||
        doc.cpfResponsavel?.includes(busca) ||
        doc.protocolo?.toLowerCase().includes(busca) ||
        doc.nomeDocumento?.toLowerCase().includes(busca)
      );
    }

    this.documentosFiltrados = documentos;
  }

  // Ações para documentos
  async aprovarDocumento(documento: any) {
    const alert = await this.alertController.create({
      header: 'Aprovar Documento',
      message: `Deseja aprovar o documento "${documento.nomeDocumento}" de ${documento.nomeResponsavel}?`,
      inputs: [
        {
          name: 'observacoes',
          type: 'textarea',
          placeholder: 'Observações (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aprovar',
          handler: async (data: any) => {
            try {
              await this.documentoService.aprovarDocumento(documento.idDocumento, 1, data.observacoes).toPromise();
              await this.mostrarToast('Documento aprovado com sucesso!', 'success');
              await this.carregarDocumentosParaAprovacao();
            } catch (error) {
              console.error('Erro ao aprovar documento:', error);
              await this.mostrarToast('Erro ao aprovar documento', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async rejeitarDocumento(documento: any) {
    const alert = await this.alertController.create({
      header: 'Rejeitar Documento',
      message: `Deseja rejeitar o documento "${documento.nomeDocumento}" de ${documento.nomeResponsavel}?`,
      inputs: [
        {
          name: 'motivoRejeicao',
          type: 'textarea',
          placeholder: 'Motivo da rejeição (obrigatório)',
          attributes: {
            required: true
          }
        },
        {
          name: 'observacoes',
          type: 'textarea',
          placeholder: 'Observações adicionais (opcional)'
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rejeitar',
          handler: async (data: any) => {
            if (!data.motivoRejeicao?.trim()) {
              await this.mostrarToast('Motivo da rejeição é obrigatório', 'warning');
              return false;
            }

            try {
              await this.documentoService.rejeitarDocumento(documento.idDocumento, 1, data.motivoRejeicao, data.observacoes).toPromise();
              await this.mostrarToast('Documento rejeitado', 'success');
              await this.carregarDocumentosParaAprovacao();
            } catch (error) {
              console.error('Erro ao rejeitar documento:', error);
              await this.mostrarToast('Erro ao rejeitar documento', 'danger');
            }
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  // CRUD Tipos de Documento
  abrirFormularioTipoDocumento(tipo?: any) {
    if (tipo) {
      this.tipoDocumentoForm = { ...tipo };
    } else {
      this.tipoDocumentoForm = {
        id: null,
        nome: '',
        categoria: 'responsavel',
        obrigatorio: true,
        descricao: '',
        tipoCota: null,
        ativo: true
      };
    }
  }

  async salvarTipoDocumento() {
    if (!this.tipoDocumentoForm.nome.trim()) {
      await this.mostrarToast('Nome do documento é obrigatório', 'warning');
      return;
    }

    try {
      if (this.tipoDocumentoForm.id) {
        // Atualizar via API
        const tipoAtualizado = await this.documentoService.atualizarTipoDocumento(
          this.tipoDocumentoForm.id,
          this.tipoDocumentoForm
        ).toPromise();

        // Atualizar na lista local
        const index = this.tiposDocumento.findIndex(t => t.id === this.tipoDocumentoForm.id);
        if (index >= 0) {
          this.tiposDocumento[index] = tipoAtualizado;
        }
        await this.mostrarToast('Tipo de documento atualizado!', 'success');
      } else {
        // Criar novo via API
        const novoTipo = await this.documentoService.criarTipoDocumento(this.tipoDocumentoForm).toPromise();
        this.tiposDocumento.push(novoTipo);
        await this.mostrarToast('Tipo de documento criado!', 'success');
      }

      // Limpar formulário
      this.tipoDocumentoForm = {
        id: null,
        nome: '',
        categoria: 'responsavel',
        obrigatorio: true,
        descricao: '',
        tipoCota: null,
        ativo: true
      };
    } catch (error) {
      console.error('Erro ao salvar tipo de documento:', error);
      await this.mostrarToast('Erro ao salvar tipo de documento', 'danger');
    }
  }

  editarTipoDocumento(tipo: any) {
    this.tipoDocumentoForm = { ...tipo };
  }

  async excluirTipoDocumento(tipo: any) {
    const alert = await this.alertController.create({
      header: 'Excluir Tipo de Documento',
      message: `Deseja excluir o tipo de documento "${tipo.nome}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Excluir',
          handler: async () => {
            try {
              await this.documentoService.excluirTipoDocumento(tipo.id).toPromise();
              const index = this.tiposDocumento.findIndex(t => t.id === tipo.id);
              if (index >= 0) {
                this.tiposDocumento.splice(index, 1);
              }
              await this.mostrarToast('Tipo de documento excluído', 'success');
            } catch (error) {
              console.error('Erro ao excluir tipo de documento:', error);
              await this.mostrarToast('Erro ao excluir tipo de documento', 'danger');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  // Utilitários
  async mostrarToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }

  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendente': return 'warning';
      case 'enviado': return 'primary';
      case 'aprovado': return 'success';
      case 'rejeitado': return 'danger';
      default: return 'medium';
    }
  }

  getCategoriaIcon(categoria: string): string {
    switch (categoria?.toLowerCase()) {
      case 'responsavel': return 'person';
      case 'familia': return 'home';
      case 'aluno': return 'school';
      default: return 'document';
    }
  }
}
