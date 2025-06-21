import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Removido ActivatedRoute se não usar para edição aqui
import { ToastController, NavController, ModalController } from '@ionic/angular';
import { Funcionario } from '../models/funcionario.interface';
import { PermissoesFuncionarioComponent } from '../components/permissoes-funcionario/permissoes-funcionario.component'; // Ajuste o caminho
// import { FuncionarioService } from '../../services/funcionario.service';

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
    private modalController: ModalController
    // private funcionarioService: FuncionarioService
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
    const funcionarioParaSalvar: Funcionario = {
      ...dadosBasicos,
      permissoes: permissoes,
      tipo: 'funcionario' // importante para diferenciar no login
    };

    console.log('DADOS FINAIS DO FUNCIONÁRIO PARA SALVAR:', funcionarioParaSalvar);

    // --- INÍCIO: Chamada ao backend (deixe comentado até implementar) ---
    // try {
    //   await this.funcionarioService.createFuncionario(funcionarioParaSalvar).toPromise();
    //   this.presentToast('Funcionário cadastrado com sucesso!');
    //   this.cadastroForm.reset();
    //   this.navCtrl.navigateBack('/paineis/gerenciamento-funcionarios');
    // } catch (error) {
    //   console.error('Erro ao cadastrar funcionário:', error);
    //   this.presentToast('Erro ao cadastrar funcionário. Tente novamente.');
    // }
    // --- FIM: Chamada ao backend ---

    // --- INÍCIO: Salvamento mock no localStorage ---
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    usuarios.push(funcionarioParaSalvar);
    localStorage.setItem('usuarios', JSON.stringify(usuarios));
    // --- FIM: Salvamento mock ---

    this.presentToast('Cadastro finalizado! Funcionário salvo.');
    this.cadastroForm.reset();
    this.navCtrl.navigateBack('/paineis/gerenciamento-funcionarios');
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