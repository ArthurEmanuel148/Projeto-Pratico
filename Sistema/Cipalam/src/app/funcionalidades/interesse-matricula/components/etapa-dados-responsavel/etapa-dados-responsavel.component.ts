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