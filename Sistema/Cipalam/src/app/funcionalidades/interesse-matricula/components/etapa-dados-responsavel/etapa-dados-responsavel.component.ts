import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { MaskService } from '../../../../core/services/mask.service';

@Component({
  selector: 'app-etapa-dados-responsavel',
  templateUrl: './etapa-dados-responsavel.component.html',
  styleUrls: ['./etapa-dados-responsavel.component.scss'],
  standalone: false
})
export class EtapaDadosResponsavelComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() formSubmitted = new EventEmitter<void>();

  constructor(private maskService: MaskService) { }

  ngOnInit() {
    if (!this.form) {
      console.error('FormGroup não fornecido para EtapaDadosResponsavelComponent!');
    }
  }

  proximo() {
    if (this.form.valid) {
      this.formSubmitted.emit();
    } else {
      this.marcarCamposComoTocados();
    }
  }

  marcarCamposComoTocados() {
    Object.values(this.form.controls).forEach(control => {
      control.markAsTouched();
    });
  }

  /**
   * Verifica se um campo é inválido (tocado ou sujo e com erro)
   */
  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.touched || field.dirty));
  }

  /**
   * Verifica se um campo é válido (tocado ou sujo e sem erro)
   */
  isFieldValid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.valid && (field.touched || field.dirty));
  }

  /**
   * Obtém a mensagem de erro personalizada para um campo
   */
  getFieldError(fieldName: string): string | null {
    const field = this.form.get(fieldName);
    
    if (!field || !field.errors || !(field.touched || field.dirty)) {
      return null;
    }

    const fieldLabels: { [key: string]: string } = {
      'nomeResponsavel': 'Nome completo',
      'cpfResponsavel': 'CPF',
      'dataNascimentoResponsavel': 'Data de nascimento',
      'emailResponsavel': 'E-mail',
      'telefoneResponsavel': 'Telefone'
    };

    const label = fieldLabels[fieldName] || fieldName;

    if (field.errors['required']) {
      return `${label} é obrigatório`;
    }

    if (field.errors['email']) {
      return 'Digite um e-mail válido';
    }

    if (field.errors['cpfInvalido']) {
      return 'CPF inválido';
    }

    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      return `${label} deve ter no mínimo ${minLength} caracteres`;
    }

    if (field.errors['maxlength']) {
      const maxLength = field.errors['maxlength'].requiredLength;
      return `${label} deve ter no máximo ${maxLength} caracteres`;
    }

    return 'Campo inválido';
  }

  /**
   * Aplica máscara de CPF no campo
   */
  onCpfInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyCpfMask(value);
    this.form.get('cpfResponsavel')?.setValue(maskedValue);
  }

  /**
   * Aplica máscara de telefone no campo
   */
  onPhoneInput(event: any) {
    const value = event.target.value;
    const maskedValue = this.maskService.applyPhoneMask(value);
    this.form.get('telefoneResponsavel')?.setValue(maskedValue);
  }
}