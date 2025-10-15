import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, ToastController } from '@ionic/angular';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { MatriculaService } from '../../services/matricula.service';
import { ResponsavelDocumentosService } from '../../../../core/services/responsavel-documentos.service';
import { AuthService } from '../../../../core/services/auth.service';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

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
  processandoFinalizacao = false;
  // Campos para documentos enviados (removido documentosNecessarios)
  integrantesRenda: any[] = [];
  horariosSelecionados: string[] = [];
  rendaFamiliarCalculada = 0;
  rendaPerCapitaCalculada = 0;
  enderecoCompleto = '';

  // Campos para documentos enviados
  documentosEnviados: any[] = [];
  carregandoDocumentos = false;

  // Campos para documentos solicitados
  documentosSolicitados: any[] = [];
  carregandoDocumentosSolicitados = false;

  // Lista unificada de todos os documentos
  todosDocumentos: any[] = [];

  // Controle de categoria de documentos (igual ao painel do responsável)
  categoriaDocumentos = 'todos';

  // Documentos organizados por categoria
  documentosFamilia: any[] = [];
  documentosAluno: any[] = [];
  documentosIntegrantes: Map<string, any[]> = new Map();

  constructor(
    private route: ActivatedRoute,
    private interesseMatriculaService: InteresseMatriculaService,
    private matriculaService: MatriculaService,
    private responsavelDocumentosService: ResponsavelDocumentosService,
    private authService: AuthService,
    private http: HttpClient,
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
        }

        // Sempre carregar documentos para visualização administrativa
        this.carregarDocumentosEnviados();
        if (this.matriculaIniciada) {
          this.carregarDocumentosSolicitados();
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

  private calcularRendas() {
    if (this.integrantesRenda && this.integrantesRenda.length > 0) {
      this.rendaFamiliarCalculada = this.integrantesRenda.reduce((total, integrante) => {
        // Suporta ambos os formatos: renda e rendaMensal
        const valor = integrante.renda || integrante.rendaMensal || 0;
        return total + Number(valor);
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
    if (!this.declaracao) {
      this.carregandoDocumentos = false;
      return;
    }

    // Buscar o ID da declaração para usar o novo endpoint
    const idDeclaracao = this.declaracao.id;

    if (!idDeclaracao) {
      console.warn('Não foi possível determinar o ID da declaração para carregar documentos');
      this.carregandoDocumentos = false;
      this.documentosEnviados = [];
      return;
    }

    this.carregandoDocumentos = true;
    console.log('🔍 Carregando documentos para declaração ID:', idDeclaracao);

    // Usar o novo método específico para declarações
    this.responsavelDocumentosService.getDocumentosPorDeclaracao(idDeclaracao).subscribe({
      next: (documentos: any[]) => {
        console.log('📋 Documentos da matrícula recebidos:', documentos);
        this.documentosEnviados = documentos || [];

        // Organizar por categorias usando a mesma lógica do painel do responsável
        this.organizarDocumentosPorCategoria();
        this.carregandoDocumentos = false;

        console.log('✅ Documentos organizados por categoria');
        console.log('🔧 Estado final:', {
          carregando: this.carregandoDocumentos,
          totalDocumentos: this.documentosEnviados.length,
          familia: this.documentosFamilia.length,
          aluno: this.documentosAluno.length,
          integrantes: this.documentosIntegrantes.size
        });
      },
      error: (error: any) => {
        console.error('❌ Erro ao carregar documentos:', error);
        this.carregandoDocumentos = false;
        this.documentosEnviados = [];
        this.organizarDocumentosPorCategoria();

        console.log('🔧 Estado após erro:', {
          carregando: this.carregandoDocumentos,
          totalDocumentos: this.documentosEnviados.length
        });
      }
    });
  }

  /**
   * Carrega documentos solicitados para a matrícula
   */
  async carregarDocumentosSolicitados() {
    if (!this.declaracao?.id) {
      return;
    }

    this.carregandoDocumentosSolicitados = true;

    try {
      const response = await this.interesseMatriculaService.buscarDocumentosSolicitados(this.declaracao.id).toPromise();

      if (response && response.sucesso) {
        this.documentosSolicitados = response.documentos || [];
        console.log('📋 Documentos solicitados carregados:', this.documentosSolicitados);
      } else {
        console.log('Nenhum documento solicitado encontrado para esta matrícula');
        this.documentosSolicitados = [];
      }
    } catch (error) {
      console.error('❌ Erro ao carregar documentos solicitados:', error);
      this.documentosSolicitados = [];
    } finally {
      this.carregandoDocumentosSolicitados = false;
      this.unificarDocumentos();
    }
  }

  /**
   * Unifica as listas de documentos solicitados e enviados
   */
  private unificarDocumentos() {
    this.todosDocumentos = [];

    // Adicionar documentos solicitados
    this.documentosSolicitados.forEach(doc => {
      this.todosDocumentos.push({
        ...doc,
        origem: 'solicitado',
        // Padronizar propriedades
        nomeDocumento: doc.tipoDocumento,
        statusDescricao: doc.status
      });
    });

    // Adicionar documentos enviados
    this.documentosEnviados.forEach(doc => {
      // Verificar se já existe um documento solicitado com mesmo tipo
      const existeSolicitado = this.todosDocumentos.find(item =>
        item.origem === 'solicitado' &&
        (item.tipoDocumento === doc.tipoDocumento?.nome ||
          item.nomeDocumento === doc.tipoDocumento?.nome)
      );

      if (existeSolicitado) {
        // Atualizar o documento solicitado com dados do enviado
        Object.assign(existeSolicitado, {
          ...doc,
          origem: 'unificado',
          tipoDocumento: doc.tipoDocumento?.nome || existeSolicitado.tipoDocumento,
          nomeDocumento: doc.tipoDocumento?.nome || existeSolicitado.nomeDocumento
        });
      } else {
        // Adicionar como novo documento
        this.todosDocumentos.push({
          ...doc,
          origem: 'enviado',
          tipoDocumento: doc.tipoDocumento?.nome,
          nomeDocumento: doc.tipoDocumento?.nome
        });
      }
    });

    console.log('📋 Documentos unificados:', this.todosDocumentos);
  }

  /**
   * Organiza documentos por categoria (igual ao painel do responsável)
   */
  organizarDocumentosPorCategoria() {
    console.log('Organizando documentos por categoria...');

    // Limpar arrays anteriores
    this.documentosFamilia = [];
    this.documentosAluno = [];
    this.documentosIntegrantes.clear();

    if (!this.documentosEnviados || this.documentosEnviados.length === 0) {
      console.log('Nenhum documento encontrado');
      return;
    }

    this.documentosEnviados.forEach((documento: any) => {
      console.log('Processando documento:', documento.tipoDocumento?.nome, '- Categoria:', documento.tipoDocumento?.categoria);

      // Converter data para formato brasileiro se necessário
      if (documento.dataEnvio) {
        const data = new Date(documento.dataEnvio);
        documento.dataEnvioFormatada = data.toLocaleDateString('pt-BR');
      }

      // Usar categoria do tipoDocumento
      const categoria = documento.tipoDocumento?.categoria?.toUpperCase();

      switch (categoria) {
        case 'FAMILIA':
          this.documentosFamilia.push(documento);
          console.log('Adicionado à categoria FAMÍLIA:', documento.tipoDocumento?.nome);
          break;

        case 'ALUNO':
          this.documentosAluno.push(documento);
          console.log('Adicionado à categoria ALUNO:', documento.tipoDocumento?.nome);
          break;

        case 'TODOS_INTEGRANTES':
          const nomeIntegrante = documento.nomeIntegrante || 'Sem identificação';
          console.log('Documento de integrante - Nome:', nomeIntegrante);

          if (!this.documentosIntegrantes.has(nomeIntegrante)) {
            this.documentosIntegrantes.set(nomeIntegrante, []);
          }
          this.documentosIntegrantes.get(nomeIntegrante)!.push(documento);
          console.log('Adicionado à categoria INTEGRANTES para:', nomeIntegrante);
          break;

        default:
          console.log('Categoria não reconhecida:', categoria);
          // Adiciona na família por padrão se categoria não reconhecida
          this.documentosFamilia.push(documento);
      }
    });

    console.log('=== RESUMO DA ORGANIZAÇÃO ===');
    console.log('Documentos da Família:', this.documentosFamilia.length);
    console.log('Documentos do Aluno:', this.documentosAluno.length);
    console.log('Integrantes com documentos:', this.documentosIntegrantes.size);
    this.documentosIntegrantes.forEach((docs, nome) => {
      console.log(`  ${nome}: ${docs.length} documentos`);
    });
  }

  /**
   * Filtra documentos por categoria
   */
  filtrarDocumentosPorCategoria(event: any) {
    this.categoriaDocumentos = event.detail.value;
    console.log('Filtrando documentos por categoria:', this.categoriaDocumentos);
  }

  /**
   * Retorna documentos visíveis baseado na categoria selecionada
   */
  obterDocumentosVisiveis() {
    switch (this.categoriaDocumentos) {
      case 'familia':
        return this.documentosFamilia;
      case 'aluno':
        return this.documentosAluno;
      case 'integrantes':
        const todosIntegrantes: any[] = [];
        this.documentosIntegrantes.forEach(docs => {
          todosIntegrantes.push(...docs);
        });
        return todosIntegrantes;
      default: // 'todos'
        return this.documentosEnviados;
    }
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
      const urlArquivo = `${environment.apiUrl.replace('/api', '')}/cipalam_documentos/${nomeArquivoFinal}`;

      console.log('🔗 Abrindo URL:', urlArquivo);
      console.log('📄 Tipo de arquivo:', documento.tipoArquivo);
      console.log('📁 Caminho completo:', caminhoCompleto);
      console.log('📄 Nome do arquivo extraído:', nomeArquivoFinal);

      // Obter token de autenticação
      const token = localStorage.getItem('accessToken');
      if (!token) {
        this.mostrarErro('Sessão expirada. Faça login novamente.');
        return;
      }

      console.log('🔐 Token obtido:', token ? 'Sim' : 'Não');

      // Detectar o tipo de arquivo para abrir adequadamente
      const tipoArquivo = documento.tipoArquivo?.toLowerCase() || '';
      const nomeArquivoLower = nomeArquivoFinal.toLowerCase();

      console.log('📥 Iniciando download do arquivo...');

      // Fazer download autenticado do arquivo via blob
      const loading = await this.loadingController.create({
        message: 'Carregando documento...'
      });
      await loading.present();

      console.log('🌐 Fazendo requisição HTTP para:', urlArquivo);

      this.http.get(urlArquivo, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        responseType: 'blob'
      }).subscribe({
        next: (blob) => {
          console.log('✅ Blob recebido:', blob.size, 'bytes');
          loading.dismiss();

          // Criar URL temporária do blob
          const blobUrl = window.URL.createObjectURL(blob);
          console.log('🔗 Blob URL criada:', blobUrl);

          if (tipoArquivo.includes('pdf') || nomeArquivoLower.endsWith('.pdf')) {
            // PDFs: abrir no visualizador do navegador
            console.log('📄 Abrindo PDF...');
            const pdfWindow = window.open(blobUrl, '_blank');
            if (!pdfWindow || pdfWindow.closed || typeof pdfWindow.closed == 'undefined') {
              this.mostrarErro('Pop-up bloqueado! Por favor, permita pop-ups para este site e tente novamente.');
            }
          } else if (tipoArquivo.includes('image') ||
            nomeArquivoLower.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/)) {
            // Imagens: abrir em uma página customizada
            console.log('🖼️ Abrindo imagem...');
            const newTab = window.open('', '_blank');
            if (!newTab || newTab.closed || typeof newTab.closed == 'undefined') {
              this.mostrarErro('Pop-up bloqueado! Por favor, permita pop-ups para este site e tente novamente.');
            } else {
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
                    </style>
                  </head>
                  <body>
                    <div class="header">
                      <h1>${documento.tipoDocumento?.nome || documento.nomeDocumento}</h1>
                      <p>📱 ${nomeArquivoFinal}</p>
                    </div>
                    <div class="image-container">
                      <img src="${blobUrl}" alt="${documento.tipoDocumento?.nome || documento.nomeDocumento}" />
                    </div>
                  </body>
                </html>
              `);
            }
          } else {
            // Outros tipos de arquivo: abrir diretamente
            console.log('📎 Abrindo arquivo genérico...');
            const genericWindow = window.open(blobUrl, '_blank');
            if (!genericWindow || genericWindow.closed || typeof genericWindow.closed == 'undefined') {
              this.mostrarErro('Pop-up bloqueado! Por favor, permita pop-ups para este site e tente novamente.');
            }
          }
        },
        error: (error) => {
          console.error('❌ Erro na requisição HTTP:', error);
          console.error('Status:', error.status);
          console.error('Mensagem:', error.message);
          loading.dismiss();

          if (error.status === 401 || error.status === 403) {
            this.mostrarErro('Não autorizado. Faça login novamente.');
          } else if (error.status === 404) {
            this.mostrarErro('Documento não encontrado no servidor.');
          } else {
            this.mostrarErro('Erro ao carregar documento. Tente novamente.');
          }
        }
      });

    } catch (error) {
      console.error('Erro ao abrir documento:', error);
      this.mostrarErro('Erro ao carregar documento. Tente novamente.');
    }
  }

  /**
   * Visualizar documento em nova aba (mesmo que abrirDocumento)
   */
  async visualizarDocumento(documento: any) {
    await this.abrirDocumento(documento);
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

  /**
   * Verifica se o usuário logado é funcionário
   */
  isFuncionario(): boolean {
    const userType = this.authService.getUserType();
    return userType === 'funcionario' || userType === 'admin';
  }

  /**
   * Aprovar um documento
   */
  async aprovarDocumento(documento: any) {
    const alert = await this.alertController.create({
      header: 'Aprovar Documento',
      message: `Deseja aprovar o documento "${documento.tipoDocumento?.nome}"?`,
      inputs: [
        {
          name: 'observacoes',
          type: 'textarea',
          placeholder: 'Observações (opcional)',
          attributes: {
            maxlength: 500
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Aprovar',
          handler: async (data) => {
            await this.processarAprovacao(documento.id, data.observacoes);
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Rejeitar um documento
   */
  async rejeitarDocumento(documento: any) {
    const alert = await this.alertController.create({
      header: 'Rejeitar Documento',
      message: `Deseja rejeitar o documento "${documento.tipoDocumento?.nome}"?`,
      inputs: [
        {
          name: 'motivoRejeicao',
          type: 'textarea',
          placeholder: 'Motivo da rejeição (obrigatório)',
          attributes: {
            required: true,
            maxlength: 1000
          }
        }
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Rejeitar',
          handler: async (data) => {
            if (!data.motivoRejeicao || data.motivoRejeicao.trim() === '') {
              this.mostrarErro('Motivo da rejeição é obrigatório');
              return false;
            }
            await this.processarRejeicao(documento.id, data.motivoRejeicao);
            return true;
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Processar aprovação do documento
   */
  private async processarAprovacao(documentoId: number, observacoes?: string) {
    const loading = await this.loadingController.create({
      message: 'Aprovando documento...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      const response = await this.http.post(
        `${environment.apiUrl}/funcionario/aprovar-documento`,
        {
          documentoId: documentoId,
          observacoes: observacoes
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      ).toPromise();

      await loading.dismiss();

      this.mostrarSucesso('Documento aprovado com sucesso!');

      // Recarregar documentos
      if (this.declaracao) {
        this.carregarDocumentosEnviados();
      }

    } catch (error: any) {
      await loading.dismiss();
      console.error('Erro ao aprovar documento:', error);

      const errorMessage = error.error?.message || 'Erro ao aprovar documento';
      this.mostrarErro(errorMessage);
    }
  }

  /**
   * Processar rejeição do documento
   */
  private async processarRejeicao(documentoId: number, motivoRejeicao: string) {
    const loading = await this.loadingController.create({
      message: 'Rejeitando documento...'
    });
    await loading.present();

    try {
      const token = this.authService.getToken();
      const response = await this.http.post(
        `${environment.apiUrl}/funcionario/rejeitar-documento`,
        {
          documentoId: documentoId,
          motivoRejeicao: motivoRejeicao
        },
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      ).toPromise();

      await loading.dismiss();

      this.mostrarSucesso('Documento rejeitado com sucesso!');

      // Recarregar documentos
      if (this.declaracao) {
        this.carregarDocumentosEnviados();
      }

    } catch (error: any) {
      await loading.dismiss();
      console.error('Erro ao rejeitar documento:', error);

      const errorMessage = error.error?.message || 'Erro ao rejeitar documento';
      this.mostrarErro(errorMessage);
    }
  }

  /**
   * Mostrar mensagem de sucesso
   */
  private async mostrarSucesso(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      color: 'success',
      position: 'top'
    });
    await toast.present();
  }

  /**
   * Mostrar mensagem de erro
   */
  private async mostrarErro(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 4000,
      color: 'danger',
      position: 'top'
    });
    await toast.present();
  }

  private async mostrarInfo(mensagem: string) {
    const alert = await this.alertController.create({
      header: 'Informações do Documento',
      message: mensagem,
      buttons: ['Fechar']
    });
    await alert.present();
  }

  /**
   * Verifica se pode finalizar a matrícula
   */
  podeFinalizarMatricula(): boolean {
    // Verifica se a matrícula foi iniciada e não foi finalizada ainda
    return this.matriculaIniciada &&
      this.declaracao?.status !== 'matriculado' &&
      !this.processandoFinalizacao;
  }

  /**
   * Finaliza a matrícula alterando o status para 'matriculado'
   */
  async finalizarMatricula() {
    if (!this.declaracao?.id) {
      await this.mostrarErro('Declaração não encontrada');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Finalizar Matrícula',
      message: 'Tem certeza que deseja finalizar a matrícula? Após finalizada, a declaração será removida da listagem e o aluno aparecerá na seção de turmas.',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Finalizar',
          handler: () => {
            this.processarFinalizacao();
          }
        }
      ]
    });

    await alert.present();
  }

  /**
   * Processa a finalização da matrícula
   */
  private async processarFinalizacao() {
    this.processandoFinalizacao = true;

    const loading = await this.loadingController.create({
      message: 'Finalizando matrícula...'
    });
    await loading.present();

    try {
      // Obter ID do funcionário logado
      const usuarioLogado = this.authService.getFuncionarioLogado();
      if (!usuarioLogado || !usuarioLogado.pessoaId) {
        throw new Error('Usuário não encontrado');
      }

      // Chamada para o endpoint de finalizar matrícula usando o service
      const response = await this.matriculaService.finalizarMatricula(
        this.declaracao?.id || 0,
        usuarioLogado.pessoaId
      ).toPromise();

      await loading.dismiss();

      const toast = await this.toastController.create({
        message: 'Matrícula finalizada com sucesso! O aluno agora aparece na listagem de turmas.',
        duration: 4000,
        color: 'success',
        position: 'top'
      });
      await toast.present();

      // Atualizar status local
      if (this.declaracao) {
        this.declaracao.status = 'matriculado';
      }

      // Voltar para a listagem após 2 segundos
      setTimeout(() => {
        this.voltarLista();
      }, 2000);

    } catch (error: any) {
      await loading.dismiss();
      console.error('Erro ao finalizar matrícula:', error);

      let mensagem = 'Erro ao finalizar matrícula';
      if (error.error && error.error.message) {
        mensagem = error.error.message;
      }

      await this.mostrarErro(mensagem);
    } finally {
      this.processandoFinalizacao = false;
    }
  }
}
