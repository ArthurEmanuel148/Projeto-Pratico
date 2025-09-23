import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, IonicModule } from '@ionic/angular';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';
import { TipoDocumento } from '../../../core/models/tipo-documento.interface';

@Component({
    selector: 'app-lista-tipos-documentos',
    templateUrl: './lista-tipos-documentos.page.html',
    styleUrls: ['./lista-tipos-documentos.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, IonicModule]
})
export class ListaTiposDocumentosPage implements OnInit {
    tiposDocumentos: TipoDocumento[] = [];
    tiposDocumentosFiltrados: TipoDocumento[] = [];
    loading = false;
    mostrarFiltrosAvancados = false;

    filtros = {
        nome: '',
        escopo: '',
        ativo: null as boolean | null
    };

    // Opções para filtros
    escopoOpcoes = [
        { value: 'FAMILIA', label: 'Família' },
        { value: 'ALUNO', label: 'Aluno' },
        { value: 'TODOS_INTEGRANTES', label: 'Todos os Integrantes' }
    ];

    statusOptions = [
        { value: true, label: 'Ativo' },
        { value: false, label: 'Inativo' }
    ];

    constructor(
        private tipoDocumentoService: TipoDocumentoService,
        private router: Router,
        private alertController: AlertController,
        private loadingController: LoadingController,
        private toastController: ToastController
    ) { }

    ngOnInit() {
        this.carregarTiposDocumentos();
    }

    ionViewWillEnter() {
        this.carregarTiposDocumentos();
    }

    async carregarTiposDocumentos() {
        this.loading = true;
        const loading = await this.loadingController.create({
            message: 'Carregando tipos de documentos...'
        });
        await loading.present();

        try {
            const response = await this.tipoDocumentoService.listarTiposDocumentos(0, 100).toPromise();
            this.tiposDocumentos = response?.content || [];
            this.aplicarFiltros();
        } catch (error) {
            console.error('Erro ao carregar tipos de documentos:', error);
            await this.showToast('Erro ao carregar tipos de documentos', 'danger');
        } finally {
            this.loading = false;
            await loading.dismiss();
        }
    }

    aplicarFiltros() {
        this.tiposDocumentosFiltrados = this.tiposDocumentos.filter(tipo => {
            const nomeMatch = !this.filtros.nome ||
                tipo.nome.toLowerCase().includes(this.filtros.nome.toLowerCase());

            const escopoMatch = !this.filtros.escopo ||
                tipo.escopo === this.filtros.escopo;

            const ativoMatch = this.filtros.ativo === null ||
                tipo.ativo === this.filtros.ativo;

            return nomeMatch && escopoMatch && ativoMatch;
        });
    }

    limparFiltros() {
        this.filtros = {
            nome: '',
            escopo: '',
            ativo: null
        };
        this.aplicarFiltros();
    }

    novoTipoDocumento() {
        this.router.navigate(['/sistema/tipos-documento/cadastro']);
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

    // Novos métodos para os filtros estilo Gmail
    toggleFiltrosAvancados(): void {
        this.mostrarFiltrosAvancados = !this.mostrarFiltrosAvancados;
    }

    toggleFiltroStatus(status: boolean): void {
        this.filtros.ativo = this.filtros.ativo === status ? null : status;
        this.aplicarFiltros();
    }

    // Novos métodos para o layout atualizado
    temFiltrosAtivos(): boolean {
        return !!(this.filtros.nome || 
                  this.filtros.escopo || 
                  this.filtros.ativo !== null);
    }

    visualizarTipoDocumento(tipoDocumento: TipoDocumento): void {
        this.router.navigate(['/sistema/tipos-documento/visualizar', tipoDocumento.idTipoDocumento]);
    }

    editarTipoDocumento(id: number, event?: Event): void {
        if (event) {
            event.stopPropagation();
        }
        this.router.navigate(['/sistema/tipos-documento/editar', id]);
    }

    async alternarStatus(tipoDocumento: TipoDocumento, event?: Event): Promise<void> {
        if (event) {
            event.stopPropagation();
        }
        
        const loading = await this.loadingController.create({
            message: tipoDocumento.ativo ? 'Desativando...' : 'Ativando...'
        });
        await loading.present();

        try {
            const dadosAtualizados = {
                idTipoDocumento: tipoDocumento.idTipoDocumento!,
                nome: tipoDocumento.nome,
                descricao: tipoDocumento.descricao,
                modalidadeEntrega: tipoDocumento.modalidadeEntrega,
                quemDeveFornencer: tipoDocumento.quemDeveFornencer,
                ativo: !tipoDocumento.ativo
            };
            await this.tipoDocumentoService.atualizarTipoDocumento(tipoDocumento.idTipoDocumento!, dadosAtualizados).toPromise();

            const status = dadosAtualizados.ativo ? 'ativado' : 'desativado';
            await this.showToast(`Tipo de documento ${status} com sucesso!`, 'success');
            this.carregarTiposDocumentos();
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            await this.showToast('Erro ao alterar status do tipo de documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async excluirTipoDocumento(tipoDocumento: TipoDocumento, event: Event): Promise<void> {
        event.stopPropagation();
        
        const alert = await this.alertController.create({
            header: 'Confirmar Desativação',
            message: `Tem certeza que deseja desativar o tipo de documento "${tipoDocumento.nome}"?`,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Desativar',
                    handler: async () => {
                        const loading = await this.loadingController.create({
                            message: 'Desativando tipo de documento...'
                        });
                        await loading.present();

                        try {
                            await this.tipoDocumentoService.desativarTipoDocumento(tipoDocumento.idTipoDocumento!).toPromise();
                            await this.showToast('Tipo de documento desativado com sucesso!', 'success');
                            this.carregarTiposDocumentos();
                        } catch (error) {
                            console.error('Erro ao desativar tipo de documento:', error);
                            await this.showToast('Erro ao desativar tipo de documento', 'danger');
                        } finally {
                            await loading.dismiss();
                        }
                    }
                }
            ]
        });

        await alert.present();
    }

    get tiposDocumentosCarregados(): boolean {
        return !this.loading;
    }

    get carregando(): boolean {
        return this.loading;
    }
}
