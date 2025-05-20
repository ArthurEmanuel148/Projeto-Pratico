import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AlertController, ToastController } from '@ionic/angular';
import { DadosIntegranteRenda } from '../../models/dados-integrante-renda.interface'; // Ajuste o caminho

@Component({
  selector: 'app-etapa-info-renda',
  templateUrl: './etapa-info-renda.component.html',
  styleUrls: ['./etapa-info-renda.component.scss'],
  standalone: false
})
export class EtapaInfoRendaComponent implements OnInit {
  @Input() form!: FormGroup; // Recebe o FormGroup 'infoRenda'
  @Output() formSubmitted = new EventEmitter<void>();

  constructor(
    private fb: FormBuilder,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController
  ) { }

  ngOnInit() {
    if (!this.form) {
      console.error('FormGroup "infoRenda" não fornecido para EtapaInfoRendaComponent');
      // Se a página pai não o criou, pode ser necessário criá-lo aqui (não ideal)
      // this.form = this.fb.group({
      //   integrantesRenda: this.fb.array([this.novoIntegranteForm()], Validators.compose([Validators.required, Validators.minLength(1)])),
      //   enderecoCompleto: ['', Validators.required]
      // });
    } else if (this.integrantesRenda.length === 0) {
      // Garante que há pelo menos um integrante se o form foi passado vazio
      this.adicionarIntegrante();
    }
  }

  get integrantesRenda(): FormArray {
    return this.form.get('integrantesRenda') as FormArray;
  }

  novoIntegranteForm(): FormGroup {
    return this.fb.group({
      nome: ['', Validators.required],
      parentesco: ['', Validators.required],
      rendaMensal: [null, [Validators.required, Validators.min(0)]],
      // Adicionar campos para upload de arquivos aqui no futuro
      // comprovanteRendaFile: [null]
    });
  }

  adicionarIntegrante() {
    this.integrantesRenda.push(this.novoIntegranteForm());
  }

  async removerIntegrante(index: number) {
    if (this.integrantesRenda.length <= 1) {
      const toast = await this.toastCtrl.create({
        message: 'É necessário informar pelo menos um integrante da família.',
        duration: 2000,
        color: 'warning',
        position: 'bottom'
      });
      toast.present();
      return;
    }

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Remoção',
      message: `Tem certeza que deseja remover o Integrante ${index + 1}?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Remover',
          handler: () => {
            this.integrantesRenda.removeAt(index);
          },
        },
      ],
    });
    await alert.present();
  }

  proximo() {
    if (this.form.valid) {
      this.formSubmitted.emit();
    } else {
      this.marcarCamposComoTocados(this.form);
      this.presentToast('Preencha todas as informações de renda corretamente.', 'warning');
    }
  }

  marcarCamposComoTocados(formGroup: FormGroup | FormArray) {
    Object.values(formGroup.controls).forEach(control => {
      if (control instanceof FormGroup || control instanceof FormArray) {
        this.marcarCamposComoTocados(control);
      } else {
        control.markAsTouched();
      }
    });
    if (formGroup instanceof FormArray && formGroup.controls.length === 0 && formGroup.hasError('required')) {
      formGroup.markAsTouched(); // Para FormArray com minLength ou required
    }
  }

  // Lógica para upload de arquivos seria mais complexa
  // onFileSelected(event: any, controlName: string, index?: number) {
  //   const file = event.target.files[0];
  //   if (file) {
  //     if (index !== undefined) {
  //       this.integrantesRenda.at(index).get(controlName)?.setValue(file.name); // Apenas o nome por agora
  //       console.log(`Arquivo para ${controlName} do integrante ${index}:`, file);
  //     } else {
  //       this.form.get(controlName)?.setValue(file.name);
  //       console.log(`Arquivo para ${controlName}:`, file);
  //     }
  //   }
  // }

  async presentToast(message: string, color: 'warning' | 'danger' = 'warning') {
    const toast = await this.toastCtrl.create({ message, duration: 3000, position: 'bottom', color });
    toast.present();
  }
}