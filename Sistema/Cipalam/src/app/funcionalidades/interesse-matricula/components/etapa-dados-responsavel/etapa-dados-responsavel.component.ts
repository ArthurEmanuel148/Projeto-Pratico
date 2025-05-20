import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-etapa-dados-responsavel',
  templateUrl: './etapa-dados-responsavel.component.html',
  styleUrls: ['./etapa-dados-responsavel.component.scss'],
  standalone: false
})
export class EtapaDadosResponsavelComponent implements OnInit {
  @Input() form!: FormGroup;
  @Output() formSubmitted = new EventEmitter<void>();

  constructor() { }

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
}