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

// Remover documentos hardcoded - serão carregados da API
// const TODOS_DOCUMENTOS: DocumentoMatricula[] = [...];

@Component({
  selector: 'app-configuracao-documentos',
  templateUrl: './configuracao-documentos.page.html',
  styleUrls: ['./configuracao-documentos.page.scss'],
  standalone: false
})
export class ConfiguracaoDocumentosPage implements OnInit {
  tiposCota = TIPOS_COTA;
  documentosPorCota: Record<string, number[]> = {
    funcionario: [],
    economica: [],
    livre: []
  };
  todosDocumentos: any[] = []; // Mudado para aceitar os tipos de documento reais
  carregando = true;
  salvando = false;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private interesseService: InteresseMatriculaService
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    try {
      this.carregando = true;

      // Carregar tipos de documentos reais da API
      this.interesseService.getTiposDocumento().subscribe({
        next: (tiposDocumento) => {
          this.todosDocumentos = tiposDocumento;

          // Carregar configuração existente
          this.interesseService.getConfiguracaoDocumentos().subscribe({
            next: (configuracao) => {
              // A configuração já vem com number[] do backend
              this.documentosPorCota = configuracao;
              this.carregando = false;
            },
            error: (error) => {
              console.error('Erro ao carregar configuração:', error);
              this.carregando = false;
            }
          });
        },
        error: (error) => {
          console.error('Erro ao carregar tipos de documento:', error);
          // Fallback para documentos padrão se a API falhar
          this.todosDocumentos = [
            { idTipoDocumento: 1, nome: 'RG do Responsável', obrigatorio: true },
            { idTipoDocumento: 2, nome: 'CPF do Responsável', obrigatorio: true },
            { idTipoDocumento: 3, nome: 'Comprovante de Renda', obrigatorio: false },
            { idTipoDocumento: 4, nome: 'Comprovante de Endereço', obrigatorio: false }
          ];
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
      const doc = this.todosDocumentos.find(d => d.idTipoDocumento === docId);
      return doc ? doc.nome : `ID ${docId}`;
    });

    return nomes.length > 2
      ? `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}...`
      : nomes.join(', ');
  }
}
