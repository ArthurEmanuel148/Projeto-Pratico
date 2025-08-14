import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { Funcionario } from '../models/funcionario.interface';
import { PermissoesFuncionarioComponent } from '../components/permissoes-funcionario/permissoes-funcionario.component';
import { FuncionarioService } from '../../../core/services/funcionario.service';

@Component({
  selector: 'app-cadastro-funcionario',
  templateUrl: './cadastro-funcionario.page.html',
  styleUrls: ['./cadastro-funcionario.page.scss'],
  standalone: false
})
export class CadastroFuncionarioPage implements OnInit {
  cadastroForm: FormGroup;
  // isEditMode: boolean = false; // Para futuro modo de edição
  // funcionarioId: string | number | null = null; // Para futuro modo de edição

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastCtrl: ToastController,
    private navCtrl: NavController,
    private modalController: ModalController,
    private funcionarioService: FuncionarioService
  ) {
    this.cadastroForm = this.fb.group({
      nomeCompleto: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      dataNascimento: ['', Validators.required],
      dataEntradaInstituto: ['', Validators.required],
      telefone: ['', Validators.required],
      usuarioSistema: ['', Validators.required],
      senhaSistema: ['', Validators.required]
    });
  }

  ngOnInit() {
    // Lógica para modo de edição viria aqui
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
        'nomeFuncionario': dadosBasicosFuncionario.nomeCompleto
      },
      cssClass: 'permissoes-modal-css' // Adicione estilos no global.scss ou no scss da página
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss();

    if (role === 'confirmar' && data) {
      const permissoesSelecionadas = data;
      this.finalizarCadastroCompleto(dadosBasicosFuncionario, permissoesSelecionadas);
    } else {
      console.log('Configuração de permissões cancelada.');
    }
  }

  async finalizarCadastroCompleto(dadosBasicos: any, permissoes: Record<string, boolean>) {
    const funcionarioParaSalvar = {
      ...dadosBasicos,
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

  async presentToast(message: string) {
    const toast = await this.toastCtrl.create({
      message: message,
      duration: 3000,
      position: 'bottom'
    });
    toast.present();
  }
}
