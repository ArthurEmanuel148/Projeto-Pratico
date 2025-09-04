import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';
import { TurmaService, TurmaCadastroDTO } from '../../../core/services/turma.service';

@Component({
    selector: 'app-cadastro-turma',
    templateUrl: './cadastro-turma.page.html',
    styleUrls: ['./cadastro-turma.page.scss'],
    standalone: false
})
export class CadastroTurmaPage implements OnInit {
    cadastroForm: FormGroup;
    isEditMode: boolean = false;
    turmaId: number | null = null;
    turmaData: any = null;

    constructor(
        private fb: FormBuilder,
        private router: Router,
        private route: ActivatedRoute,
        private turmaService: TurmaService,
        private toastController: ToastController,
        private loadingController: LoadingController,
        private alertController: AlertController
    ) {
        this.cadastroForm = this.fb.group({
            nomeTurma: ['', [Validators.required, Validators.minLength(3)]],
            capacidadeMaxima: ['', [Validators.required, Validators.min(1), Validators.max(50)]],
            horarioInicio: ['', [Validators.required]],
            horarioFim: ['', [Validators.required]],
            observacoes: [''],
            ativo: [true]
        });
    }

    ngOnInit() {
        // Verificar se está em modo de edição
        this.route.queryParams.subscribe(params => {
            if (params['id']) {
                this.turmaId = parseInt(params['id']);
                this.isEditMode = true;
                this.carregarDadosTurma();
            }
        });

        // Configurar listener para validação em tempo real
        this.setupFormValidation();
    }

    setupFormValidation() {
        // Observar mudanças nos campos para aplicar validação visual
        Object.keys(this.cadastroForm.controls).forEach(key => {
            this.cadastroForm.get(key)?.valueChanges.subscribe(() => {
                // Marcar como touched quando o valor mudar
                if (!this.cadastroForm.get(key)?.touched) {
                    this.cadastroForm.get(key)?.markAsTouched();
                }
            });
        });
    }

    // Métodos para verificar estados de validação
    isFieldValid(fieldName: string): boolean {
        const field = this.cadastroForm.get(fieldName);
        return field ? field.valid && (field.touched || field.dirty) : false;
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.cadastroForm.get(fieldName);
        return field ? field.invalid && (field.touched || field.dirty) : false;
    }

    getFieldError(fieldName: string): string {
        const field = this.cadastroForm.get(fieldName);
        if (field && field.errors && field.touched) {
            if (field.errors['required']) {
                return 'Este campo é obrigatório';
            }
            if (field.errors['minlength']) {
                return `Mínimo de ${field.errors['minlength'].requiredLength} caracteres`;
            }
            if (field.errors['min']) {
                return `Valor mínimo: ${field.errors['min'].min}`;
            }
            if (field.errors['max']) {
                return `Valor máximo: ${field.errors['max'].max}`;
            }
        }
        return '';
    }

    // Método para controlar foco nos inputs - mostra placeholder apenas após clicar
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

    // Método para controlar blur nos inputs - remove placeholder se vazio
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

    // Método especial para campos de tempo - pré-preenche com valor padrão
    onTimeFocus(event: any, fieldName: string, defaultValue: string) {
        const field = this.cadastroForm.get(fieldName);
        const input = event.target;
        const ionItem = input.closest('ion-item');
        
        // Força o label a subir imediatamente
        if (ionItem) {
            ionItem.classList.add('item-has-focus', 'item-has-value');
        }
        
        if (field && !field.value) {
            setTimeout(() => {
                field.setValue(defaultValue);
            }, 50);
        }
    }

    async carregarDadosTurma() {
        if (!this.turmaId) return;

        const loading = await this.loadingController.create({
            message: 'Carregando dados da turma...'
        });
        await loading.present();

        this.turmaService.buscarPorId(this.turmaId).subscribe({
            next: (turma) => {
                this.turmaData = turma;
                this.preencherFormulario(turma);
                loading.dismiss();
            },
            error: (error) => {
                console.error('Erro ao carregar turma:', error);
                loading.dismiss();
                this.showToast('Erro ao carregar dados da turma', 'danger');
                this.router.navigate(['/sistema/turmas']);
            }
        });
    }

    preencherFormulario(turma: any) {
        this.cadastroForm.patchValue({
            nomeTurma: turma.nomeTurma,
            capacidadeMaxima: turma.capacidadeMaxima,
            horarioInicio: turma.horarioInicio || '08:00',
            horarioFim: turma.horarioFim || '12:00',
            observacoes: turma.observacoes || '',
            ativo: turma.ativo !== false
        });
    }

    async onSubmit() {
        if (this.cadastroForm.valid) {
            const loading = await this.loadingController.create({
                message: this.isEditMode ? 'Atualizando turma...' : 'Criando turma...'
            });
            await loading.present();

            const formData = this.cadastroForm.value;
            const turmaDto: TurmaCadastroDTO = {
                nomeTurma: formData.nomeTurma.trim(),
                capacidadeMaxima: parseInt(formData.capacidadeMaxima),
                horarioInicio: formData.horarioInicio,
                horarioFim: formData.horarioFim,
                observacoes: formData.observacoes?.trim() || undefined,
                ativo: formData.ativo
            };

            const operation = this.isEditMode
                ? this.turmaService.atualizarTurma(this.turmaId!, turmaDto)
                : this.turmaService.criarTurma(turmaDto);

            operation.subscribe({
                next: (response) => {
                    loading.dismiss();
                    const message = this.isEditMode ? 'Turma atualizada com sucesso!' : 'Turma criada com sucesso!';
                    this.showToast(message, 'success');
                    this.router.navigate(['/sistema/turmas']);
                },
                error: (error) => {
                    loading.dismiss();
                    console.error('Erro ao salvar turma:', error);
                    const message = error.error?.message || 'Erro ao salvar turma';
                    this.showToast(message, 'danger');
                }
            });
        } else {
            this.marcarCamposComoTocados();
            this.showToast('Por favor, preencha todos os campos obrigatórios', 'warning');
        }
    }

    marcarCamposComoTocados() {
        Object.keys(this.cadastroForm.controls).forEach(key => {
            this.cadastroForm.get(key)?.markAsTouched();
        });
    }

    async confirmarCancelamento() {
        if (this.cadastroForm.dirty) {
            const alert = await this.alertController.create({
                header: 'Cancelar alterações',
                message: 'Existem alterações não salvas. Deseja realmente cancelar?',
                buttons: [
                    {
                        text: 'Continuar editando',
                        role: 'cancel'
                    },
                    {
                        text: 'Cancelar alterações',
                        handler: () => {
                            this.router.navigate(['/sistema/turmas']);
                        }
                    }
                ]
            });

            await alert.present();
        } else {
            this.router.navigate(['/sistema/turmas']);
        }
    }

    async confirmarExclusao() {
        const alert = await this.alertController.create({
            header: 'Confirmar Exclusão',
            message: 'Tem certeza que deseja excluir esta turma? Esta ação não pode ser desfeita.',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Excluir',
                    role: 'destructive',
                    handler: () => {
                        this.excluirTurma();
                    }
                }
            ]
        });

        await alert.present();
    }

    async excluirTurma() {
        const loading = await this.loadingController.create({
            message: 'Excluindo turma...'
        });
        await loading.present();

        this.turmaService.excluirTurma(this.turmaId!).subscribe({
            next: () => {
                loading.dismiss();
                this.showToast('Turma excluída com sucesso!', 'success');
                this.router.navigate(['/sistema/turmas']);
            },
            error: (error) => {
                loading.dismiss();
                console.error('Erro ao excluir turma:', error);
                const message = error.error?.message || 'Erro ao excluir turma';
                this.showToast(message, 'danger');
            }
        });
    }

    limparFormulario() {
        this.cadastroForm.reset({
            nomeTurma: '',
            capacidadeMaxima: 20,
            periodo: 'manha',
            horarioInicio: '',
            horarioFim: '',
            observacoes: '',
            ativo: true
        });
    }

    cancelar() {
        if (this.cadastroForm.dirty) {
            this.confirmarCancelamento();
        } else {
            this.router.navigate(['/sistema/turmas']);
        }
    }

    // Validações personalizadas
    get nomeInvalido() {
        const campo = this.cadastroForm.get('nomeTurma');
        return campo?.invalid && (campo?.dirty || campo?.touched);
    }

    get capacidadeInvalida() {
        const campo = this.cadastroForm.get('capacidadeMaxima');
        return campo?.invalid && (campo?.dirty || campo?.touched);
    }

    get horarioInicioInvalido() {
        const campo = this.cadastroForm.get('horarioInicio');
        return campo?.invalid && (campo?.dirty || campo?.touched);
    }

    get horarioFimInvalido() {
        const campo = this.cadastroForm.get('horarioFim');
        return campo?.invalid && (campo?.dirty || campo?.touched);
    }

    // Mensagens de erro
    getMensagemErroNome(): string {
        const campo = this.cadastroForm.get('nomeTurma');
        if (campo?.errors?.['required']) {
            return 'Nome da turma é obrigatório';
        }
        if (campo?.errors?.['minlength']) {
            return 'Nome deve ter pelo menos 3 caracteres';
        }
        return '';
    }

    getMensagemErroCapacidade(): string {
        const campo = this.cadastroForm.get('capacidadeMaxima');
        if (campo?.errors?.['required']) {
            return 'Capacidade é obrigatória';
        }
        if (campo?.errors?.['min']) {
            return 'Capacidade deve ser pelo menos 1';
        }
        if (campo?.errors?.['max']) {
            return 'Capacidade máxima permitida é 50';
        }
        return '';
    }

    getMensagemErroHorario(): string {
        const inicioInvalido = this.cadastroForm.get('horarioInicio')?.invalid;
        const fimInvalido = this.cadastroForm.get('horarioFim')?.invalid;

        if (inicioInvalido || fimInvalido) {
            return 'Horários de início e fim são obrigatórios';
        }
        return '';
    }

    async showToast(message: string, color: string = 'medium') {
        const toast = await this.toastController.create({
            message,
            duration: 3000,
            color,
            position: 'top'
        });
        toast.present();
    }
}
