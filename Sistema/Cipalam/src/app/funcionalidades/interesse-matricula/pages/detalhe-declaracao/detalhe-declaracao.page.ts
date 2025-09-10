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
  // Campos para documentos enviados (removido documentosNecessarios)
  integrantesRenda: any[] = [];
  horariosSelecionados: string[] = [];
  rendaFamiliarCalculada = 0;
  rendaPerCapitaCalculada = 0;
  enderecoCompleto = '';

  // Campos para documentos enviados
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
  async abrirDocumento(documento: any) {
    console.log('🔑 Abrindo documento completo:', documento);
    console.log('📂 Campos disponíveis:', Object.keys(documento));

    // O backend está retornando o caminho completo no campo 'nomeArquivo'
    // mas deveríamos verificar se existe arquivo anexado
    let caminhoCompleto = documento.nomeArquivo; // Este campo tem o caminho completo do backend

    if (!caminhoCompleto || caminhoCompleto === 'null') {
      this.mostrarInfo(`Este documento ainda não foi anexado.\nTipo: ${documento.tipoDocumento?.nome || documento.nomeDocumento}\nStatus: ${documento.statusDescricao}`);
      return;
    }

    try {
      // Extrair apenas o nome do arquivo do caminho completo
      const nomeArquivoFinal = caminhoCompleto.split('/').pop();
      const urlArquivo = `http://localhost:8080/cipalam_documentos/${nomeArquivoFinal}`;

      console.log('🔗 Abrindo URL:', urlArquivo);
      console.log('📄 Tipo de arquivo:', documento.tipoArquivo);
      console.log('📁 Caminho completo:', caminhoCompleto);
      console.log('📄 Nome do arquivo extraído:', nomeArquivoFinal);

      // Detectar o tipo de arquivo para abrir adequadamente
      const tipoArquivo = documento.tipoArquivo?.toLowerCase() || '';
      const nomeArquivoLower = nomeArquivoFinal.toLowerCase();

      if (tipoArquivo.includes('pdf') || nomeArquivoLower.endsWith('.pdf')) {
        // PDFs: abrir diretamente no visualizador do navegador
        window.open(urlArquivo, '_blank');
      } else if (tipoArquivo.includes('image') ||
        nomeArquivoLower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
        // Imagens (câmera, galeria, etc): abrir em uma página customizada
        const newTab = window.open('', '_blank');
        if (newTab) {
          newTab.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>${documento.tipoDocumento?.nome || documento.nomeDocumento} - ${nomeArquivoFinal}</title>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  body { 
                    margin: 0; 
                    padding: 20px;
                    background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); 
                    font-family: 'Segoe UI', Arial, sans-serif;
                    display: flex; 
                    flex-direction: column;
                    align-items: center; 
                    min-height: 100vh;
                    color: white;
                  }
                  .header {
                    text-align: center;
                    margin-bottom: 20px;
                  }
                  .header h1 {
                    margin: 0;
                    font-size: 1.5em;
                    font-weight: 300;
                  }
                  .header p {
                    margin: 5px 0;
                    opacity: 0.8;
                  }
                  .image-container {
                    background: white;
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 10px 40px rgba(0,0,0,0.3);
                    max-width: 90vw;
                    max-height: 80vh;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                  }
                  img { 
                    max-width: 100%; 
                    max-height: 70vh; 
                    object-fit: contain; 
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.1);
                  }
                  .loading {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 10px;
                  }
                  .spinner {
                    border: 3px solid rgba(255,255,255,0.3);
                    border-top: 3px solid white;
                    border-radius: 50%;
                    width: 30px;
                    height: 30px;
                    animation: spin 1s linear infinite;
                  }
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                </style>
              </head>
              <body>
                <div class="header">
                  <h1>${documento.tipoDocumento?.nome || documento.nomeDocumento}</h1>
                  <p>📱 ${nomeArquivoFinal}</p>
                </div>
                <div class="image-container">
                  <div class="loading" id="loading">
                    <div class="spinner"></div>
                    <p>Carregando imagem...</p>
                  </div>
                  <img id="document-image" src="${urlArquivo}" alt="${documento.tipoDocumento?.nome || documento.nomeDocumento}" 
                       style="display: none;" 
                       onload="document.getElementById('loading').style.display='none'; this.style.display='block';"
                       onerror="document.getElementById('loading').innerHTML='<p>❌ Erro ao carregar imagem</p>';" />
                </div>
              </body>
            </html>
          `);
        } else {
          this.mostrarErro('Erro ao abrir documento. Verifique se o bloqueador de pop-ups está desabilitado.');
        }
      } else {
        // Outros tipos de arquivo: abrir diretamente
        window.open(urlArquivo, '_blank');
      }

    } catch (error) {
      console.error('Erro ao abrir documento:', error);
      this.mostrarErro('Erro ao carregar documento. Tente novamente.');
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
