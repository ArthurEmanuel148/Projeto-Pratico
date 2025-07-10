import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../../core/services/api-config.service';

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
    private authService: AuthService,
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  ngOnInit() {
    this.loadUserInfo();
  }

  private loadUserInfo() {
    const usuario = this.authService.getFuncionarioLogado();
    
    if (!usuario || !usuario.pessoaId) {
      this.loading = false;
      return;
    }

    // Buscar informações detalhadas do usuário
    const url = `${this.apiConfig.getLoginUrl().replace('/login', '')}/user-info/${usuario.pessoaId}`;
    
    this.http.get<{ success: boolean; [key: string]: any }>(url).subscribe({
      next: (response) => {
        if (response.success) {
          this.userInfo = {
            pessoaId: response['pessoaId'],
            nomePessoa: response['nomePessoa'],
            cpfPessoa: response['cpfPessoa'],
            usuario: response['usuario'],
            tipo: response['tipo'],
            dtNascPessoa: response['dtNascPessoa'],
            caminhoImagem: response['caminhoImagem']
          };
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar informações do usuário:', error);
        // Usar dados básicos do AuthService como fallback
        this.userInfo = {
          pessoaId: usuario.pessoaId,
          nomePessoa: usuario.nomePessoa || usuario.pessoa?.nmPessoa || 'Usuário',
          cpfPessoa: usuario.pessoa?.cpfPessoa || '',
          usuario: usuario.usuario,
          tipo: usuario.tipo || 'funcionario'
        };
        this.loading = false;
      }
    });
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
