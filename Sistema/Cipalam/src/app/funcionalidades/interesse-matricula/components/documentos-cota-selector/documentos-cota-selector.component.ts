import { Component, Input, OnInit } from '@angular/core';
import { ModalController, LoadingController, ToastController } from '@ionic/angular';
import { TipoDocumento } from '../../../gerenciamento-tipos-documentos/models/tipo-documento.interface';
import { FormBuilder, FormGroup } from '@angular/forms';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';

@Component({
  selector: 'app-documentos-cota-selector',
  templateUrl: './documentos-cota-selector.component.html',
  styleUrls: ['./documentos-cota-selector.component.scss'],
  standalone: false
})
export class DocumentosCotaSelectorComponent implements OnInit {
  @Input() documentosDisponiveis: TipoDocumento[] = [];
  @Input() documentosSelecionados: number[] = [];
  @Input() nomeCota: string = '';
  @Input() chaveCota: string = ''; // Para saber qual cota salvar

  form!: FormGroup;
  Array = Array;
  salvando = false;

  constructor(
    private modalCtrl: ModalController,
    private fb: FormBuilder,
    private loadingCtrl: LoadingController,
    private toastCtrl: ToastController,
    private interesseService: InteresseMatriculaService
  ) { }

  ngOnInit() {
    const group: any = {};

    // Verificação de segurança para evitar erro se documentosDisponiveis for undefined
    if (this.documentosDisponiveis && Array.isArray(this.documentosDisponiveis)) {
      this.documentosDisponiveis.forEach((doc) => {
        const docId = doc.idTipoDocumento;
        if (docId) {
          // Garantir que estamos comparando números com números
          const estaSelecionado = this.documentosSelecionados &&
            this.documentosSelecionados.some(selectedId => Number(selectedId) === Number(docId));

          group[`doc_${docId}`] = [estaSelecionado];
        }
      });
    }

    this.form = this.fb.group(group);
  }

  async confirmar() {
    if (this.salvando) return;

    console.log('=== INÍCIO DO SALVAMENTO ===');
    console.log('Cota:', this.chaveCota, this.nomeCota);
    console.log('Form value:', this.form.value);

    this.salvando = true;
    const loading = await this.loadingCtrl.create({
      message: 'Salvando configuração...'
    });
    await loading.present();

    try {
      // Obter documentos selecionados do formulário
      const selecionados = Object.entries(this.form.value)
        .filter(([_, ativo]) => ativo)
        .map(([id]) => parseInt(id.replace('doc_', ''), 10));

      console.log('Documentos selecionados:', selecionados);

      // Buscar configuração atual e atualizar apenas a cota específica
      this.interesseService.getConfiguracaoDocumentos().subscribe({
        next: async (configuracaoAtual) => {
          console.log('Configuração atual do banco:', configuracaoAtual);

          // Preparar configuração atualizada mantendo as outras cotas
          const configuracaoAtualizada = {
            FUNCIONARIO: configuracaoAtual['FUNCIONARIO'] || [],
            ECONOMICA: configuracaoAtual['ECONOMICA'] || [],
            LIVRE: configuracaoAtual['LIVRE'] || []
          };

          // Atualizar apenas a cota específica
          const chaveBackend = this.chaveCota.toUpperCase();
          console.log('Chave backend:', chaveBackend);

          if (chaveBackend === 'FUNCIONARIO') {
            configuracaoAtualizada.FUNCIONARIO = selecionados;
          } else if (chaveBackend === 'ECONOMICA') {
            configuracaoAtualizada.ECONOMICA = selecionados;
          } else if (chaveBackend === 'LIVRE') {
            configuracaoAtualizada.LIVRE = selecionados;
          }

          console.log('Configuração que será enviada:', configuracaoAtualizada);

          // Salvar no banco
          this.interesseService.salvarConfiguracaoDocumentos(configuracaoAtualizada).subscribe({
            next: async (response) => {
              console.log('=== SUCESSO NO SALVAMENTO ===');
              console.log('Resposta do backend:', response);
              await loading.dismiss();
              this.salvando = false;

              const toast = await this.toastCtrl.create({
                message: `Configuração da ${this.nomeCota} salva com sucesso!`,
                duration: 3000,
                color: 'success',
                position: 'top'
              });
              await toast.present();

              // Fechar modal e retornar os dados atualizados
              this.modalCtrl.dismiss(selecionados, 'confirmar');
            },
            error: async (error) => {
              console.log('=== ERRO NO SALVAMENTO ===');
              console.error('Erro completo:', error);
              console.error('Status:', error.status);
              console.error('Mensagem:', error.message);
              console.error('Body:', error.error);

              await loading.dismiss();
              this.salvando = false;

              const toast = await this.toastCtrl.create({
                message: 'Erro ao salvar configuração. Tente novamente.',
                duration: 4000,
                color: 'danger',
                position: 'top'
              });
              await toast.present();
            }
          });
        },
        error: async (error) => {
          console.log('=== ERRO AO CARREGAR CONFIGURAÇÃO ===');
          console.error('Erro ao carregar configuração:', error);

          await loading.dismiss();
          this.salvando = false;

          const toast = await this.toastCtrl.create({
            message: 'Erro ao carregar configuração atual. Tente novamente.',
            duration: 4000,
            color: 'danger',
            position: 'top'
          });
          await toast.present();
        }
      });
    } catch (error) {
      console.log('=== ERRO GERAL ===');
      console.error('Erro geral:', error);
      await loading.dismiss();
      this.salvando = false;
    }
  }

  cancelar() {
    this.modalCtrl.dismiss(null, 'cancelar');
  }
}
