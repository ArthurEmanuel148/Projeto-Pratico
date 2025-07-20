import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';

interface UserInfo {
  pessoaId: number;
  nomePessoa: string;
  cpfPessoa: string;
  usuario: string;
  tipo: string;
  dtNascPessoa?: string;
  caminhoImagem?: string;
}

@Component({
  selector: 'app-user-info-header',
  templateUrl: './user-info-header.component.html',
  styleUrls: ['./user-info-header.component.scss'],
  standalone: false
})
export class UserInfoHeaderComponent implements OnInit {
  userInfo: UserInfo | null = null;
  loading = true;

  constructor(
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    const usuario = this.authService.getFuncionarioLogado();

    if (!usuario) {
      this.loading = false;
      return;
    }

    // Usar dados do AuthService diretamente (já temos todas as informações necessárias)
    this.userInfo = {
      pessoaId: usuario.pessoaId || usuario.pessoa?.idPessoa || 0,
      nomePessoa: usuario.nomePessoa || usuario.pessoa?.nmPessoa || 'Usuário',
      cpfPessoa: usuario.pessoa?.cpfPessoa || '',
      usuario: usuario.usuario,
      tipo: usuario.tipo || 'funcionario',
      dtNascPessoa: usuario.pessoa?.dtNascPessoa,
      caminhoImagem: usuario.pessoa?.caminhoImagem
    };

    this.loading = false;
  }

  getTipoUsuarioDisplay(): string {
    if (!this.userInfo) return '';

    switch (this.userInfo.tipo) {
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'funcionario':
        return 'Funcionário';
      case 'responsavel':
        return 'Responsável';
      default:
        return 'Usuário';
    }
  }

  getInitials(): string {
    if (!this.userInfo) return 'U';

    const names = this.userInfo.nomePessoa.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }

  onLogout() {
    this.authService.logout();
  }
}
