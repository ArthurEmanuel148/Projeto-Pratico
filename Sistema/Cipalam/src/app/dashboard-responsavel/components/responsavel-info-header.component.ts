import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from '../../core/services/api-config.service';

interface ResponsavelInfo {
  pessoaId: number;
  nomePessoa: string;
  cpfPessoa: string;
  usuario: string;
  tipo: string;
  dtNascPessoa?: string;
  caminhoImagem?: string;
}

@Component({
  selector: 'app-responsavel-info-header',
  templateUrl: './responsavel-info-header.component.html',
  styleUrls: ['./responsavel-info-header.component.scss'],
  standalone: false
})
export class ResponsavelInfoHeaderComponent implements OnInit {
  responsavelInfo: ResponsavelInfo | null = null;
  loading = true;

  constructor(
    private authService: AuthService,
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) {}

  ngOnInit() {
    this.loadResponsavelInfo();
  }

  private loadResponsavelInfo() {
    const usuario = this.authService.getFuncionarioLogado();
    
    if (!usuario || !usuario.pessoaId) {
      this.loading = false;
      return;
    }

    // Buscar informações detalhadas do responsável
    const url = `${this.apiConfig.getLoginUrl().replace('/login', '')}/user-info/${usuario.pessoaId}`;
    
    this.http.get<{ success: boolean; [key: string]: any }>(url).subscribe({
      next: (response) => {
        if (response.success) {
          this.responsavelInfo = {
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
        console.error('Erro ao buscar informações do responsável:', error);
        // Usar dados básicos do AuthService como fallback
        this.responsavelInfo = {
          pessoaId: usuario.pessoaId,
          nomePessoa: usuario.nomePessoa || usuario.pessoa?.nmPessoa || 'Responsável',
          cpfPessoa: usuario.pessoa?.cpfPessoa || '',
          usuario: usuario.usuario,
          tipo: usuario.tipo || 'responsavel'
        };
        this.loading = false;
      }
    });
  }

  getInitials(): string {
    if (!this.responsavelInfo) return 'R';
    
    const names = this.responsavelInfo.nomePessoa.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }

  onLogout() {
    this.authService.logout();
  }
}
