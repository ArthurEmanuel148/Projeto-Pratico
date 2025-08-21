import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatriculaService } from '../../services/matricula.service';
import { LoadingController, AlertController, ToastController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-inicio-matricula',
  templateUrl: './inicio-matricula.page.html',
  styleUrls: ['./inicio-matricula.page.scss'],
  standalone: false
})
export class InicioMatriculaPage implements OnInit {
  carregando = false;
  matriculaIniciada = false;
  erro: string | null = null;

  // Dados para seleção
  interesses: any[] = [];
  funcionarios: any[] = [];

  // Seleções do usuário
  interesseSelecionado: any = null;
  funcionarioSelecionado: number | null = null;
  observacoes = '';

  // Resultado
  resultadoMatricula: any = null;
  documentosNecessarios: any[] = [];

  private apiUrl = 'http://localhost:8080/api';

  constructor(
    private matriculaService: MatriculaService,
    private router: Router,
    private http: HttpClient,
    private loadingController: LoadingController,
    private alertController: AlertController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.carregarDados();
  }

  async carregarDados() {
    const loading = await this.loadingController.create({
      message: 'Carregando dados...'
    });
    await loading.present();

    try {
      // Carregar interesses pendentes
      const interessesResponse = await this.http.get<any[]>(`${this.apiUrl}/interesse-matricula`).toPromise();
      this.interesses = interessesResponse?.filter(i => i.status === 'interesse_declarado') || [];

      // Carregar funcionários (usando dados mockados por enquanto)
      this.funcionarios = [
        { idPessoa: 1, nmPessoa: 'Administrador do Sistema' },
        { idPessoa: 2, nmPessoa: 'João Professor Silva' }
      ];

    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.mostrarErro('Erro ao carregar dados necessários');
    } finally {
      loading.dismiss();
    }
  }

  async iniciarMatricula() {
    if (!this.interesseSelecionado || !this.funcionarioSelecionado) {
      this.mostrarErro('Selecione uma declaração e um funcionário');
      return;
    }

    this.carregando = true;
    this.erro = null;

    try {
      const payload = {
        interesseId: this.interesseSelecionado.id,
        funcionarioId: this.funcionarioSelecionado,
        observacoes: this.observacoes || 'Matrícula iniciada via painel administrativo'
      };

      console.log('Iniciando matrícula com payload:', payload);

      const response = await this.http.post<any>(`${this.apiUrl}/matricula/iniciar`, payload).toPromise();

      if (response?.success) {
        this.resultadoMatricula = response;
        this.matriculaIniciada = true;

        // Carregar documentos necessários
        await this.carregarDocumentosNecessarios();

        this.mostrarSucesso('Matrícula iniciada com sucesso!');
      } else {
        this.mostrarErro(response?.message || 'Erro desconhecido ao iniciar matrícula');
      }

    } catch (error: any) {
      console.error('Erro ao iniciar matrícula:', error);
      this.mostrarErro(error?.error?.message || 'Erro ao comunicar com o servidor');
    } finally {
      this.carregando = false;
    }
  }

  async carregarDocumentosNecessarios() {
    if (!this.interesseSelecionado?.tipoCota) return;

    try {
      const response = await this.http.get<any[]>(`${this.apiUrl}/matricula/tipos-documentos?tipoCota=${this.interesseSelecionado.tipoCota}`).toPromise();
      this.documentosNecessarios = response || [];
    } catch (error) {
      console.error('Erro ao carregar documentos:', error);
    }
  }

  async testarLoginResponsavel() {
    if (!this.resultadoMatricula?.credenciaisResponsavel) return;

    const alert = await this.alertController.create({
      header: 'Teste de Login',
      message: `
        <p><strong>Para testar o login do responsável:</strong></p>
        <p>1. Abra uma nova aba</p>
        <p>2. Acesse a página de login</p>
        <p>3. Use as credenciais:</p>
        <p><strong>Email:</strong> ${this.resultadoMatricula.credenciaisResponsavel.usuario}</p>
        <p><strong>Senha:</strong> ${this.resultadoMatricula.credenciaisResponsavel.senha}</p>
      `,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Ir para Login',
          handler: () => {
            // Abrir em nova aba
            window.open('/login', '_blank');
          }
        }
      ]
    });

    await alert.present();
  }

  async copiarTexto(texto: string) {
    try {
      await navigator.clipboard.writeText(texto);
      this.mostrarSucesso('Texto copiado!');
    } catch (error) {
      console.error('Erro ao copiar:', error);
      this.mostrarErro('Erro ao copiar texto');
    }
  }

  voltarParaLista() {
    this.router.navigate(['/sistema/matriculas/declaracoes']);
  }

  iniciarNova() {
    this.matriculaIniciada = false;
    this.resultadoMatricula = null;
    this.documentosNecessarios = [];
    this.interesseSelecionado = null;
    this.funcionarioSelecionado = null;
    this.observacoes = '';
    this.erro = null;

    this.carregarDados();
  }

  tentarNovamente() {
    this.erro = null;
    this.carregarDados();
  }

  getStatusLabel(status: string): string {
    const statusMap: { [key: string]: string } = {
      'interesse_declarado': 'Interesse Declarado',
      'matricula_iniciada': 'Matrícula Iniciada',
      'documentos_pendentes': 'Documentos Pendentes',
      'documentos_completos': 'Documentos Completos',
      'matricula_concluida': 'Matrícula Concluída',
      'matricula_cancelada': 'Matrícula Cancelada'
    };
    return statusMap[status] || status;
  }

  formatarData(data: string): string {
    if (!data) return '';
    return new Date(data).toLocaleString('pt-BR');
  }

  private async mostrarSucesso(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    toast.present();
  }

  private async mostrarErro(mensagem: string) {
    this.erro = mensagem;
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 5000,
      color: 'danger',
      position: 'top'
    });
    toast.present();
  }
}
