import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-painel-responsavel',
  templateUrl: './painel-responsavel.page.html',
  styleUrls: ['./painel-responsavel.page.scss'],
  standalone: false,
})
export class PainelResponsavelPage implements OnInit {
  usuarioLogado: any;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.authService.getFuncionarioLogado();
    console.log('Painel Responsável - Usuário logado:', this.usuarioLogado);
  }
}
