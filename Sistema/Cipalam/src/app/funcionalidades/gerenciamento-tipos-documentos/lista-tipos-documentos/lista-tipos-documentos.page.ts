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

    editarTipoDocumento(id: number) {
        this.router.navigate(['/sistema/tipos-documento/editar', id]);
    }

    async alternarStatus(tipoDocumento: TipoDocumento) {
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
        const modalidades = this.modalidadesEntrega.find(m => m.value === modalidade);
        return modalidades?.label || modalidade;
    }

    getQuemDeveFornecerLabel(fornecedor: string): string {
        const fornecedores = this.quemDeveFornecerOpcoes.find(f => f.value === fornecedor);
        return fornecedores?.label || fornecedor;
    }

    formatarDataCriacao(data: Date): string {
        return new Date(data).toLocaleDateString('pt-BR');
    }
}
