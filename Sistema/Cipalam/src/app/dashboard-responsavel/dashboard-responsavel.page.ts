import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, LoadingController, ToastController, ModalController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { AuthService } from '../core/services/auth.service';

// Interface local para evitar problemas de dependência
interface InteresseMatricula {
  id: number;
  protocolo: string;
  nomeResponsavel: string;
  cpfResponsavel: string;
  telefoneResponsavel: string;
  emailResponsavel: string;
  nomeAluno: string;
  dataNascimentoAluno: string;
  tipoCota: 'livre' | 'economica' | 'funcionario';
  status: 'interesse_declarado' | 'matricula_iniciada' | 'documentos_pendentes' | 'documentos_completos' | 'matricula_aprovada' | 'matricula_cancelada';
  dataEnvio: string;
  dataInicioMatricula?: string;
  funcionarioResponsavel?: string;
  observacoes?: string;
}

@Component({
  selector: 'app-dashboard-responsavel',
  templateUrl: './dashboard-responsavel.page.html',
  styleUrls: ['./dashboard-responsavel.page.scss'],
  standalone: false
})
export class DashboardResponsavelPage implements OnInit, OnDestroy {
  // Estado da página
  carregando = true;
  statusMatricula: InteresseMatricula | null = null;

  // Subscriptions
  private subscriptions: Subscription[] = [];

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController,
    private modalController: ModalController
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  async carregarDados() {
    const loading = await this.loadingController.create({
      message: 'Carregando dados...'
    });
    await loading.present();

    try {
      // Carregar dados de matrícula mockados por enquanto
      this.statusMatricula = {
        id: 1,
        protocolo: 'MAT-2025-001',
        nomeResponsavel: 'João Silva',
        cpfResponsavel: '123.456.789-00',
        telefoneResponsavel: '(11) 99999-9999',
        emailResponsavel: 'joao@email.com',
        nomeAluno: 'Pedro Silva',
        dataNascimentoAluno: '2015-03-15',
        tipoCota: 'livre',
        status: 'interesse_declarado',
        dataEnvio: new Date().toISOString()
      };

      this.carregando = false;
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.mostrarToast('Erro ao carregar dados', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async mostrarToast(mensagem: string, cor: string = 'success') {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: cor,
      position: 'top'
    });
    toast.present();
  }

  doRefresh(event: any) {
    this.carregarDados().finally(() => {
      event.target.complete();
    });
  }

  // Navegação
  irParaDeclaracaoInteresse() {
    this.router.navigate(['/interesse-matricula/declaracao-interesse']);
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Confirmar Logout',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/autenticacao/login']);
          }
        }
      ]
    });
    await alert.present();
  }
}
