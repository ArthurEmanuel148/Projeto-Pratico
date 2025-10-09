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
    manuallyTouchedFields: Set<string> = new Set();

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
    }

    // Métodos para verificar estados de validação
    isFieldValid(fieldName: string): boolean {
        const field = this.cadastroForm.get(fieldName);
        // Só mostra como válido se foi tocado manualmente e tem valor
        return !!(field && field.valid && this.manuallyTouchedFields.has(fieldName) && field.value);
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.cadastroForm.get(fieldName);
        // Só mostra erro se o campo foi tocado manualmente (perdeu foco)
        return !!(field && field.invalid && this.manuallyTouchedFields.has(fieldName));
    }

    getFieldError(fieldName: string): string {
        const field = this.cadastroForm.get(fieldName);
        
        // Só mostra erro se foi tocado manualmente
        if (!field || !field.errors || !this.manuallyTouchedFields.has(fieldName)) {
            return '';
        }

        // Mensagens personalizadas por campo e tipo de erro
        const errorMessages: { [key: string]: { [key: string]: string } } = {
            nomeTurma: {
                required: 'Nome da turma é obrigatório',
                minlength: 'Nome deve ter pelo menos 3 caracteres'
            },
            capacidadeMaxima: {
                required: 'Capacidade máxima é obrigatória',
                min: 'Capacidade deve ser no mínimo 1',
                max: 'Capacidade deve ser no máximo 50'
            },
            horarioInicio: {
                required: 'Horário de início é obrigatório'
            },
            horarioFim: {
                required: 'Horário de fim é obrigatório'
            }
        };

        const fieldErrors = errorMessages[fieldName];
        if (fieldErrors) {
            // Retorna a primeira mensagem de erro encontrada
            for (const errorType in field.errors) {
                if (fieldErrors[errorType]) {
                    return fieldErrors[errorType];
                }
            }
        }

        // Mensagens genéricas se não houver específica
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

        return '';
    }

    // Método para controlar foco nos inputs - força o label a flutuar
    onInputFocus(event: any) {
        const ionItem = event.target.closest('ion-item');
        if (ionItem) {
            ionItem.classList.add('item-has-focus');
        }
    }

    // Método para controlar blur nos inputs - remove placeholder se vazio
    onInputBlur(event: any) {
        const input = event.target;
        const ionItem = input.closest('ion-item');
        
        if (ionItem) {
            if (input.value) {
                ionItem.classList.add('item-has-value');
                ionItem.classList.remove('item-has-focus');
            } else {
                ionItem.classList.remove('item-has-focus', 'item-has-value');
            }
        }

        // Marca o campo como tocado manualmente (só agora pode mostrar validação)
        const ionInput = input.closest('ion-input');
        if (ionInput) {
            const formControlName = ionInput.getAttribute('formControlName');
            if (formControlName) {
                // Adiciona ao conjunto de campos tocados manualmente
                this.manuallyTouchedFields.add(formControlName);

                const field = this.cadastroForm.get(formControlName);
                if (field) {
                    field.markAsTouched();
                }
            }
        }
        
        if (input && !input.value.trim()) {
            input.placeholder = '';
        }
    }

    // Método para focar programaticamente em um input
    focusInput(fieldName: string) {
        // Previne que o evento seja disparado quando já está focado
        if (document.activeElement?.closest('ion-input')?.getAttribute('formControlName') === fieldName) {
            return;
        }

        setTimeout(() => {
            const ionInput = document.querySelector(`ion-input[formControlName="${fieldName}"]`) as any;
            if (ionInput) {
                // Primeiro força o foco visual
                const ionItem = ionInput.closest('ion-item');
                if (ionItem) {
                    ionItem.classList.add('item-has-focus');
                }

                // Depois foca no input nativo
                const nativeInput = ionInput.querySelector('input');
                if (nativeInput) {
                    nativeInput.focus();
                } else {
                    // Fallback: usar o método setFocus do ion-input
                    if (ionInput.setFocus) {
                        ionInput.setFocus();
                    }
                }
            }
        }, 50);
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
        // Limpa campos tocados manualmente para evitar mostrar validação no modo edição
        this.manuallyTouchedFields.clear();
        
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
                    console.error('Erro completo ao salvar turma:', error);
                    console.error('error.error:', error.error);
                    console.error('error.error?.message:', error.error?.message);
                    
                    let message = 'Erro ao salvar turma';
                    
                    // Tentar várias formas de acessar a mensagem
                    if (error.error?.message) {
                        message = error.error.message;
                    } else if (error.error && typeof error.error === 'string') {
                        message = error.error;
                    } else if (error.message) {
                        message = error.message;
                    }
                    
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
                console.error('Erro completo ao excluir turma:', error);
                console.error('error.error:', error.error);
                console.error('error.error?.message:', error.error?.message);
                
                let message = 'Erro ao excluir turma';
                
                // Tentar várias formas de acessar a mensagem
                if (error.error?.message) {
                    message = error.error.message;
                } else if (error.error && typeof error.error === 'string') {
                    message = error.error;
                } else if (error.message) {
                    message = error.message;
                }
                
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
