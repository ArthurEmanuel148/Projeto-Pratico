import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: false,
})
export class LoginPage {

  constructor(private router: Router) { } // Injete o Router se necessário

  onLogin() {
    // Aqui você colocaria a lógica de login
    // Por exemplo, pegar os valores dos inputs, chamar um serviço, etc.
    console.log('Botão Entrar clicado');
    // Exemplo de navegação após login (descomente e ajuste a rota)
    // this.router.navigate(['/home']);
  }

  onForgotPassword() {
    // Lógica para "Esqueci minha senha"
    console.log('Link Esqueci minha senha clicado');
    // Exemplo: this.router.navigate(['/forgot-password']);
  }
}
