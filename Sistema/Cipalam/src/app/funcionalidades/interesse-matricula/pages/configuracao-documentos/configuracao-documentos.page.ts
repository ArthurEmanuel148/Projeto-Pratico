import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { DocumentosCotaSelectorComponent } from '../../components/documentos-cota-selector/documentos-cota-selector.component';
import { DocumentoMatricula } from '../../models/documento-matricula.interface';

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
export class ConfiguracaoDocumentosPage {
  tiposCota = TIPOS_COTA;
  documentosPorCota: Record<string, string[]> = {
    funcionario: [],
    economica: [],
    livre: []
  };

  constructor(private modalCtrl: ModalController) {}

  async abrirSelecaoDocumentos(cota: any) {
    const modal = await this.modalCtrl.create({
      component: DocumentosCotaSelectorComponent,
      componentProps: {
        documentosDisponiveis: TODOS_DOCUMENTOS,
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

  salvarConfiguracao() {
    // Aqui você pode salvar no backend ou localStorage
    console.log('Configuração:', this.documentosPorCota);
  }
}
