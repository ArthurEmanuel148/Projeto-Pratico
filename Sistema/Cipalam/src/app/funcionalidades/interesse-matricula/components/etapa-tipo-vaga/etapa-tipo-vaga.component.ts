import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-etapa-tipo-vaga',
  templateUrl: './etapa-tipo-vaga.component.html',
  styleUrls: ['./etapa-tipo-vaga.component.scss'],
  standalone: false
})
export class EtapaTipoVagaComponent implements OnInit {
  @Input() form!: FormGroup; // Recebe o FormGroup 'tipoVaga'
  @Output() formSubmitted = new EventEmitter<void>();

  explicacaoCotas = {
    funcionario: "Cota destinada exclusivamente a filhos(as) ou dependentes legais de funcionários(as) ativos(as) da instituição.",
    economica: "Cota destinada a famílias com base em critérios socioeconômicos. Será necessário o preenchimento detalhado de informações de renda e composição familiar, além da apresentação de documentos comprobatórios em etapa posterior.",
    livre: "Cota de ampla concorrência, aberta a toda a comunidade, sem requisitos específicos de renda ou vínculo empregatício com a instituição."
  };

  constructor() { }

  ngOnInit() {
    if (!this.form) {
      console.error('FormGroup "tipoVaga" não fornecido para EtapaTipoVagaComponent');
    }
  }

  proximo() {
    if (this.form.valid) {
      this.formSubmitted.emit();
    } else {
      this.form.get('tipoCota')?.markAsTouched();
      // Adicionar um toast aqui seria uma boa ideia para feedback
      console.log('Formulário tipoVaga inválido:', this.form.value, this.form.errors);
    }
  }
}