import { Component } from '@angular/core';
import { Router } from '@angular/router';

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

  constructor(private router: Router) { }

  onLogin() {
    this.erro = '';

    // 1. Verifica se é responsável (mock)
    const responsavel = JSON.parse(localStorage.getItem('usuarioResponsavel') || '{}');
    if (responsavel.usuario === this.usuario && responsavel.senha === this.senha) {
      // Redireciona para o painel do responsável
      this.router.navigate(['/paineis/dashboard-responsavel']);
      return;
    }

    // 2. Verifica se é funcionário (mock)
    // Exemplo: supondo que você tenha um array de funcionários no localStorage
    const funcionarios = JSON.parse(localStorage.getItem('funcionarios') || '[]');
    const funcionario = funcionarios.find((f: any) => f.usuario === this.usuario && f.senha === this.senha);
    if (funcionario) {
      this.router.navigate(['/painel-funcionario']);
      return;
    }

    // 3. Se não encontrou, mostra erro
    this.erro = 'Usuário ou senha inválidos.';
  }

  onForgotPassword() {
    // Lógica para "Esqueci minha senha"
    console.log('Link Esqueci minha senha clicado');
    // Exemplo: this.router.navigate(['/forgot-password']);
  }
}
