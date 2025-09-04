import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { MatriculaService } from '../../services/matricula.service';
import { ResponsavelDocumentosService } from '../../../../core/services/responsavel-documentos.service';

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
  enderecoCompleto = '';

  // Novos campos para documentos enviados
  documentosEnviados: any[] = [];
  carregandoDocumentos = false;

  constructor(
    private route: ActivatedRoute,
    private interesseMatriculaService: InteresseMatriculaService,
    private matriculaService: MatriculaService,
    private responsavelDocumentosService: ResponsavelDocumentosService,
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

            // Calcular idades para os integrantes
            this.calcularIdades();

            // Calcular renda familiar e per capita
            this.calcularRendas();
          } catch (error) {
            console.error('Erro ao processar integrantes de renda:', error);
            this.integrantesRenda = [];
          }
        } else if (declaracao.infoRenda?.integrantesRenda) {
          try {
            this.integrantesRenda = typeof declaracao.infoRenda.integrantesRenda === 'string'
              ? JSON.parse(declaracao.infoRenda.integrantesRenda)
              : declaracao.infoRenda.integrantesRenda;

            // Calcular idades para os integrantes
            this.calcularIdades();

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
        } else if (declaracao.horariosVaga?.horariosSelecionados) {
          try {
            this.horariosSelecionados = typeof declaracao.horariosVaga.horariosSelecionados === 'string'
              ? JSON.parse(declaracao.horariosVaga.horariosSelecionados)
              : declaracao.horariosVaga.horariosSelecionados;
          } catch (error) {
            console.error('Erro ao processar horários selecionados:', error);
            this.horariosSelecionados = [];
          }
        }

        // Montar endereço completo
        this.montarEnderecoCompleto();

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

          // Carregar documentos já enviados
          this.carregarDocumentosEnviados();
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

    // Navegar para página de seleção de turma no contexto administrativo
    this.router.navigate(['/sistema/selecao-turma', this.declaracao.id]);
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
    if (this.integrantesRenda && this.integrantesRenda.length > 0) {
      this.rendaFamiliarCalculada = this.integrantesRenda.reduce((total, integrante) => {
        return total + (integrante.renda || 0);
      }, 0);

      const numIntegrantes = this.declaracao?.numeroIntegrantes || this.integrantesRenda.length;
      this.rendaPerCapitaCalculada = numIntegrantes > 0 ? this.rendaFamiliarCalculada / numIntegrantes : 0;
    }
  }

  private calcularIdades() {
    if (this.integrantesRenda && this.integrantesRenda.length > 0) {
      const dataAtual = new Date();

      this.integrantesRenda = this.integrantesRenda.map(integrante => {
        if (integrante.dataNascimento && !integrante.idade) {
          const dataNascimento = new Date(integrante.dataNascimento);
          const idade = dataAtual.getFullYear() - dataNascimento.getFullYear();
          const mesAtual = dataAtual.getMonth();
          const mesNascimento = dataNascimento.getMonth();

          if (mesAtual < mesNascimento || (mesAtual === mesNascimento && dataAtual.getDate() < dataNascimento.getDate())) {
            integrante.idade = idade - 1;
          } else {
            integrante.idade = idade;
          }
        }
        return integrante;
      });
    }
  }

  private montarEnderecoCompleto() {
    if (this.declaracao) {
      const partes = [];

      if (this.declaracao.logradouro) partes.push(this.declaracao.logradouro);
      if (this.declaracao.numero) partes.push(this.declaracao.numero);
      if (this.declaracao.complemento) partes.push(this.declaracao.complemento);
      if (this.declaracao.bairro) partes.push(this.declaracao.bairro);
      if (this.declaracao.cidade) partes.push(this.declaracao.cidade);
      if (this.declaracao.uf) partes.push(this.declaracao.uf);
      if (this.declaracao.cep) partes.push(`CEP: ${this.declaracao.cep}`);

      this.enderecoCompleto = partes.join(', ');
    }
  }

  /**
   * Carrega documentos já enviados para a matrícula
   */
  private carregarDocumentosEnviados() {
    // Por enquanto, vamos usar um ID fixo para teste (Ana Costa Lima)
    // Em um cenário real, você precisaria mapear o protocolo para o ID da pessoa
    let idResponsavel = 6; // Ana Costa Lima que tem matrícula iniciada

    // Tentativa de encontrar ID baseado no protocolo
    if (this.declaracao?.protocolo === 'MAT-2025-001') {
      idResponsavel = 4; // Ana Silva Santos
    } else if (this.declaracao?.protocolo === 'MAT-1756957725758') {
      idResponsavel = 6; // Ana Costa Lima
    }

    this.carregandoDocumentos = true;
    console.log('🔍 Carregando documentos enviados para o responsável:', idResponsavel);

    this.responsavelDocumentosService.getDocumentosPorFamilia(idResponsavel).subscribe({
      next: (familiaDocumentos) => {
        console.log('📋 Documentos da família recebidos:', familiaDocumentos);

        // Flatar todos os documentos de todas as pessoas
        this.documentosEnviados = [];
        familiaDocumentos.documentosPorPessoa.forEach(pessoaDoc => {
          pessoaDoc.documentos.forEach(doc => {
            this.documentosEnviados.push({
              ...doc,
              nomeResponsavel: pessoaDoc.pessoa.nome,
              parentesco: pessoaDoc.pessoa.parentesco
            });
          });
        });

        this.carregandoDocumentos = false;
        console.log('✅ Documentos enviados carregados:', this.documentosEnviados);
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar documentos enviados:', error);
        this.carregandoDocumentos = false;
        this.documentosEnviados = [];
      }
    });
  }

  /**
   * Abre/visualiza um documento específico
   */
  abrirDocumento(documento: any) {
    console.log('🔑 Abrindo documento:', documento);

    if (documento.nomeArquivo) {
      // Aqui você pode implementar a lógica para abrir/baixar o arquivo
      // Por exemplo, uma modal ou navegação para uma página de visualização
      this.mostrarInfo(`Documento: ${documento.tipoDocumento.nome}\nArquivo: ${documento.nomeArquivo}\nStatus: ${documento.statusDescricao}`);
    } else {
      this.mostrarInfo(`Este documento ainda não foi anexado.\nTipo: ${documento.tipoDocumento.nome}\nStatus: ${documento.statusDescricao}`);
    }
  }

  /**
   * Retorna a cor baseada no status do documento
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'aprovado':
        return 'success';
      case 'anexado':
        return 'primary';
      case 'rejeitado':
        return 'danger';
      case 'pendente':
      default:
        return 'warning';
    }
  }

  private async mostrarInfo(mensagem: string) {
    const alert = await this.alertController.create({
      header: 'Informações do Documento',
      message: mensagem,
      buttons: ['Fechar']
    });
    await alert.present();
  }
}
