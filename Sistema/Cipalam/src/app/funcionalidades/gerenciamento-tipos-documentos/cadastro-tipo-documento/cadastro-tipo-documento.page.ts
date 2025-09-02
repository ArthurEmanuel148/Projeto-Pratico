import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController, AlertController } from '@ionic/angular';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';
import { TipoDocumento, TipoDocumentoCreateRequest, TipoDocumentoUpdateRequest } from '../models/tipo-documento.interface';

@Component({
    selector: 'app-cadastro-tipo-documento',
    templateUrl: './cadastro-tipo-documento.page.html',
    styleUrls: ['./cadastro-tipo-documento.page.scss'],
    standalone: false
})
export class CadastroTipoDocumentoPage implements OnInit {
    tipoDocumentoForm!: FormGroup;
    isEditMode = false;
    tipoDocumentoId?: number;
    loading = false;

    // Opções para os selects
    tiposCota = [
        { value: null, label: 'Todas as Cotas' },
        { value: 'livre', label: 'Cota Livre' },
        { value: 'economica', label: 'Cota Econômica' },
        { value: 'funcionario', label: 'Cota de Funcionário' }
    ];

    escopos = [
        { value: 'ambos', label: 'Família e Aluno' },
        { value: 'familia', label: 'Apenas Família' },
        { value: 'aluno', label: 'Apenas Aluno' }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private tipoDocumentoService: TipoDocumentoService,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private alertController: AlertController
    ) {
        this.initializeForm();
    }

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.tipoDocumentoId = parseInt(params['id']);
                this.isEditMode = true;
                this.carregarTipoDocumento();
            }
        });
    }

    private initializeForm() {
        this.tipoDocumentoForm = this.formBuilder.group({
            nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            descricao: ['', [Validators.maxLength(500)]],
            obrigatorio: [true],
            requerAssinatura: [false],
            requerAnexo: [true],
            tipoCota: [null],
            escopo: ['ambos', [Validators.required]],
            ativo: [true],
            ordemExibicao: [1, [Validators.required, Validators.min(1), Validators.max(999)]],
            templateDocumento: ['']
        });
    }

    async carregarTipoDocumento() {
        if (!this.tipoDocumentoId) return;

        const loading = await this.loadingController.create({
            message: 'Carregando tipo de documento...'
        });
        await loading.present();

        try {
            const tipoDocumento = await this.tipoDocumentoService.buscarTipoDocumentoPorId(this.tipoDocumentoId).toPromise();

            if (tipoDocumento) {
                this.tipoDocumentoForm.patchValue({
                    nome: tipoDocumento.nome,
                    descricao: tipoDocumento.descricao || '',
                    obrigatorio: tipoDocumento.obrigatorio,
                    requerAssinatura: tipoDocumento.requerAssinatura,
                    requerAnexo: tipoDocumento.requerAnexo,
                    tipoCota: tipoDocumento.tipoCota,
                    escopo: tipoDocumento.escopo,
                    ativo: tipoDocumento.ativo,
                    ordemExibicao: tipoDocumento.ordemExibicao,
                    templateDocumento: tipoDocumento.templateDocumento || ''
                });
            }
        } catch (error) {
            console.error('Erro ao carregar tipo de documento:', error);
            await this.apresentarToast('Erro ao carregar tipo de documento', 'danger');
            this.router.navigate(['/sistema/tipos-documentos']);
        } finally {
            await loading.dismiss();
        }
    }

    async salvarTipoDocumento() {
        if (this.tipoDocumentoForm.invalid) {
            this.marcarCamposComoTocados();
            await this.apresentarToast('Por favor, corrija os erros no formulário', 'warning');
            return;
        }

        const loading = await this.loadingController.create({
            message: this.isEditMode ? 'Atualizando tipo de documento...' : 'Criando tipo de documento...'
        });
        await loading.present();

        try {
            const formData = this.tipoDocumentoForm.value;

            if (this.isEditMode && this.tipoDocumentoId) {
                const updateData: TipoDocumentoUpdateRequest = {
                    idTipoDocumento: this.tipoDocumentoId,
                    ...formData
                };
                await this.tipoDocumentoService.atualizarTipoDocumento(updateData).toPromise();
                await this.apresentarToast('Tipo de documento atualizado com sucesso!', 'success');
            } else {
                const createData: TipoDocumentoCreateRequest = formData;
                await this.tipoDocumentoService.criarTipoDocumento(createData).toPromise();
                await this.apresentarToast('Tipo de documento criado com sucesso!', 'success');
            }

            this.router.navigate(['/sistema/tipos-documentos']);
        } catch (error) {
            console.error('Erro ao salvar tipo de documento:', error);
            await this.apresentarToast(
                `Erro ao ${this.isEditMode ? 'atualizar' : 'criar'} tipo de documento`,
                'danger'
            );
        } finally {
            await loading.dismiss();
        }
    }

    async confirmarCancelamento() {
        if (this.tipoDocumentoForm.dirty) {
            const alert = await this.alertController.create({
                header: 'Confirmar Cancelamento',
                message: 'Você tem alterações não salvas. Deseja realmente cancelar?',
                buttons: [
                    {
                        text: 'Continuar Editando',
                        role: 'cancel'
                    },
                    {
                        text: 'Cancelar',
                        role: 'destructive',
                        handler: () => this.cancelar()
                    }
                ]
            });
            await alert.present();
        } else {
            this.cancelar();
        }
    }

    cancelar() {
        this.router.navigate(['/sistema/tipos-documentos']);
    }

    // Validações customizadas
    isFieldInvalid(fieldName: string): boolean {
        const field = this.tipoDocumentoForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    isFieldValid(fieldName: string): boolean {
        const field = this.tipoDocumentoForm.get(fieldName);
        return !!(field && field.valid && (field.dirty || field.touched));
    }

    getFieldError(fieldName: string): string {
        const field = this.tipoDocumentoForm.get(fieldName);
        if (field && field.errors) {
            if (field.errors['required']) {
                return 'Este campo é obrigatório';
            }
            if (field.errors['minlength']) {
                const requiredLength = field.errors['minlength'].requiredLength;
                return `Mínimo de ${requiredLength} caracteres`;
            }
            if (field.errors['maxlength']) {
                const requiredLength = field.errors['maxlength'].requiredLength;
                return `Máximo de ${requiredLength} caracteres`;
            }
            if (field.errors['min']) {
                const min = field.errors['min'].min;
                return `Valor mínimo: ${min}`;
            }
            if (field.errors['max']) {
                const max = field.errors['max'].max;
                return `Valor máximo: ${max}`;
            }
        }
        return '';
    }

    private marcarCamposComoTocados() {
        Object.keys(this.tipoDocumentoForm.controls).forEach(key => {
            this.tipoDocumentoForm.get(key)?.markAsTouched();
        });
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

    // Helpers para melhorar UX
    onTipoCotaChange() {
        // Se não for específico para uma cota, pode aplicar para ambos os escopos
        const tipoCota = this.tipoDocumentoForm.get('tipoCota')?.value;
        if (tipoCota === null) {
            // Sugere ambos quando é para todas as cotas
            this.tipoDocumentoForm.patchValue({ escopo: 'ambos' });
        }
    }

    onEscopoChange() {
        // Lógica adicional se necessário
    }

    // Preview do template (futuro)
    previewTemplate() {
        const template = this.tipoDocumentoForm.get('templateDocumento')?.value;
        if (template) {
            // Implementar preview do template no futuro
            console.log('Preview do template:', template);
        }
    }
}
