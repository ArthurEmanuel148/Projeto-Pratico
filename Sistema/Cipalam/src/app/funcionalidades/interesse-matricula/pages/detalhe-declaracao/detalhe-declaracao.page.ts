import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { MatriculaService } from '../../services/matricula.service';

@Component({
  selector: 'app-detalhe-declaracao',
  templateUrl: './detalhe-declaracao.page.html',
  styleUrls: ['./detalhe-declaracao.page.scss'],
  standalone: false
})
export class DetalheDeclaracaoPage implements OnInit {
  declaracao?: InteresseMatricula;
  carregando = true;
  loginGerado?: { usuario: string, senha: string };
  matriculaIniciada = false;
  processandoMatricula = false;
  documentosNecessarios: any[] = [];
  integrantesRenda: any[] = [];
  horariosSelecionados: string[] = [];
  rendaFamiliarCalculada = 0;
  rendaPerCapitaCalculada = 0;

  constructor(
    private route: ActivatedRoute,
    private interesseMatriculaService: InteresseMatriculaService,
    private matriculaService: MatriculaService,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    const protocolo = this.route.snapshot.paramMap.get('protocolo');
    if (protocolo) {
      this.carregarDeclaracao(protocolo);
    }
  }

  private carregarDeclaracao(protocolo: string) {
    this.interesseMatriculaService.buscarPorProtocolo(protocolo).subscribe({
      next: (declaracao: InteresseMatricula | undefined) => {
        this.declaracao = declaracao;
        this.carregando = false;

        if (!declaracao) {
          this.mostrarErro('Declaração não encontrada');
          return;
        }

        // Processar dados JSON dos integrantes de renda
        if (declaracao.integrantesRenda) {
          try {
            this.integrantesRenda = typeof declaracao.integrantesRenda === 'string'
              ? JSON.parse(declaracao.integrantesRenda)
              : declaracao.integrantesRenda;

            // Calcular renda familiar e per capita
            this.calcularRendas();
          } catch (error) {
            console.error('Erro ao processar integrantes de renda:', error);
            this.integrantesRenda = [];
          }
        }

        // Processar dados JSON dos horários selecionados
        if (declaracao.horariosSelecionados) {
          try {
            this.horariosSelecionados = typeof declaracao.horariosSelecionados === 'string'
              ? JSON.parse(declaracao.horariosSelecionados)
              : declaracao.horariosSelecionados;
          } catch (error) {
            console.error('Erro ao processar horários selecionados:', error);
            this.horariosSelecionados = [];
          }
        }

        // Verificar se a matrícula já foi iniciada
        if (declaracao.dataInicioMatricula) {
          this.matriculaIniciada = true;
          // Simular credenciais baseadas no email do responsável
          this.loginGerado = {
            usuario: declaracao.dadosResponsavel?.emailResponsavel || declaracao.email || 'usuario@temp.com',
            senha: 'temp123456'
          };
          // Carregar documentos necessários baseado no tipo de cota
          this.carregarDocumentosNecessarios(declaracao.tipoVaga?.tipoCota || declaracao.tipoCota);
        }
      },
      error: (error: any) => {
        console.error('Erro ao carregar declaração:', error);
        this.carregando = false;
        this.mostrarErro('Erro ao carregar declaração');
      }
    });
  }

  private carregarDocumentosNecessarios(tipoCota: string | undefined) {
    // Documentos baseados no tipo de cota
    const documentosPorCota: Record<string, any[]> = {
      funcionario: [
        { nome: 'RG do Responsável', obrigatorio: true },
        { nome: 'CPF do Responsável', obrigatorio: true },
        { nome: 'Comprovante de Vínculo Empregatício', obrigatorio: true },
        { nome: 'Declaração de Parentesco', obrigatorio: true }
      ],
      economica: [
        { nome: 'RG do Responsável', obrigatorio: true },
        { nome: 'CPF do Responsável', obrigatorio: true },
        { nome: 'Comprovante de Renda', obrigatorio: true },
        { nome: 'Declaração de Dependentes', obrigatorio: true }
      ],
      livre: [
        { nome: 'RG do Responsável', obrigatorio: true },
        { nome: 'CPF do Responsável', obrigatorio: true },
        { nome: 'Certidão de Nascimento', obrigatorio: true }
      ]
    };

    this.documentosNecessarios = documentosPorCota[tipoCota || 'livre'] || documentosPorCota['livre'];
  }

  async iniciarMatricula() {
    if (!this.declaracao) return;

    const alert = await this.alertController.create({
      header: 'Confirmar Início de Matrícula',
      message: 'Tem certeza que deseja iniciar o processo de matrícula? Será criado um login para o responsável.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Confirmar',
          handler: () => this.processarInicioMatricula()
        }
      ]
    });

    await alert.present();
  }

  private async processarInicioMatricula() {
    if (!this.declaracao) return;

    this.processandoMatricula = true;
    const loading = await this.loadingController.create({
      message: 'Iniciando matrícula...'
    });
    await loading.present();

    try {
      // Preparar dados para envio
      const dadosMatricula = {
        interesseId: this.declaracao.id,
        funcionarioId: 1, // ID do funcionário logado - será pego do AuthService futuramente
        nomeCompleto: this.declaracao.nomeCompleto || this.declaracao.dadosResponsavel?.nomeResponsavel,
        cpf: this.declaracao.cpf || this.declaracao.dadosResponsavel?.cpfResponsavel,
        email: this.declaracao.email || this.declaracao.dadosResponsavel?.emailResponsavel,
        telefone: this.declaracao.telefone || this.declaracao.dadosResponsavel?.telefoneResponsavel,
        tipoCota: this.declaracao.tipoCota || this.declaracao.tipoVaga?.tipoCota
      };

      // Chamar API de iniciar matrícula
      const response = await this.matriculaService.iniciarMatricula(dadosMatricula).toPromise();

      if (response.success) {
        this.loginGerado = response.credenciaisResponsavel;
        this.documentosNecessarios = response.documentosNecessarios || [];
        this.matriculaIniciada = true;

        await this.mostrarSucesso('Matrícula iniciada com sucesso! O responsável já pode fazer login no sistema.');
      } else {
        await this.mostrarErro(response.message || 'Erro ao iniciar matrícula');
      }
    } catch (error: any) {
      console.error('Erro ao iniciar matrícula:', error);
      await this.mostrarErro('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
    } finally {
      await loading.dismiss();
      this.processandoMatricula = false;
    }
  }

  async copiarCredenciais() {
    if (!this.loginGerado) return;

    const credenciais = `Usuário: ${this.loginGerado.usuario}\nSenha: ${this.loginGerado.senha}`;

    try {
      await navigator.clipboard.writeText(credenciais);
      await this.mostrarSucesso('Credenciais copiadas para a área de transferência!');
    } catch (error) {
      // Fallback para navegadores que não suportam clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = credenciais;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      await this.mostrarSucesso('Credenciais copiadas!');
    }
  }

  voltarLista() {
    // Usar rota absoluta correta
    this.router.navigate(['/sistema/matriculas/declaracoes']);
  }

  private async mostrarSucesso(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarErro(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  private calcularRendas() {
    if (!this.integrantesRenda || this.integrantesRenda.length === 0) {
      this.rendaFamiliarCalculada = 0;
      this.rendaPerCapitaCalculada = 0;
      return;
    }

    // Somar todas as rendas dos integrantes
    this.rendaFamiliarCalculada = this.integrantesRenda.reduce((total, integrante) => {
      const renda = parseFloat(integrante.renda) || 0;
      return total + renda;
    }, 0);

    // Calcular renda per capita
    const numeroIntegrantes = this.declaracao?.numeroIntegrantes || this.integrantesRenda.length || 1;
    this.rendaPerCapitaCalculada = this.rendaFamiliarCalculada / numeroIntegrantes;
  }
}
