import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { LoadingController, ToastController, AlertController, IonicModule } from '@ionic/angular';
import { TipoDocumentoService } from '../../../core/services/tipo-documento.service';
import { TipoDocumento, QuemDeveFornencer } from '../../../core/models/tipo-documento.interface';

@Component({
    selector: 'app-cadastro-tipo-documento',
    templateUrl: './cadastro-tipo-documento.page.html',
    styleUrls: ['./cadastro-tipo-documento.page.scss'],
    standalone: true,
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class CadastroTipoDocumentoPage implements OnInit {
    tipoDocumentoForm!: FormGroup;
    isEditMode = false;
    tipoDocumentoId?: number;

    // Estados para controle visual dos radio buttons
    quemForneceSelecionado: string = '';

    // Opções para os selects
    quemDeveFornecerOpcoes = [
        { value: QuemDeveFornencer.RESPONSAVEL, label: 'Apenas Responsável' },
        { value: QuemDeveFornencer.ALUNO, label: 'Apenas Aluno' },
        { value: QuemDeveFornencer.TODOS_INTEGRANTES, label: 'Todos os Integrantes da Família' },
        { value: QuemDeveFornencer.FAMILIA, label: 'Família' }
    ];

    constructor(
        private formBuilder: FormBuilder,
        private route: ActivatedRoute,
        private router: Router,
        private tipoDocumentoService: TipoDocumentoService,
        private loadingController: LoadingController,
        private toastController: ToastController,
        private alertController: AlertController
    ) { }

    ngOnInit() {
        this.createForm();
        const id = this.route.snapshot.params['id'];
        if (id) {
            this.tipoDocumentoId = Number(id);
            this.isEditMode = true;
            this.carregarTipoDocumento();
        }
    }

    private createForm() {
        this.tipoDocumentoForm = this.formBuilder.group({
            nome: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
            descricao: ['', [Validators.maxLength(500)]],
            modalidadeEntrega: ['ANEXADO'], // Fixo como ANEXADO para todos os documentos
            quemDeveFornencer: ['', [Validators.required]], // RESPONSAVEL, ALUNO, TODOS_INTEGRANTES, FAMILIA
            ativo: [true]
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
                    descricao: tipoDocumento.descricao,
                    modalidadeEntrega: tipoDocumento.modalidadeEntrega,
                    quemDeveFornencer: tipoDocumento.quemDeveFornencer,
                    ativo: tipoDocumento.ativo
                });

                // Atualizar estados visuais (modalidade sempre ANEXADO)
                this.quemForneceSelecionado = tipoDocumento.quemDeveFornencer;
            }
        } catch (error) {
            console.error('Erro ao carregar tipo de documento:', error);
            await this.showToast('Erro ao carregar tipo de documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async salvar() {
        if (this.tipoDocumentoForm.invalid) {
            await this.showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
            this.tipoDocumentoForm.markAllAsTouched();
            return;
        }

        const loading = await this.loadingController.create({
            message: this.isEditMode ? 'Atualizando tipo de documento...' : 'Criando tipo de documento...'
        });
        await loading.present();

        try {
            const formData = this.tipoDocumentoForm.value;

            if (this.isEditMode && this.tipoDocumentoId) {
                await this.tipoDocumentoService.atualizarTipoDocumento(this.tipoDocumentoId, formData).toPromise();
                await this.showToast('Tipo de documento atualizado com sucesso!', 'success');
            } else {
                await this.tipoDocumentoService.criarTipoDocumento(formData).toPromise();
                await this.showToast('Tipo de documento criado com sucesso!', 'success');

                // Limpar formulário após criação
                this.limparFormulario();
            }

            // Navegar de volta para a lista
            setTimeout(() => {
                this.router.navigate(['/sistema/tipos-documento/lista']);
            }, 1000);
        } catch (error) {
            console.error('Erro ao salvar tipo de documento:', error);
            await this.showToast('Erro ao salvar tipo de documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    async confirmarExclusao() {
        if (!this.isEditMode || !this.tipoDocumentoId) return;

        const alert = await this.alertController.create({
            header: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja excluir este tipo de documento? Esta ação não pode ser desfeita.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Excluir',
                    handler: () => this.excluir()
                }
            ]
        });

        await alert.present();
    }

    async excluir() {
        if (!this.tipoDocumentoId) return;

        const loading = await this.loadingController.create({
            message: 'Excluindo tipo de documento...'
        });
        await loading.present();

        try {
            await this.tipoDocumentoService.excluirTipoDocumento(this.tipoDocumentoId).toPromise();
            await this.showToast('Tipo de documento excluído com sucesso!', 'success');
            this.router.navigate(['/sistema/tipos-documento/lista']);
        } catch (error) {
            console.error('Erro ao excluir tipo de documento:', error);
            await this.showToast('Erro ao excluir tipo de documento', 'danger');
        } finally {
            await loading.dismiss();
        }
    }

    cancelar() {
        this.router.navigate(['/sistema/tipos-documento/lista']);
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
    getQuemDeveFornecerLabel(quem: QuemDeveFornencer): string {
        const opcao = this.quemDeveFornecerOpcoes.find(q => q.value === quem);
        return opcao ? opcao.label : quem;
    }

    // Método para seleção manual do radio button
    selecionarQuemFornece(quem: string) {
        console.log('Selecionando quem fornece:', quem);
        this.quemForneceSelecionado = quem;
        this.tipoDocumentoForm.patchValue({ quemDeveFornencer: quem });
        console.log('Valor atual do form:', this.tipoDocumentoForm.value);
    }

    limparFormulario() {
        this.tipoDocumentoForm.reset();
        this.quemForneceSelecionado = '';
        this.tipoDocumentoForm.patchValue({
            nome: '',
            descricao: '',
            modalidadeEntrega: 'ANEXADO', // Sempre definir como ANEXADO
            quemDeveFornencer: '',
            ativo: true
        });
    }

    // Métodos para focus/blur dos inputs - mostra placeholder apenas após clicar
    onInputFocus(event: any, placeholderText: string) {
        const input = event.target;
        const ionItem = input.closest('ion-item');
        
        // Força o label a subir imediatamente
        if (ionItem) {
            ionItem.classList.add('item-has-focus');
            if (!input.value) {
                ionItem.classList.add('item-has-placeholder');
            }
        }
        
        if (input && !input.value) {
            // Define um valor temporário invisível para forçar o label a subir
            input.value = ' ';
            setTimeout(() => {
                input.value = '';
                input.placeholder = placeholderText;
            }, 50);
        }
    }

    onInputBlur(event: any) {
        const input = event.target;
        const ionItem = input.closest('ion-item');
        
        if (input && !input.value.trim()) {
            input.placeholder = '';
            input.value = '';
            if (ionItem) {
                ionItem.classList.remove('item-has-placeholder');
            }
        }
        
        // Remove a classe de foco se não houver valor
        if (ionItem && !input.value.trim()) {
            setTimeout(() => {
                ionItem.classList.remove('item-has-focus');
            }, 100);
        }
    }

    // Validações de campo
    get nome() {
        return this.tipoDocumentoForm.get('nome');
    }

    get descricao() {
        return this.tipoDocumentoForm.get('descricao');
    }

    get modalidadeEntrega() {
        return this.tipoDocumentoForm.get('modalidadeEntrega');
    }

    get quemDeveFornencer() {
        return this.tipoDocumentoForm.get('quemDeveFornencer');
    }
}
