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

    filtros = {
        nome: '',
        modalidadeEntrega: '',
        quemDeveFornencer: '',
        ativo: null as boolean | null
    };

    // Opções para filtros
    modalidadesEntrega = [
        { value: 'ASSINADO', label: 'Assinado' },
        { value: 'ANEXADO', label: 'Anexado' }
    ];

    quemDeveFornecerOpcoes = [
        { value: 'RESPONSAVEL', label: 'Responsável' },
        { value: 'ALUNO', label: 'Aluno' },
        { value: 'TODOS_INTEGRANTES', label: 'Todos os Integrantes' },
        { value: 'FAMILIA', label: 'Família' }
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

            const modalidadeMatch = !this.filtros.modalidadeEntrega ||
                tipo.modalidadeEntrega === this.filtros.modalidadeEntrega;

            const fornecedorMatch = !this.filtros.quemDeveFornencer ||
                tipo.quemDeveFornencer === this.filtros.quemDeveFornencer;

            const ativoMatch = this.filtros.ativo === null ||
                tipo.ativo === this.filtros.ativo;

            return nomeMatch && modalidadeMatch && fornecedorMatch && ativoMatch;
        });
    }

    limparFiltros() {
        this.filtros = {
            nome: '',
            modalidadeEntrega: '',
            quemDeveFornencer: '',
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

    // Métodos helper para templates
    getModalidadeLabel(modalidade: string): string {
        console.log('Modalidade recebida:', modalidade);
        switch (modalidade) {
            case 'ASSINADO': return 'Assinado - Documento para assinatura digital';
            case 'ANEXADO': return 'Anexado - Arquivo para upload';
            case 'FISICO': return 'Físico - Documento impresso/assinado';
            case 'DIGITAL': return 'Digital - Arquivo eletrônico';
            case 'AMBOS': return 'Físico e Digital - Ambas as formas';
            default: return modalidade || 'Não informado';
        }
    }

    getQuemDeveFornecerLabel(fornecedor: string): string {
        console.log('Fornecedor recebido:', fornecedor);
        switch (fornecedor) {
            case 'RESPONSAVEL': return 'Responsável - Pai/Mãe/Tutor';
            case 'ALUNO': return 'Aluno - O próprio estudante';
            case 'TODOS_INTEGRANTES': return 'Todos Integrantes - Família toda';
            case 'FAMILIA': return 'Família - Documento familiar';
            case 'AMBOS': return 'Responsável ou Aluno - Qualquer um';
            default: return fornecedor || 'Não informado';
        }
    }

    formatarDataCriacao(data: Date): string {
        return new Date(data).toLocaleDateString('pt-BR');
    }

    // Novos métodos para o layout atualizado
    temFiltrosAtivos(): boolean {
        return !!(this.filtros.nome || 
                  this.filtros.modalidadeEntrega || 
                  this.filtros.quemDeveFornencer || 
                  this.filtros.ativo !== null);
    }

    getCorModalidade(modalidade: string): string {
        switch (modalidade) {
            case 'ASSINADO': return 'primary';
            case 'ANEXADO': return 'secondary';
            case 'FISICO': return 'warning';
            case 'DIGITAL': return 'secondary';
            case 'AMBOS': return 'tertiary';
            default: return 'medium';
        }
    }

    getCorFornecedor(fornecedor: string): string {
        switch (fornecedor) {
            case 'RESPONSAVEL': return 'primary';
            case 'ALUNO': return 'success';
            case 'TODOS_INTEGRANTES': return 'warning';
            case 'FAMILIA': return 'tertiary';
            case 'AMBOS': return 'tertiary';
            default: return 'medium';
        }
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
