// src/app/funcionalidades/interesse-matricula/components/etapa-horarios-vaga/etapa-horarios-vaga.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormControl, Validators } from '@angular/forms'; // FormGroup não é mais necessário aqui
import { ToastController } from '@ionic/angular';

@Component({
  selector: 'app-etapa-horarios-vaga',
  templateUrl: './etapa-horarios-vaga.component.html',
  styleUrls: ['./etapa-horarios-vaga.component.scss'], 
  standalone: false
})
export class EtapaHorariosVagaComponent implements OnInit {
  @Input() formArray!: FormArray; // Recebe o FormArray 'horariosSelecionados' da página principal
  @Output() formSubmitted = new EventEmitter<void>();

  opcoesHorario = [
    { id: 'segundaManha', label: 'Segunda-feira - Manhã' },
    { id: 'segundaTarde', label: 'Segunda-feira - Tarde' },
    { id: 'tercaManha', label: 'Terça-feira - Manhã' },
    { id: 'tercaTarde', label: 'Terça-feira - Tarde' },
    // Adicione mais opções conforme necessário
    // { id: 'quartaManha', label: 'Quarta-feira - Manhã' },
    // { id: 'quartaTarde', label: 'Quarta-feira - Tarde' },
    // { id: 'quintaManha', label: 'Quinta-feira - Manhã' },
    // { id: 'quintaTarde', label: 'Quinta-feira - Tarde' },
    // { id: 'sextaManha', label: 'Sexta-feira - Manhã' },
    // { id: 'sextaTarde', label: 'Sexta-feira - Tarde' },
  ];
  maxSelecoes = 2;

  constructor(private fb: FormBuilder, private toastCtrl: ToastController) { }

  ngOnInit() {
    if (!this.formArray) {
      console.error('FormArray não foi fornecido para EtapaHorariosVagaComponent!');
      // Idealmente, a página pai sempre fornecerá um FormArray inicializado.
      // Se for necessário criar aqui como fallback (não recomendado):
      // this.formArray = this.fb.array([], [Validators.required, Validators.minLength(1), Validators.maxLength(this.maxSelecoes)]);
    }
  }

  // O getter não é mais estritamente necessário se @Input() formArray é usado diretamente no template
  // mas pode ser mantido para consistência ou se a lógica de template precisar dele.
  get horariosSelecionadosArray(): FormArray {
    return this.formArray;
  }

  onHorarioChange(event: CustomEvent, horarioId: string) {
    const isChecked = event.detail.checked;

    if (isChecked) {
      if (this.horariosSelecionadosArray.length < this.maxSelecoes) {
        this.horariosSelecionadosArray.push(this.fb.control(horarioId));
      } else {
        // Se o limite for atingido, desmarcamos o checkbox que acabou de ser clicado.
        // Precisamos encontrar o controle específico para desmarcar visualmente no template
        // ou, mais simplesmente, reverter o estado do checkbox que disparou o evento.
        const checkbox = event.target as HTMLIonCheckboxElement; // Cast para acessar 'checked'
        if (checkbox) {
          checkbox.checked = false;
        }
        this.presentToast(`Você pode selecionar no máximo ${this.maxSelecoes} horários.`);
      }
    } else {
      // Remover o horário se desmarcado
      let i = 0;
      this.horariosSelecionadosArray.controls.forEach((control: any) => { // Usar AbstractControl seria melhor que 'any'
        if (control.value === horarioId) {
          this.horariosSelecionadosArray.removeAt(i);
          return;
        }
        i++;
      });
    }
    // Força a revalidação do FormArray
    this.horariosSelecionadosArray.updateValueAndValidity();
    // console.log('Horários Selecionados (FormArray):', this.horariosSelecionadosArray.value);
  }

  isHorarioSelected(horarioId: string): boolean {
    // Verifica se o valor existe no FormArray
    return this.horariosSelecionadosArray.value.includes(horarioId);
  }

  proximo() {
    // A validação (required, minLength, maxLength) está configurada no FormArray
    // na página principal (DeclaracaoInteressePage).
    if (this.horariosSelecionadosArray.valid) {
      this.formSubmitted.emit();
    } else {
      // Força a exibição de mensagens de erro se houver
      this.horariosSelecionadosArray.markAsTouched();
      this.horariosSelecionadosArray.markAsDirty(); // Garante que o estado 'dirty' também seja considerado para algumas validações

      if (this.horariosSelecionadosArray.hasError('required') || this.horariosSelecionadosArray.hasError('minlength')) {
        this.presentToast('Selecione pelo menos um horário.', 'warning');
      } else if (this.horariosSelecionadosArray.hasError('maxlength')) {
        this.presentToast(`Selecione no máximo ${this.maxSelecoes} horários.`, 'warning');
      } else {
        this.presentToast('Verifique a seleção de horários.', 'warning');
      }
    }
  }

  async presentToast(message: string, color: 'warning' | 'danger' = 'warning') {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom',
      color: color
    });
    toast.present();
  }
}