import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { LoadingController, AlertController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {
  usuario = '';
  senha = '';
  erro = '';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    private loadingController: LoadingController,
    private alertController: AlertController
  ) { }

  async onLogin() {
    if (!this.usuario || !this.senha) {
      this.erro = 'Por favor, preencha todos os campos.';
      return;
    }

    const loading = await this.loadingController.create({
      message: 'Realizando login...',
      duration: 10000 // máximo 10 segundos
    });

    await loading.present();
    this.isLoading = true;
    this.erro = '';

    try {
      const response = await this.authService.login(this.usuario, this.senha).toPromise();

      await loading.dismiss();
      this.isLoading = false;

      if (response) {
        // Redirecionar baseado no tipo de usuário
        if (response.tipo === 'responsavel') {
          this.router.navigate(['/paineis/dashboard-responsavel']);
        } else {
          this.router.navigate(['/paineis/painel-funcionario']);
        }
      }
    } catch (error: any) {
      await loading.dismiss();
      this.isLoading = false;

      console.error('Erro no login:', error);

      if (error.status === 401) {
        this.erro = 'Usuário ou senha inválidos.';
      } else if (error.status === 0) {
        this.erro = 'Erro de conexão. Verifique se o servidor está rodando.';
      } else {
        this.erro = 'Erro interno do servidor. Tente novamente.';
      }
    }
  }

  async onForgotPassword() {
    const alert = await this.alertController.create({
      header: 'Esqueci minha senha',
      message: 'Funcionalidade em desenvolvimento. Entre em contato com o administrador.',
      buttons: ['OK']
    });

    await alert.present();
  }
}
