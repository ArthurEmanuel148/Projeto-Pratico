import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { Funcionario } from '../models/funcionario.interface';
import { PermissoesFuncionarioComponent } from '../components/permissoes-funcionario/permissoes-funcionario.component';
import { FuncionarioService } from '../../../core/services/funcionario.service';
import { MaskService } from '../../../core/services/mask.service';
import { CustomValidators } from '../../../core/validators/custom-validators';

@Component({
  selector: 'app-cadastro-funcionario',
  templateUrl: './cadastro-funcionario.page.html',
  styleUrls: ['./cadastro-funcionario.page.scss'],
  standalone: false
})
export class CadastroFuncionarioPage implements OnInit {
  cadastroForm: FormGroup;
  isEditMode: boolean = false;
  funcionarioId: number | null = null;
  funcionarioData: any = null;
  permissoesOriginais: Record<string, boolean> = {};

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private modalController: ModalController,
    private funcionarioService: FuncionarioService,
    private maskService: MaskService
  ) {
    this.cadastroForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      cpf: ['', [CustomValidators.cpfValidator()]], // CPF opcional mas se preenchido deve ser válido
      dataNascimento: ['', Validators.required],
      dataEntradaInstituto: ['', Validators.required],
      telefone: ['', [Validators.required, CustomValidators.phoneValidator()]],
      usuarioSistema: ['', Validators.required],
      senhaSistema: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Verificar se está em modo de edição
    this.route.queryParams.subscribe(params => {
      if (params['id']) {
        this.funcionarioId = parseInt(params['id']);
        this.isEditMode = true;
        this.carregarDadosFuncionario();
      }
    });
  }

  async carregarDadosFuncionario() {
    if (!this.funcionarioId) return;

    try {
      this.funcionarioData = await this.funcionarioService.buscarFuncionarioPorId(this.funcionarioId).toPromise();

      if (this.funcionarioData) {
        console.log('Dados do funcionário carregados:', this.funcionarioData);

        // Preencher o formulário com os dados existentes
        this.cadastroForm.patchValue({
          nomeCompleto: this.funcionarioData.nome || this.funcionarioData.nmPessoa,
          email: this.funcionarioData.email,
          cpf: this.funcionarioData.cpf || this.funcionarioData.cpfPessoa || '',
          dataNascimento: this.formatarDataParaInput(this.funcionarioData.dataNascimento || this.funcionarioData.dtNascPessoa),
          dataEntradaInstituto: this.formatarDataParaInput(this.funcionarioData.dataEntradaInstituto || this.funcionarioData.dataInicio),
          telefone: this.funcionarioData.telefone,
          usuarioSistema: this.funcionarioData.usuario || '',
          senhaSistema: '' // Senha sempre vazia para segurança
        });

        // Armazenar permissões originais
        this.permissoesOriginais = this.funcionarioData.permissoes || {};

        // Tornar senha opcional em modo de edição
        this.cadastroForm.get('senhaSistema')?.setValidators([]);
        this.cadastroForm.get('senhaSistema')?.updateValueAndValidity();
      }
    } catch (error) {
      console.error('Erro ao carregar dados do funcionário:', error);
      this.presentToast('Erro ao carregar dados do funcionário');
    }
  }

  /**
   * Remove máscara do CPF deixando apenas números
   */
  private limparCpf(cpf: string): string {
    return cpf ? cpf.replace(/\D/g, '') : '';
  }

  /**
   * Remove máscara do telefone deixando apenas números
   */
  private limparTelefone(telefone: string): string {
    return telefone ? telefone.replace(/\D/g, '') : '';
  }

  /**
   * Converte data do formato DD/MM/AAAA para AAAA-MM-DD
   */
  private formatarDataParaBackend(data: string): string {
    if (!data) return '';
    
    // Se já está no formato YYYY-MM-DD, retorna como está
    if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
      return data;
    }
    
    // Se está no formato DD/MM/AAAA, converte
    if (data.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
      const [dia, mes, ano] = data.split('/');
      return `${ano}-${mes}-${dia}`;
    }
    
    return '';
  }

  formatarDataParaInput(data: any): string {
    if (!data) return '';

    // Se for string, converter para Date
    let dataObj: Date;
    if (typeof data === 'string') {
      // Se já está no formato YYYY-MM-DD, usar diretamente
      if (data.match(/^\d{4}-\d{2}-\d{2}$/)) {
        return data;
      }
      dataObj = new Date(data);
    } else if (data instanceof Date) {
      dataObj = data;
    } else if (Array.isArray(data) && data.length >= 3) {
      // Se for array [ano, mês, dia]
      dataObj = new Date(data[0], data[1] - 1, data[2]);
    } else {
      return '';
    }

    // Verificar se a data é válida
    if (isNaN(dataObj.getTime())) {
      return '';
    }

    // Formatar para YYYY-MM-DD (formato esperado pelo input date)
    const ano = dataObj.getFullYear();
    const mes = String(dataObj.getMonth() + 1).padStart(2, '0');
    const dia = String(dataObj.getDate()).padStart(2, '0');

    return `${ano}-${mes}-${dia}`;
  }

  async prosseguirParaPermissoes() {
    if (this.cadastroForm.invalid) {
      this.presentToast('Por favor, preencha todos os campos básicos corretamente.');
      Object.values(this.cadastroForm.controls).forEach(control => {
        control.markAsTouched();
      });
      return;
    }

    const dadosBasicosFuncionario = this.cadastroForm.value;

    const modal = await this.modalController.create({
      component: PermissoesFuncionarioComponent,
      componentProps: {
        'nomeFuncionario': dadosBasicosFuncionario.nomeCompleto,
        'permissoesOriginais': this.isEditMode ? this.permissoesOriginais : null,
        'isEditMode': this.isEditMode
      },
      cssClass: 'permissoes-modal-css'
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirmar' && data) {
      const permissoesSelecionadas = data;
      if (this.isEditMode) {
        this.finalizarEdicaoCompleta(dadosBasicosFuncionario, permissoesSelecionadas);
      } else {
        this.finalizarCadastroCompleto(dadosBasicosFuncionario, permissoesSelecionadas);
      }
    } else {
      console.log('Configuração de permissões cancelada.');
    }
  }

  async finalizarCadastroCompleto(dadosBasicos: any, permissoes: Record<string, boolean>) {
    // Limpar e formatar dados antes de enviar
    const funcionarioParaSalvar = {
      ...dadosBasicos,
      cpf: this.limparCpf(dadosBasicos.cpf || ''),
      telefone: this.limparTelefone(dadosBasicos.telefone),
      dataNascimento: this.formatarDataParaBackend(dadosBasicos.dataNascimento),
      dataEntradaInstituto: this.formatarDataParaBackend(dadosBasicos.dataEntradaInstituto),
      permissoes: permissoes,
      tipo: 'funcionario'
    };

    console.log('DADOS FINAIS DO FUNCIONÁRIO PARA SALVAR:', funcionarioParaSalvar);

    try {
      await this.funcionarioService.cadastrarFuncionario(funcionarioParaSalvar).toPromise();
      this.presentToast('Funcionário cadastrado com sucesso!');
      this.cadastroForm.reset();
      this.navCtrl.navigateBack('/sistema/funcionarios/lista');
    } catch (error: any) {
      console.error('Erro ao cadastrar funcionário:', error);

      let mensagemErro = 'Erro ao cadastrar funcionário. Tente novamente.';

      // Verificar se é erro de usuário duplicado
      if (error?.error && typeof error.error === 'string' && error.error.includes('Duplicate entry')) {
        if (error.error.includes('for key \'usuario\'')) {
          mensagemErro = 'Este nome de usuário já existe. Escolha outro nome de usuário.';
        } else if (error.error.includes('for key \'email\'')) {
          mensagemErro = 'Este e-mail já está cadastrado no sistema.';
        } else {
          mensagemErro = 'Já existe um funcionário com essas informações.';
        }
      }

      this.presentToast(mensagemErro);
    }
  }

  async finalizarEdicaoCompleta(dadosBasicos: any, permissoes: Record<string, boolean>) {
    // Limpar e formatar dados antes de enviar
    const funcionarioParaAtualizar = {
      ...dadosBasicos,
      cpf: this.limparCpf(dadosBasicos.cpf || ''),
      telefone: this.limparTelefone(dadosBasicos.telefone),
      dataNascimento: this.formatarDataParaBackend(dadosBasicos.dataNascimento),
      dataEntradaInstituto: this.formatarDataParaBackend(dadosBasicos.dataEntradaInstituto),
      permissoes: permissoes,
      tipo: 'funcionario',
      id: this.funcionarioId
    };

    console.log('DADOS FINAIS DO FUNCIONÁRIO PARA ATUALIZAR:', funcionarioParaAtualizar);
    console.log('ID do funcionário:', this.funcionarioId);
    console.log('Dados básicos:', dadosBasicos);
    console.log('Permissões:', permissoes);

    try {
      const resultado = await this.funcionarioService.atualizarFuncionario(this.funcionarioId!, funcionarioParaAtualizar).toPromise();
      console.log('Resultado da atualização:', resultado);
      this.presentToast('Funcionário atualizado com sucesso!');
      this.navCtrl.navigateBack('/sistema/funcionarios/lista');
    } catch (error: any) {
      console.error('Erro completo ao atualizar funcionário:', error);
      console.error('Status do erro:', error.status);
      console.error('Mensagem do erro:', error.message);
      console.error('Error body:', error.error);

      let mensagemErro = 'Erro ao atualizar funcionário. Tente novamente.';

      if (error?.error) {
        if (typeof error.error === 'string') {
          mensagemErro = error.error;
        } else if (error.error.message) {
          mensagemErro = error.error.message;
        }
      } else if (error.message) {
        mensagemErro = error.message;
      }

      this.presentToast(mensagemErro);
    }
  }

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }

  /**
   * Aplica máscara de CPF no campo
   */
  onCpfInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyCpfMask(value);
    this.cadastroForm.get('cpf')?.setValue(maskedValue);
  }

  /**
   * Aplica máscara de telefone no campo
   */
  onPhoneInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyPhoneMask(value);
    this.cadastroForm.get('telefone')?.setValue(maskedValue);
  }

  /**
   * Controle de placeholder para CPF
   */
  onCpfFocus(event: any) {
    event.target.placeholder = '000.000.000-00';
    // Força o label a subir imediatamente
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  onCpfBlur(event: any) {
    const target = event.target;
    const ionItem = target.closest('ion-item');
    
    if (!target.value) {
      target.placeholder = '';
      if (ionItem) {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    } else {
      if (ionItem) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      }
    }
  }

  /**
   * Controle de placeholder para Telefone
   */
  onPhoneFocus(event: any) {
    event.target.placeholder = '(00) 00000-0000';
    // Força o label a subir imediatamente
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  onPhoneBlur(event: any) {
    const target = event.target;
    const ionItem = target.closest('ion-item');
    
    if (!target.value) {
      target.placeholder = '';
      if (ionItem) {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    } else {
      if (ionItem) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      }
    }
  }

  /**
   * Controle de foco para campos de data
   */
  onDateInput(event: any) {
    const input = event.target;
    const maskedValue = this.maskService.applyDateMask(input.value);
    
    // Encontra o control do formulário
    const controlName = input.getAttribute('formControlName');
    if (controlName && this.cadastroForm.get(controlName)) {
      this.cadastroForm.get(controlName)?.setValue(maskedValue, { emitEvent: false });
    }
  }

  onDateFocus(event: any) {
    const target = event.target;
    // Só adiciona o placeholder quando o usuário clica
    target.placeholder = 'DD/MM/AAAA';
    
    // Força o label a subir imediatamente
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  onDateBlur(event: any) {
    const target = event.target;
    const ionItem = event.target.closest('ion-item');
    
    if (!target.value) {
      target.placeholder = '';
      if (ionItem) {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    } else {
      if (ionItem) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      }
    }
  }

  /**
   * Abre o seletor de data
   */
  async openDatePicker(fieldName: string) {
    const input = document.createElement('input');
    input.type = 'date';
    input.style.visibility = 'hidden';
    input.style.position = 'absolute';
    
    // Se já tem valor no campo, converte para formato date
    const currentValue = this.cadastroForm.get(fieldName)?.value;
    if (currentValue) {
      // Converte DD/MM/AAAA para AAAA-MM-DD
      const dateParts = currentValue.split('/');
      if (dateParts.length === 3) {
        const [day, month, year] = dateParts;
        input.value = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
      }
    }
    
    document.body.appendChild(input);
    
    input.addEventListener('change', (event: any) => {
      const selectedDate = event.target.value;
      if (selectedDate) {
        // Converte AAAA-MM-DD para DD/MM/AAAA
        const [year, month, day] = selectedDate.split('-');
        const formattedDate = `${day}/${month}/${year}`;
        this.cadastroForm.get(fieldName)?.setValue(formattedDate);
        
        // Força o label a ficar flutuando
        setTimeout(() => {
          const ionInput = document.querySelector(`ion-input[formControlName="${fieldName}"]`);
          if (ionInput) {
            const ionItem = ionInput.closest('ion-item');
            if (ionItem) {
              ionItem.classList.add('item-has-value');
            }
          }
        }, 100);
      }
      document.body.removeChild(input);
    });
    
    input.click();
  }

  /**
   * Força o label a flutuar quando o campo recebe foco
   */
  onInputFocus(event: any) {
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      ionItem.classList.add('item-has-focus');
    }
  }

  /**
   * Remove a classe de foco quando o campo perde foco
   */
  onInputBlur(event: any) {
    const ionItem = event.target.closest('ion-item');
    if (ionItem) {
      if (event.target.value) {
        ionItem.classList.add('item-has-value');
        ionItem.classList.remove('item-has-focus');
      } else {
        ionItem.classList.remove('item-has-focus', 'item-has-value');
      }
    }
  }
}
