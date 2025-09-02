import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe, UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { LoadingController, AlertController, ToastController, ModalController } from '@ionic/angular';
import { DocumentoService } from '../../core/services/documento.service';

@Component({
    selector: 'app-aprovacao-documentos',
    templateUrl: './aprovacao-documentos.page.html',
    styleUrls: ['./aprovacao-documentos.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule, DatePipe, UpperCasePipe]
})
export class AprovacaoDocumentosPage implements OnInit {
    documentosParaAprovacao: any[] = [];
    isLoading = false;
    idFuncionario = 1; // TODO: Pegar do usuário logado

    filtros = {
        status: 'todos',
        tipoCota: 'todos',
        busca: ''
    };

    documentosFiltrados: any[] = [];

    constructor(
        private documentoService: DocumentoService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private toastController: ToastController,
        private modalController: ModalController
    ) { }

    ngOnInit() {
        this.carregarDocumentos();
    }

    async carregarDocumentos() {
        const loading = await this.loadingController.create({
            message: 'Carregando documentos...'
        });
        await loading.present();

        try {
            const resultado = await this.documentoService.listarDocumentosParaAprovacao().toPromise();
            this.documentosParaAprovacao = resultado || [];
            this.aplicarFiltros();
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
            await this.mostrarToast('Erro ao carregar documentos', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    aplicarFiltros() {
        let documentos = [...this.documentosParaAprovacao];

        // Filtrar por status
        if (this.filtros.status !== 'todos') {
            documentos = documentos.filter(doc => doc.status === this.filtros.status);
        }

        // Filtrar por tipo de cota
        if (this.filtros.tipoCota !== 'todos') {
            documentos = documentos.filter(doc => doc.tipoCota === this.filtros.tipoCota);
        }

        // Filtrar por busca
        if (this.filtros.busca.trim()) {
            const busca = this.filtros.busca.toLowerCase();
            documentos = documentos.filter(doc =>
                doc.nomeResponsavel.toLowerCase().includes(busca) ||
                doc.cpfResponsavel.includes(busca) ||
                doc.protocolo.toLowerCase().includes(busca) ||
                doc.nomeDocumento.toLowerCase().includes(busca)
            );
        }

        this.documentosFiltrados = documentos;
    }

    async aprovarDocumento(documento: any) {
        const alert = await this.alertController.create({
            header: 'Aprovar Documento',
            message: `Confirma a aprovação do documento "${documento.nomeDocumento}" de ${documento.nomeResponsavel}?`,
            inputs: [
                {
                    name: 'observacoes',
                    type: 'textarea',
                    placeholder: 'Observações (opcional)',
                    attributes: {
                        rows: 3
                    }
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Aprovar',
                    handler: async (data) => {
                        await this.executarAprovacao(documento.idDocumento, data.observacoes);
                    }
                }
            ]
        });

        await alert.present();
    }

    async rejeitarDocumento(documento: any) {
        const alert = await this.alertController.create({
            header: 'Rejeitar Documento',
            message: `Rejeitar o documento "${documento.nomeDocumento}" de ${documento.nomeResponsavel}?`,
            inputs: [
                {
                    name: 'motivoRejeicao',
                    type: 'text',
                    placeholder: 'Motivo da rejeição (obrigatório)',
                    attributes: {
                        required: true
                    }
                },
                {
                    name: 'observacoes',
                    type: 'textarea',
                    placeholder: 'Observações adicionais (opcional)',
                    attributes: {
                        rows: 3
                    }
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Rejeitar',
                    handler: async (data) => {
                        if (!data.motivoRejeicao?.trim()) {
                            await this.mostrarToast('Motivo da rejeição é obrigatório', 'warning');
                            return false;
                        }
                        await this.executarRejeicao(documento.idDocumento, data.motivoRejeicao, data.observacoes);
                        return true;
                    }
                }
            ]
        });

        await alert.present();
    }

    private async executarAprovacao(idDocumento: number, observacoes?: string) {
        const loading = await this.loadingController.create({
            message: 'Aprovando documento...'
        });
        await loading.present();

        try {
            await this.documentoService.aprovarDocumento(idDocumento, this.idFuncionario, observacoes).toPromise();
            await this.mostrarToast('Documento aprovado com sucesso!', 'success');
            await this.carregarDocumentos();
        } catch (error: any) {
            console.error('Erro ao aprovar documento:', error);
            const mensagem = error.error?.erro || 'Erro ao aprovar documento';
            await this.mostrarToast(mensagem, 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    private async executarRejeicao(idDocumento: number, motivoRejeicao: string, observacoes?: string) {
        const loading = await this.loadingController.create({
            message: 'Rejeitando documento...'
        });
        await loading.present();

        try {
            await this.documentoService.rejeitarDocumento(idDocumento, this.idFuncionario, motivoRejeicao, observacoes).toPromise();
            await this.mostrarToast('Documento rejeitado. Responsável será notificado.', 'warning');
            await this.carregarDocumentos();
        } catch (error: any) {
            console.error('Erro ao rejeitar documento:', error);
            const mensagem = error.error?.erro || 'Erro ao rejeitar documento';
            await this.mostrarToast(mensagem, 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async visualizarDocumento(idDocumento: number, nomeArquivo: string) {
        const loading = await this.loadingController.create({
            message: 'Carregando documento...'
        });
        await loading.present();

        try {
            const blob = await this.documentoService.downloadDocumento(idDocumento).toPromise();

            if (blob) {
                // Criar URL para visualização
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = nomeArquivo;
                link.click();

                window.URL.revokeObjectURL(url);
            }
        } catch (error: any) {
            console.error('Erro ao visualizar documento:', error);
            await this.mostrarToast('Erro ao carregar documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async verDetalhes(documento: any) {
        const alert = await this.alertController.create({
            header: 'Detalhes do Documento',
            message: `
        <strong>Responsável:</strong> ${documento.nomeResponsavel}<br>
        <strong>CPF:</strong> ${documento.cpfResponsavel}<br>
        <strong>Protocolo:</strong> ${documento.protocolo}<br>
        <strong>Tipo de Cota:</strong> ${documento.tipoCota}<br>
        <strong>Documento:</strong> ${documento.nomeDocumento}<br>
        <strong>Categoria:</strong> ${documento.categoria}<br>
        <strong>Obrigatório:</strong> ${documento.obrigatorio ? 'Sim' : 'Não'}<br>
        <strong>Data de Envio:</strong> ${new Date(documento.dataEnvio).toLocaleString()}<br>
        ${documento.observacoes ? `<strong>Observações:</strong> ${documento.observacoes}` : ''}
      `,
            buttons: ['Fechar']
        });

        await alert.present();
    }

    obterCorStatus(status: string): string {
        return this.documentoService.obterCorStatus(status);
    }

    obterIconeCategoria(categoria: string): string {
        const icones: { [key: string]: string } = {
            'identidade': 'card-outline',
            'endereco': 'home-outline',
            'renda': 'cash-outline',
            'vinculo': 'briefcase-outline',
            'familiar': 'people-outline',
            'outros': 'document-outline'
        };

        return icones[categoria.toLowerCase()] || 'document-outline';
    }

    private async mostrarToast(mensagem: string, cor: string) {
        const toast = await this.toastController.create({
            message: mensagem,
            duration: 3000,
            color: cor,
            position: 'top'
        });
        await toast.present();
    }
}
