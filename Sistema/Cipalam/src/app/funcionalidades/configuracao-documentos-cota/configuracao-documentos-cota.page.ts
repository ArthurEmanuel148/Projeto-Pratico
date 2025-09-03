import { Component, OnInit } from '@angular/core';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { TipoDocumentoService } from '../../core/services/tipo-documento.service';
import { ConfiguracaoDocumentosCotaService } from './services/configuracao-documentos-cota.service';
import { TipoDocumento } from '../../core/models/tipo-documento.interface';
import { 
  ConfiguracaoDocumentosCota, 
  TipoCota,
  ConfiguracaoDocumentosCotaRequest 
} from './models/configuracao-documentos-cota.interface';

@Component({
  selector: 'app-configuracao-documentos-cota',
  templateUrl: './configuracao-documentos-cota.page.html',
  styleUrls: ['./configuracao-documentos-cota.page.scss'],
  standalone: false
})
export class ConfiguracaoDocumentosCotaPage implements OnInit {
  
  tiposDocumentos: TipoDocumento[] = [];
  configuracoes: ConfiguracaoDocumentosCota[] = [];
  loading = false;

  // Configurações por tipo de cota
  cotaLivre: number[] = [];
  cotaEconomica: number[] = [];
  cotaFuncionario: number[] = [];

  // Enum para template
  TipoCota = TipoCota;
  Array = Array;

  constructor(
    private tipoDocumentoService: TipoDocumentoService,
    private configuracaoService: ConfiguracaoDocumentosCotaService,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    console.log('ConfiguracaoDocumentosCotaPage - ngOnInit iniciado');
    this.carregarDados();
  }

  async carregarDados() {
    this.loading = true;
    const loading = await this.loadingController.create({
      message: 'Carregando configurações...'
    });
    await loading.present();

    try {
      // Carregar tipos de documentos
      const tiposResponse = await this.tipoDocumentoService.listarTiposDocumentos(0, 100).toPromise();
      console.log('Resposta da API tipos documentos:', tiposResponse);
      this.tiposDocumentos = tiposResponse?.content || [];
      console.log('Tipos documentos processados:', this.tiposDocumentos);
      console.log('É array?', Array.isArray(this.tiposDocumentos));
      console.log('Length:', this.tiposDocumentos.length);

      // Carregar configurações existentes
      const configResponse = await this.configuracaoService.listarConfiguracoesFrontend().toPromise();
      console.log('Resposta configurações:', configResponse);
      
      if (configResponse) {
        this.cotaLivre = configResponse['LIVRE'] || [];
        this.cotaEconomica = configResponse['ECONOMICA'] || [];
        this.cotaFuncionario = configResponse['FUNCIONARIO'] || [];
      }

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      await this.showToast('Erro ao carregar dados', 'danger');
    } finally {
      this.loading = false;
      await loading.dismiss();
      console.log('Carregamento finalizado. Total de documentos:', this.tiposDocumentos.length);
    }
  }

  isDocumentoSelecionado(tipoDocumento: TipoDocumento, tipoCota: TipoCota): boolean {
    switch (tipoCota) {
      case TipoCota.LIVRE:
        return this.cotaLivre.includes(tipoDocumento.idTipoDocumento!);
      case TipoCota.ECONOMICA:
        return this.cotaEconomica.includes(tipoDocumento.idTipoDocumento!);
      case TipoCota.FUNCIONARIO:
        return this.cotaFuncionario.includes(tipoDocumento.idTipoDocumento!);
      default:
        return false;
    }
  }

  toggleDocumento(tipoDocumento: TipoDocumento, tipoCota: TipoCota) {
    const documentoId = tipoDocumento.idTipoDocumento!;
    
    switch (tipoCota) {
      case TipoCota.LIVRE:
        if (this.cotaLivre.includes(documentoId)) {
          this.cotaLivre = this.cotaLivre.filter(id => id !== documentoId);
        } else {
          this.cotaLivre.push(documentoId);
        }
        break;
      case TipoCota.ECONOMICA:
        if (this.cotaEconomica.includes(documentoId)) {
          this.cotaEconomica = this.cotaEconomica.filter(id => id !== documentoId);
        } else {
          this.cotaEconomica.push(documentoId);
        }
        break;
      case TipoCota.FUNCIONARIO:
        if (this.cotaFuncionario.includes(documentoId)) {
          this.cotaFuncionario = this.cotaFuncionario.filter(id => id !== documentoId);
        } else {
          this.cotaFuncionario.push(documentoId);
        }
        break;
    }
  }

  async salvarConfiguracao(tipoCota: TipoCota) {
    const loading = await this.loadingController.create({
      message: 'Salvando configuração...'
    });
    await loading.present();

    try {
      let documentos: number[] = [];
      
      switch (tipoCota) {
        case TipoCota.LIVRE:
          documentos = [...this.cotaLivre];
          break;
        case TipoCota.ECONOMICA:
          documentos = [...this.cotaEconomica];
          break;
        case TipoCota.FUNCIONARIO:
          documentos = [...this.cotaFuncionario];
          break;
      }

      const request: ConfiguracaoDocumentosCotaRequest = {
        tipoCota: tipoCota.toString(),
        documentosObrigatorios: documentos
      };

      const response = await this.configuracaoService.salvarConfiguracao(request).toPromise();
      
      if (response?.success) {
        await this.showToast(`Configuração da cota ${tipoCota} salva com sucesso!`, 'success');
      } else {
        await this.showToast(`Erro ao salvar configuração: ${response?.message}`, 'danger');
      }

    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      await this.showToast('Erro ao salvar configuração', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async salvarTodasConfiguracoes() {
    const alert = await this.alertController.create({
      header: 'Confirmar Salvamento',
      message: 'Deseja salvar todas as configurações de documentos por cota?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Salvar',
          handler: async () => {
            await this.salvarConfiguracao(TipoCota.LIVRE);
            await this.salvarConfiguracao(TipoCota.ECONOMICA);
            await this.salvarConfiguracao(TipoCota.FUNCIONARIO);
          }
        }
      ]
    });

    await alert.present();
  }

  async resetarConfiguracao(tipoCota: TipoCota) {
    const alert = await this.alertController.create({
      header: 'Resetar Configuração',
      message: `Deseja resetar a configuração da cota ${tipoCota}? Esta ação não pode ser desfeita.`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Resetar',
          handler: () => {
            switch (tipoCota) {
              case TipoCota.LIVRE:
                this.cotaLivre = [];
                break;
              case TipoCota.ECONOMICA:
                this.cotaEconomica = [];
                break;
              case TipoCota.FUNCIONARIO:
                this.cotaFuncionario = [];
                break;
            }
          }
        }
      ]
    });

    await alert.present();
  }

  private async showToast(message: string, color: string) {
    const toast = await this.toastController.create({
      message,
      duration: 3000,
      color,
      position: 'top'
    });
    await toast.present();
  }
}
