import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { MaskService } from '../../../../core/services/mask.service';

// Importe o tipo EtapaFormulario da página pai
import { EtapaFormulario } from '../../pages/declaracao-interesse/declaracao-interesse.page';


@Component({
  selector: 'app-etapa-dados-aluno',
  templateUrl: './etapa-dados-aluno.component.html',
  styleUrls: ['./etapa-dados-aluno.component.scss'],
  standalone: false
})
export class EtapaDadosAlunoComponent implements OnInit, OnDestroy {
  @Input() form!: FormGroup; // Recebe o FormGroup 'dadosAluno'
  @Output() formSubmitted = new EventEmitter<void>();

  private dataNascimentoSub!: Subscription;

  // Constante para usar no template, se precisar
  readonly ETAPAS_NAV = { DADOS_ALUNO: 'dadosAluno' as EtapaFormulario };


  constructor(
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private maskService: MaskService
  ) { }

  ngOnInit() {
    if (!this.form) {
      console.error('FormGroup "dadosAluno" não fornecido para EtapaDadosAlunoComponent');
      return;
    }

    // Validação de idade ao carregar o componente, caso já haja um valor
    this.validarIdadeAluno(this.form.get('dataNascimentoAluno')?.value, false); // false para não mostrar alerta ao carregar

    // Ouvir mudanças na data de nascimento para validação dinâmica
    const dataNascCtrl = this.form.get('dataNascimentoAluno');
    if (dataNascCtrl) {
      this.dataNascimentoSub = dataNascCtrl.valueChanges.subscribe(value => {
        this.validarIdadeAluno(value, false); // Não mostrar alerta a cada mudança
      });
    }
  }

  ngOnDestroy() {
    if (this.dataNascimentoSub) {
      this.dataNascimentoSub.unsubscribe();
    }
  }

  get dataNascimentoAlunoCtrl(): AbstractControl | null {
    return this.form.get('dataNascimentoAluno');
  }


  proximo() {
    this.marcarCamposComoTocados();
    // A validação de idade deve mostrar um alerta e setar o erro no controle
    if (this.form.valid && this.validarIdadeAluno(this.dataNascimentoAlunoCtrl?.value, true)) {
      this.formSubmitted.emit();
    } else if (!this.form.valid) {
      this.presentToast('Preencha todos os campos do aluno corretamente.', 'warning');
    }
    // Se a idade for inválida, o alerta já foi mostrado pela validarIdadeAluno com mostrarAlerta=true
  }

  marcarCamposComoTocados() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  validarIdadeAluno(dataNascimentoStr: string | null | undefined, mostrarAlerta: boolean): boolean {
    const dataNascCtrl = this.dataNascimentoAlunoCtrl;
    if (!dataNascCtrl) return true; // Não pode validar se o controle não existe

    // Limpar erros customizados de idade antes de revalidar
    let currentErrors = { ...dataNascCtrl.errors };
    delete currentErrors['idadeInvalida'];
    delete currentErrors['dataFutura'];
    delete currentErrors['dataInvalida'];

    if (!dataNascimentoStr) {
      dataNascCtrl.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
      return !dataNascCtrl.hasError('required'); // Validação de required é do Angular
    }

    const dataNascimento = new Date(dataNascimentoStr);
    // Ajuste para datas de input tipo "date" que podem vir como UTC meia-noite
    const dataNascimentoLocal = new Date(dataNascimento.getUTCFullYear(), dataNascimento.getUTCMonth(), dataNascimento.getUTCDate());

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0); // Normaliza para comparar apenas datas

    if (isNaN(dataNascimentoLocal.getTime())) {
      if (mostrarAlerta) this.mostrarAlertaIdadeInvalida("Data de nascimento inválida.");
      currentErrors['dataInvalida'] = true;
      dataNascCtrl.setErrors(currentErrors);
      return false;
    }

    if (dataNascimentoLocal > hoje) {
      if (mostrarAlerta) this.mostrarAlertaIdadeInvalida("Data de nascimento não pode ser uma data futura.");
      currentErrors['dataFutura'] = true;
      dataNascCtrl.setErrors(currentErrors);
      return false;
    }

    let idade = hoje.getFullYear() - dataNascimentoLocal.getFullYear();
    const mes = hoje.getMonth() - dataNascimentoLocal.getMonth();
    if (mes < 0 || (mes === 0 && hoje.getDate() < dataNascimentoLocal.getDate())) {
      idade--;
    }

    const idadeValida = idade >= 6 && idade <= 10;
    if (!idadeValida) {
      if (mostrarAlerta) this.mostrarAlertaIdadeInvalida();
      currentErrors['idadeInvalida'] = true;
      dataNascCtrl.setErrors(currentErrors);
      return false;
    }

    dataNascCtrl.setErrors(Object.keys(currentErrors).length > 0 ? currentErrors : null);
    return true;
  }

  async mostrarAlertaIdadeInvalida(customMessage?: string) {
    const alert = await this.alertCtrl.create({
      header: 'Atenção - Idade do Aluno',
      message: customMessage || 'A idade do aluno(a) deve estar entre 6 e 10 anos completos para esta modalidade de matrícula. Por favor, verifique a data de nascimento.',
      buttons: ['OK']
    });
    await alert.present();
  }

  async presentToast(message: string, color: 'warning' | 'danger' = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom', color });
    toast.present();
  }

  /**
   * Aplica máscara de CPF no campo
   */
  onCpfInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyCpfMask(value);
    this.form.get('cpfAluno')?.setValue(maskedValue);
  }
}