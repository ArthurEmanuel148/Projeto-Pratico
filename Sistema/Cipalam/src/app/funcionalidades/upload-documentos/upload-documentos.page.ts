import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { DocumentoService } from '../../core/services/documento.service';

@Component({
    selector: 'app-upload-documentos',
    templateUrl: './upload-documentos.page.html',
    styleUrls: ['./upload-documentos.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class UploadDocumentosPage implements OnInit {
    idResponsavel: number = 0;
    documentosPendentes: any[] = [];
    isLoading = false;
    arquivosSelecionados: { [key: number]: File } = {};

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private documentoService: DocumentoService,
        private loadingController: LoadingController,
        private alertController: AlertController,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        this.idResponsavel = Number(this.route.snapshot.paramMap.get('idResponsavel'));
        if (this.idResponsavel) {
            this.carregarDocumentos();
        }
    }

    async carregarDocumentos() {
        const loading = await this.loadingController.create({
            message: 'Carregando documentos...'
        });
        await loading.present();

        try {
            this.documentosPendentes = await this.documentoService.listarDocumentosPendentes(this.idResponsavel).toPromise();
        } catch (error) {
            console.error('Erro ao carregar documentos:', error);
            await this.mostrarToast('Erro ao carregar documentos', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    onArquivoSelecionado(event: any, idDocumento: number) {
        const arquivo = event.target.files[0];
        if (arquivo) {
            // Validar tipo de arquivo
            const tiposPermitidos = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
            if (!tiposPermitidos.includes(arquivo.type)) {
                this.mostrarToast('Tipo de arquivo não permitido. Use PDF, JPG ou PNG.', 'danger');
                return;
            }

            // Validar tamanho (5MB)
            if (arquivo.size > 5 * 1024 * 1024) {
                this.mostrarToast('Arquivo muito grande. Máximo 5MB.', 'danger');
                return;
            }

            this.arquivosSelecionados[idDocumento] = arquivo;
        }
    }

    async anexarDocumento(idDocumento: number) {
        const arquivo = this.arquivosSelecionados[idDocumento];
        if (!arquivo) {
            await this.mostrarToast('Selecione um arquivo primeiro', 'warning');
            return;
        }

        const loading = await this.loadingController.create({
            message: 'Enviando documento...'
        });
        await loading.present();

        try {
            await this.documentoService.anexarDocumento(arquivo, idDocumento, this.idResponsavel).toPromise();
            await this.mostrarToast('Documento enviado com sucesso!', 'success');
            delete this.arquivosSelecionados[idDocumento];
            await this.carregarDocumentos();
        } catch (error: any) {
            console.error('Erro ao anexar documento:', error);
            const mensagem = error.error?.erro || 'Erro ao enviar documento';
            await this.mostrarToast(mensagem, 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async removerDocumento(idDocumento: number) {
        const alert = await this.alertController.create({
            header: 'Confirmar',
            message: 'Deseja remover este documento?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Remover',
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            message: 'Removendo documento...'
                        });
                        await loading.present();

                        try {
                            await this.documentoService.removerDocumento(idDocumento, this.idResponsavel).toPromise();
                            await this.mostrarToast('Documento removido com sucesso!', 'success');
                            await this.carregarDocumentos();
                        } catch (error: any) {
                            console.error('Erro ao remover documento:', error);
                            const mensagem = error.error?.erro || 'Erro ao remover documento';
                            await this.mostrarToast(mensagem, 'danger');
                        } finally {
                            await loading.dismiss();
                        }
                    }
                }
            ]
        });

        await alert.present();
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
