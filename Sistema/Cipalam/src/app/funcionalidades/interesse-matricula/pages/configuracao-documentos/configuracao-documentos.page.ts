import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { DocumentosCotaSelectorComponent } from '../../components/documentos-cota-selector/documentos-cota-selector.component';
import { TipoDocumento } from '../../../gerenciamento-tipos-documentos/models/tipo-documento.interface';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';

const TIPOS_COTA = [
  { chave: 'funcionario', nome: 'Funcionário' },
  { chave: 'economica', nome: 'Econômica' },
  { chave: 'livre', nome: 'Ampla Concorrência' }
];

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
  todosDocumentos: TipoDocumento[] = [];
  carregando = true;

  constructor(
    private modalCtrl: ModalController,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private interesseService: InteresseMatriculaService,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    this.carregando = true;

    try {
      // Primeiro carrega tipos de documento disponíveis
      this.interesseService.getTiposDocumento().subscribe({
        next: (documentos: TipoDocumento[]) => {
          console.log('Documentos carregados do backend:', documentos);
          this.todosDocumentos = documentos;

          // Depois carrega configuração existente do banco de dados
          this.interesseService.getConfiguracaoDocumentos().subscribe({
            next: (configuracao) => {
              console.log('Configuração carregada do backend:', configuracao);

              // Converte as chaves para minúsculas para compatibilidade
              this.documentosPorCota = {
                funcionario: configuracao['FUNCIONARIO'] || [],
                economica: configuracao['ECONOMICA'] || [],
                livre: configuracao['LIVRE'] || []
              };

              console.log('Documentos por cota após carregamento:', this.documentosPorCota);
              this.carregando = false;
            },
            error: (error) => {
              console.error('Erro ao carregar configuração:', error);
              // Inicializa com arrays vazios se não conseguir carregar
              this.documentosPorCota = {
                funcionario: [],
                economica: [],
                livre: []
              };
              this.carregando = false;
            }
          });
        },
        error: (error: any) => {
          console.error('Erro ao carregar tipos de documento:', error);
          this.todosDocumentos = [];
          this.carregando = false;
        }
      });
    } catch (error) {
      console.error('Erro geral ao carregar dados:', error);
      this.carregando = false;
    }
  }

  async abrirSelecaoDocumentos(cota: any) {
    console.log('Abrindo seleção para cota:', cota);
    console.log('Todos os documentos disponíveis:', this.todosDocumentos);
    console.log('Documentos da cota:', this.documentosPorCota[cota.chave]);

    const modal = await this.modalCtrl.create({
      component: DocumentosCotaSelectorComponent,
      componentProps: {
        chaveCota: cota.chave,
        nomeCota: cota.nome,
        documentosDisponiveis: this.todosDocumentos, // ✅ Passar todos os documentos disponíveis
        documentosSelecionados: this.documentosPorCota[cota.chave] || [] // ✅ Usar IDs diretos do banco
      }
    });

    modal.onDidDismiss().then((result) => {
      console.log('Modal fechado com resultado:', result);
      console.log('Role:', result?.role);
      console.log('Data:', result?.data);

      if (result?.role === 'confirmar') {
        console.log('Documentos foram salvos, aguardando e recarregando configurações');
        // Aguardar um pouco para garantir que o backend processou
        setTimeout(() => {
          this.recarregarConfiguracoes();
        }, 500);
      }
    });

    return await modal.present();
  }

  recarregarConfiguracoes() {
    console.log('=== RECARREGANDO CONFIGURAÇÕES ===');

    // Recarrega apenas a configuração, sem recarregar documentos disponíveis
    this.interesseService.getConfiguracaoDocumentos().subscribe({
      next: (configuracao) => {
        console.log('Configuração recarregada do banco:', configuracao);

        // Converte as chaves para minúsculas para compatibilidade
        this.documentosPorCota = {
          funcionario: configuracao['FUNCIONARIO'] || [],
          economica: configuracao['ECONOMICA'] || [],
          livre: configuracao['LIVRE'] || []
        };

        console.log('Documentos por cota após recarregamento:', this.documentosPorCota);

        // Forçar detecção de mudanças na interface
        this.cdr.detectChanges();

        console.log('Interface atualizada após recarregamento');
      },
      error: (error) => {
        console.error('Erro ao recarregar configuração:', error);
      }
    });
  }

  getDocumentosNomes(chave: string): string {
    const documentos = this.documentosPorCota[chave] || [];
    if (documentos.length === 0) return 'Nenhum documento configurado';

    const nomes = documentos.map(docId => {
      const doc = this.todosDocumentos && this.todosDocumentos.find ? this.todosDocumentos.find(d => d.idTipoDocumento === docId) : null;
      return doc ? doc.nome : `Documento ${docId}`;
    });

    return nomes.length > 2
      ? `${nomes.slice(0, 2).join(', ')} e mais ${nomes.length - 2}...`
      : nomes.join(', ');
  }
}
