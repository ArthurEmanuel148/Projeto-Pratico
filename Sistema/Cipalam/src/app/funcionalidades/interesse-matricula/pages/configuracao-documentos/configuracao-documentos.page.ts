import { Component, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { DocumentosCotaSelectorComponent } from '../../components/documentos-cota-selector/documentos-cota-selector.component';
import { DocumentoMatricula } from '../../models/documento-matricula.interface';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';

const TIPOS_COTA = [
  { chave: 'funcionario', nome: 'Funcionário' },
  { chave: 'economica', nome: 'Econômica' },
  { chave: 'livre', nome: 'Ampla Concorrência' }
];

const TODOS_DOCUMENTOS: DocumentoMatricula[] = [
  { id: 'rg', nome: 'RG do Responsável', obrigatorio: true, tipo: 'documento' },
  { id: 'cpf', nome: 'CPF do Responsável', obrigatorio: true, tipo: 'documento' },
  { id: 'comprovanteRenda', nome: 'Comprovante de Renda', obrigatorio: false, tipo: 'comprovante' },
  { id: 'comprovanteEndereco', nome: 'Comprovante de Endereço', obrigatorio: false, tipo: 'comprovante' },
  // ...adicione outros documentos se necessário
];

@Component({
  selector: 'app-configuracao-documentos',
  templateUrl: './configuracao-documentos.page.html',
  styleUrls: ['./configuracao-documentos.page.scss'],
  standalone: false
})
export class ConfiguracaoDocumentosPage implements OnInit {
  tiposCota = TIPOS_COTA;
  documentosPorCota: Record<string, string[]> = {
    funcionario: [],
    economica: [],
    livre: []
  };
  todosDocumentos: DocumentoMatricula[] = [];
  carregando = true;
  salvando = false;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private interesseService: InteresseMatriculaService
  ) {}

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    this.carregando = true;

    try {
      // Carrega tipos de documento disponíveis
      this.interesseService.getTiposDocumento().subscribe({
        next: (documentos: any[]) => {
          this.todosDocumentos = documentos;
        },
        error: (error: any) => {
          console.error('Erro ao carregar tipos de documento:', error);
          this.todosDocumentos = TODOS_DOCUMENTOS;
        }
      });

      // Carrega configuração existente
      this.interesseService.getConfiguracaoDocumentos().subscribe({
        next: (configuracao) => {
          this.documentosPorCota = configuracao;
          this.carregando = false;
        },
        error: (error) => {
          console.error('Erro ao carregar configuração:', error);
          this.carregando = false;
        }
      });
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      this.carregando = false;
    }
  }

  async abrirSelecaoDocumentos(cota: any) {
    const modal = await this.modalCtrl.create({
      component: DocumentosCotaSelectorComponent,
      componentProps: {
        documentosDisponiveis: this.todosDocumentos,
        documentosSelecionados: this.documentosPorCota[cota.chave],
        nomeCota: cota.nome
      }
    });

    await modal.present();
    const { data, role } = await modal.onWillDismiss();
    if (role === 'confirmar' && data) {
      this.documentosPorCota[cota.chave] = data;
    }
  }

  async salvarConfiguracao() {
    if (this.salvando) return;

    this.salvando = true;
    const loading = await this.loadingCtrl.create({
      message: 'Salvando configuração...'
    });
    await loading.present();

    try {
      this.interesseService.salvarConfiguracaoDocumentos(this.documentosPorCota).subscribe({
        next: async (response) => {
          await loading.dismiss();
          this.salvando = false;

          const toast = await this.toastCtrl.create({
            message: 'Configuração salva com sucesso!',
            duration: 3000,
            color: 'success',
            position: 'top'
          });
          await toast.present();
        },
        error: async (error) => {
          await loading.dismiss();
          this.salvando = false;

          const toast = await this.toastCtrl.create({
            message: 'Erro ao salvar configuração. Tente novamente.',
            duration: 4000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();

          console.error('Erro ao salvar:', error);
        }
      });
    } catch (error) {
      await loading.dismiss();
      this.salvando = false;
      console.error('Erro geral ao salvar:', error);
    }
  }

  getDocumentosNomes(chave: string): string {
    const documentos = this.documentosPorCota[chave] || [];
    if (documentos.length === 0) return 'Nenhum documento configurado';

    const nomes = documentos.map(docId => {
      const doc = this.todosDocumentos.find(d => d.id === docId);
      return doc ? doc.nome : docId;
    });

    return nomes.length > 2
      ? `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}...`
      : nomes.join(', ');
  }
}
