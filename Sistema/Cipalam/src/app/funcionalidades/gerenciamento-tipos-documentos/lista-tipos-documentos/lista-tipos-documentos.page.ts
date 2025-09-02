import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';
import { TipoDocumento } from '../models/tipo-documento.interface';
import { AuthService } from '../../../core/services/auth.service';

@Component({
    selector: 'app-lista-tipos-documentos',
    templateUrl: './lista-tipos-documentos.page.html',
    styleUrls: ['./lista-tipos-documentos.page.scss'],
    standalone: false
})
export class ListaTiposDocumentosPage implements OnInit {
    tiposDocumentos: TipoDocumento[] = [];
    tiposDocumentosFiltrados: TipoDocumento[] = [];
    loading = false;
    podeGerenciarTiposDocumentos = false;
    filtros = {
        nome: '',
        tipoCota: '',
        escopo: '',
        ativo: true
    };

    constructor(
        private tipoDocumentoService: TipoDocumentoService,
        private router: Router,
        private alertController: AlertController,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private authService: AuthService
    ) { }

    ngOnInit() {
        this.verificarPermissoes();
        this.carregarTiposDocumentos();
    }

    ionViewWillEnter() {
        this.carregarTiposDocumentos();
    }

    verificarPermissoes() {
        const usuario = this.authService.getFuncionarioLogado();
        this.podeGerenciarTiposDocumentos = !!(
            usuario?.tipo === 'admin' ||
            usuario?.permissoes?.['gerenciamentoDocumentos'] ||
            usuario?.permissoes?.['configuracaoSistema']
        );
    }

    async carregarTiposDocumentos() {
        this.loading = true;
        
        try {
            this.tiposDocumentos = await this.tipoDocumentoService.listarTiposDocumentos().toPromise() || [];
            this.aplicarFiltros();
            console.log('Tipos de documentos carregados:', this.tiposDocumentos);
        } catch (error) {
            console.error('Erro ao carregar tipos de documentos:', error);
            await this.apresentarToast('Erro ao carregar tipos de documentos', 'danger');
        } finally {
            this.loading = false;
        }
    }

    aplicarFiltros() {
        this.tiposDocumentosFiltrados = this.tiposDocumentos.filter(tipo => {
            const nomeMatch = !this.filtros.nome || 
                tipo.nome.toLowerCase().includes(this.filtros.nome.toLowerCase());
            
            const tipoCotaMatch = !this.filtros.tipoCota || 
                tipo.tipoCota === this.filtros.tipoCota;
            
            const escopoMatch = !this.filtros.escopo || 
                tipo.escopo === this.filtros.escopo;
            
            const ativoMatch = this.filtros.ativo === undefined || 
                tipo.ativo === this.filtros.ativo;

            return nomeMatch && tipoCotaMatch && escopoMatch && ativoMatch;
        });
    }

    limparFiltros() {
        this.filtros = {
            nome: '',
            tipoCota: '',
            escopo: '',
            ativo: true
        };
        this.aplicarFiltros();
    }

    navegarParaCadastro() {
        this.router.navigate(['/sistema/tipos-documentos/cadastro']);
    }

    editarTipoDocumento(id: number) {
        this.router.navigate(['/sistema/tipos-documentos/cadastro'], { 
            queryParams: { id } 
        });
    }

    async alternarStatus(tipoDocumento: TipoDocumento) {
        const loading = await this.loadingController.create({
            message: 'Alterando status...'
        });
        await loading.present();

        try {
            await this.tipoDocumentoService.alternarStatusTipoDocumento(
                tipoDocumento.idTipoDocumento!
            ).toPromise();
            
            tipoDocumento.ativo = !tipoDocumento.ativo;
            this.aplicarFiltros();
            
            await this.apresentarToast(
                `Tipo de documento ${tipoDocumento.ativo ? 'ativado' : 'desativado'} com sucesso!`,
                'success'
            );
        } catch (error) {
            console.error('Erro ao alterar status:', error);
            await this.apresentarToast('Erro ao alterar status do tipo de documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async confirmarRemocao(tipoDocumento: TipoDocumento) {
        // Primeiro verifica se pode remover
        try {
            const podeRemover = await this.tipoDocumentoService.podeRemoverTipoDocumento(
                tipoDocumento.idTipoDocumento!
            ).toPromise();

            if (!podeRemover) {
                await this.apresentarToast(
                    'Este tipo de documento não pode ser removido pois está sendo utilizado.',
                    'warning'
                );
                return;
            }
        } catch (error) {
            console.error('Erro ao verificar se pode remover:', error);
        }

        const alert = await this.alertController.create({
            header: 'Confirmar Remoção',
            message: `Tem certeza que deseja remover o tipo de documento "${tipoDocumento.nome}"?`,
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Remover',
                    role: 'destructive',
                    handler: () => this.removerTipoDocumento(tipoDocumento)
                }
            ]
        });

        await alert.present();
    }

    async removerTipoDocumento(tipoDocumento: TipoDocumento) {
        const loading = await this.loadingController.create({
            message: 'Removendo tipo de documento...'
        });
        await loading.present();

        try {
            await this.tipoDocumentoService.removerTipoDocumento(
                tipoDocumento.idTipoDocumento!
            ).toPromise();
            
            this.tiposDocumentos = this.tiposDocumentos.filter(
                t => t.idTipoDocumento !== tipoDocumento.idTipoDocumento
            );
            this.aplicarFiltros();
            
            await this.apresentarToast('Tipo de documento removido com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao remover tipo de documento:', error);
            await this.apresentarToast('Erro ao remover tipo de documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    getTipoCotaLabel(tipoCota: string | null): string {
        switch (tipoCota) {
            case 'livre': return 'Livre';
            case 'economica': return 'Econômica';
            case 'funcionario': return 'Funcionário';
            default: return 'Todas';
        }
    }

    getEscopoLabel(escopo: string): string {
        switch (escopo) {
            case 'familia': return 'Família';
            case 'aluno': return 'Aluno';
            case 'ambos': return 'Ambos';
            default: return escopo;
        }
    }

    getTipoCotaColor(tipoCota: string | null): string {
        switch (tipoCota) {
            case 'livre': return 'primary';
            case 'economica': return 'warning';
            case 'funcionario': return 'tertiary';
            default: return 'medium';
        }
    }

    getEscopoColor(escopo: string): string {
        switch (escopo) {
            case 'familia': return 'success';
            case 'aluno': return 'secondary';
            case 'ambos': return 'tertiary';
            default: return 'medium';
        }
    }

    private async apresentarToast(message: string, color: string) {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color,
            position: 'top'
        });
        await toast.present();
    }
}
