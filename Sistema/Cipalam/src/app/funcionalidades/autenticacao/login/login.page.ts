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

    // Busca no vetor único de usuários
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]');
    const usuarioLogado = usuarios.find((u: any) =>
      u.usuarioSistema === this.usuario && u.senhaSistema === this.senha
    );

    if (usuarioLogado) {
      localStorage.setItem('usuarioLogado', JSON.stringify(usuarioLogado));
      if (usuarioLogado.tipo === 'responsavel') {
        this.router.navigate(['/paineis/dashboard-responsavel']);
      } else {
        this.router.navigate(['/paineis/painel-funcionario']);
      }
      return;
    }

    // Se não encontrou, mostra erro
    this.erro = 'Usuário ou senha inválidos.';
  }

  onForgotPassword() {
    // Lógica para "Esqueci minha senha"
    console.log('Link Esqueci minha senha clicado');
    // Exemplo: this.router.navigate(['/forgot-password']);
  }
}
