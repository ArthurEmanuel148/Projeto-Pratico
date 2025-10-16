import { Component, OnInit } from '@angular/core';
import { ToastController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
import { ResponsavelDocumentosService, FamiliaDocumentos, DocumentoPorPessoa, DocumentoIndividual } from '../core/services/responsavel-documentos.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-painel-responsavel',
  templateUrl: './painel-responsavel.page.html',
  styleUrls: ['./painel-responsavel.page.scss'],
  standalone: false
})
export class PainelResponsavelPage implements OnInit {
  usuarioLogado: any = null;
  carregando = true;
  familiaDocumentos: FamiliaDocumentos | null = null;
  pessoaSelecionada: DocumentoPorPessoa | null = null;

  // Controle de categorias de documentos
  categoriaDocumentos = 'todos';

  // Documentos organizados por categoria
  documentosFamilia: DocumentoIndividual[] = [];
  documentosAluno: DocumentoIndividual[] = [];
  documentosIntegrantes: DocumentoIndividual[] = [];

  // Rastrear se estamos usando matrícula finalizada ou declaração
  usandoMatriculaFinalizada = false;

  constructor(
    private authService: AuthService,
    private responsavelDocumentosService: ResponsavelDocumentosService,
    private toastController: ToastController
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.authService.getFuncionarioLogado();
    console.log('👤 Usuário logado no painel responsável:', this.usuarioLogado);
    this.carregarDocumentosFamilia();
  }

  /**
   * Carrega os documentos da família do responsável
   * Tenta primeiro da declaração de interesse, se não encontrar busca da matrícula finalizada
   */
  async carregarDocumentosFamilia() {
    this.carregando = true;
    try {
      const usuarioLogado = this.authService.getFuncionarioLogado();
      console.log('👤 Dados completos do usuário logado:', usuarioLogado);

      if (!usuarioLogado?.pessoaId && !usuarioLogado?.usuarioId) {
        console.error('❌ Usuário não está logado ou ID não disponível');
        this.familiaDocumentos = null;
        this.carregando = false;
        return;
      }

      const idUsuario = usuarioLogado.pessoaId || usuarioLogado.usuarioId;

      console.log('🔍 Tentando carregar documentos para usuário ID:', idUsuario);

      // Validar se idUsuario é um número válido
      if (!idUsuario || typeof idUsuario !== 'number') {
        console.error('❌ ID do usuário inválido:', idUsuario);
        this.familiaDocumentos = null;
        this.carregando = false;
        await this.mostrarToastErro('Erro: ID do usuário não disponível.');
        return;
      }

      // PRIMEIRA TENTATIVA: Buscar da declaração de interesse
      this.responsavelDocumentosService.getDocumentosPorMatricula(idUsuario).subscribe({
        next: (documentos) => {
          console.log('✅ Documentos encontrados na DECLARAÇÃO DE INTERESSE:', documentos);

          // Verificar se realmente há documentos
          const temDocumentos = documentos?.documentosPorPessoa && documentos.documentosPorPessoa.length > 0;

          if (temDocumentos) {
            console.log('✅ Declaração possui documentos, usando estes dados');
            this.familiaDocumentos = documentos;
            this.usandoMatriculaFinalizada = false; // Usando declaração
            this.carregando = false;
            this.organizarDocumentosPorCategoria();
          } else {
            console.warn('⚠️ Declaração encontrada mas SEM documentos, tentando matrícula finalizada...');
            this.tentarCarregarDocumentosMatriculaFinalizada(idUsuario);
          }
        },
        error: async (error) => {
          console.warn('⚠️ Não encontrou na declaração de interesse, tentando matrícula finalizada...');
          console.log('Erro da primeira tentativa:', error.status);

          // SEGUNDA TENTATIVA: Buscar da matrícula finalizada (se não encontrou na declaração)
          if (error.status === 404 || error.status === 500) {
            this.tentarCarregarDocumentosMatriculaFinalizada(idUsuario);
          } else {
            console.error('❌ Erro inesperado ao carregar documentos:', error);
            await this.mostrarToastErro('Erro ao carregar documentos. Tente novamente.');
            this.familiaDocumentos = null;
            this.carregando = false;
          }
        }
      });

    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error);
      this.familiaDocumentos = null;
      this.carregando = false;
    }
  }

  /**
   * Tenta carregar documentos da matrícula finalizada
   */
  private async tentarCarregarDocumentosMatriculaFinalizada(idUsuario: number) {
    console.log('🔍 Buscando documentos da MATRÍCULA FINALIZADA para usuário:', idUsuario);

    // Aqui você precisa buscar o ID do aluno vinculado a este responsável
    // Por enquanto, vou usar um endpoint que busca pelo responsável
    this.responsavelDocumentosService.getDocumentosPorResponsavelMatriculaFinalizada(idUsuario).subscribe({
      next: (documentos) => {
        console.log('✅ Documentos encontrados na MATRÍCULA FINALIZADA:', documentos);
        this.familiaDocumentos = documentos;
        this.usandoMatriculaFinalizada = true; // Usando matrícula finalizada
        this.carregando = false;
        this.organizarDocumentosPorCategoria();
      },
      error: async (error) => {
        console.error('❌ Erro ao carregar documentos da matrícula finalizada:', error);

        if (error.status === 404) {
          console.warn('⚠️ Responsável não possui matrícula finalizada nem declaração de interesse');
          await this.mostrarToastErro('Nenhum documento encontrado para este responsável');
        } else {
          await this.mostrarToastErro('Erro ao carregar documentos. Tente novamente.');
        }

        this.familiaDocumentos = null;
        this.carregando = false;
      }
    });
  }



  /**
   * Obtém o ícone baseado no parentesco
   */
  obterIconeParentesco(parentesco: string): string {
    switch (parentesco?.toLowerCase()) {
      case 'responsavel':
        return 'person-circle';
      case 'aluno':
        return 'school';
      case 'integrante':
        return 'people';
      default:
        return 'person';
    }
  }

  /**
   * Obtém a cor baseada no parentesco
   */
  obterCorParentesco(parentesco: string): string {
    switch (parentesco?.toLowerCase()) {
      case 'responsavel':
        return 'primary';
      case 'aluno':
        return 'success';
      case 'integrante':
        return 'medium';
      default:
        return 'dark';
    }
  }

  /**
   * Obtém a descrição legível do parentesco
   */
  obterDescricaoParentesco(parentesco: string): string {
    switch (parentesco?.toLowerCase()) {
      case 'responsavel':
        return 'Responsável pela matrícula';
      case 'aluno':
        return 'Aluno(a)';
      case 'integrante':
        return 'Integrante da família';
      default:
        return 'Membro da família';
    }
  }

  /**
   * Obtém ícone baseado na categoria do documento
   */
  obterIconeDocumento(categoria: string): string {
    switch (categoria?.toUpperCase()) {
      case 'FAMILIA':
        return 'people-outline';
      case 'ALUNO':
        return 'school-outline';
      case 'TODOS_INTEGRANTES':
        return 'document-text-outline';
      default:
        return 'document-outline';
    }
  }

  /**
   * Obtém cor baseada no status do documento
   */
  obterCorStatus(status: string): string {
    switch (status?.toLowerCase()) {
      case 'pendente':
        return 'warning';
      case 'enviado':
      case 'anexado':
        return 'primary';
      case 'aprovado':
        return 'success';
      case 'rejeitado':
        return 'danger';
      default:
        return 'medium';
    }
  }



  /**
   * Anexar documento
   */
  async anexarDocumento(documento: DocumentoIndividual) {
    console.log('📎 Iniciando anexo de documento:', documento);

    // Criar input file temporário
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';

    input.onchange = async (event: any) => {
      const arquivo = event.target.files[0];
      if (!arquivo) return;

      // Validar arquivo
      const validacao = this.responsavelDocumentosService.validarArquivo(arquivo);
      if (!validacao.valido) {
        console.error('Arquivo inválido:', validacao.erro);
        await this.mostrarToastErro(`Arquivo inválido: ${validacao.erro}`);
        return;
      }

      try {
        console.log('📤 Enviando arquivo:', arquivo.name);
        console.log('🔍 Tipo de matrícula:', this.usandoMatriculaFinalizada ? 'FINALIZADA' : 'DECLARAÇÃO');
        console.log('📋 Documento completo:', JSON.stringify(documento, null, 2));

        // Extrair ID do documento (pode variar entre declaração e matrícula finalizada)
        const documentoId = documento.idDocumentoMatricula || documento.id;

        if (!documentoId) {
          console.error('❌ ID do documento não encontrado:', documento);
          await this.mostrarToastErro('Erro: ID do documento não encontrado.');
          return;
        }

        console.log('🆔 ID do documento a anexar:', documentoId);

        if (this.usandoMatriculaFinalizada) {
          // Anexar em matrícula finalizada (tbDocumentoMatricula)
          console.log('🔄 Chamando anexarDocumentoMatriculaFinalizada...');
          const resultado = await this.responsavelDocumentosService.anexarDocumentoMatriculaFinalizada(
            arquivo,
            documentoId,
            this.usuarioLogado?.pessoaId || this.usuarioLogado?.usuarioId
          ).toPromise();
          console.log('✅ Resultado da anexação (matrícula finalizada):', resultado);
        } else {
          // Anexar em declaração de interesse (tbDocumentoInteresse)
          console.log('🔄 Chamando anexarDocumento (declaração)...');
          const resultado = await this.responsavelDocumentosService.anexarDocumento(
            arquivo,
            documentoId,
            this.usuarioLogado?.pessoaId || this.usuarioLogado?.usuarioId
          ).toPromise();
          console.log('✅ Resultado da anexação (declaração):', resultado);
        }

        console.log('✅ Documento anexado com sucesso');
        await this.mostrarToastSucesso('Documento anexado com sucesso!');
        // Recarregar dados
        this.carregarDocumentosFamilia();

      } catch (error) {
        console.error('❌ Erro ao anexar documento:', error);
        await this.mostrarToastErro('Erro ao anexar documento. Tente novamente.');
      }
    };

    input.click();
  }

  /**
   * Visualizar documento em uma nova guia
   * Funciona tanto para declaração quanto para matrícula finalizada
   */
  async visualizarDocumento(documento: DocumentoIndividual) {
    console.log('👁️ Visualizando documento:', documento);
    console.log('🔍 Tipo de matrícula:', this.usandoMatriculaFinalizada ? 'FINALIZADA' : 'DECLARAÇÃO');

    try {
      let blob: Blob | undefined;

      if (this.usandoMatriculaFinalizada) {
        // Matrícula finalizada: usar endpoint do backend que serve o arquivo com JWT
        console.log('📂 Buscando arquivo via backend (com JWT)');

        blob = await this.responsavelDocumentosService.visualizarDocumentoMatriculaFinalizada(
          documento.idDocumentoMatricula
        ).toPromise();

      } else {
        // Declaração de interesse: usar serviço existente
        blob = await this.responsavelDocumentosService.visualizarDocumento(
          documento.idDocumentoMatricula
        ).toPromise();
      }

      if (blob) {
        // Criar URL temporária e abrir em nova guia
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');

        console.log('✅ Documento aberto em nova guia');
        await this.mostrarToastSucesso('Documento aberto em nova guia!');

        // Limpar a URL após alguns segundos para liberar memória
        setTimeout(() => {
          window.URL.revokeObjectURL(url);
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Erro ao visualizar documento:', error);
      await this.mostrarToastErro('Erro ao visualizar documento');
    }
  }  /**
   * Baixar documento (mantido como método auxiliar)
   */
  async baixarDocumento(documento: DocumentoIndividual) {
    console.log('⬇️ Baixando documento:', documento);

    try {
      const blob = await this.responsavelDocumentosService.baixarDocumento(
        documento.idDocumentoMatricula
      ).toPromise();

      if (blob) {
        // Criar URL temporária e fazer download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documento.nomeArquivo || 'documento.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        console.log('✅ Download iniciado');
        await this.mostrarToastSucesso('Download iniciado!');
      }
    } catch (error) {
      console.error('❌ Erro ao baixar documento:', error);
      await this.mostrarToastErro('Erro ao baixar documento');
    }
  }

  /**
   * Remover documento
   */
  async removerDocumento(documento: DocumentoIndividual) {
    console.log('🗑️ Removendo documento:', documento);

    try {
      await this.responsavelDocumentosService.removerDocumento(
        documento.idDocumentoMatricula,
        this.usuarioLogado?.pessoaId || this.usuarioLogado?.usuarioId
      ).toPromise();

      console.log('✅ Documento removido com sucesso');
      await this.mostrarToastSucesso('Documento removido com sucesso!');
      // Recarregar dados
      this.carregarDocumentosFamilia();

    } catch (error) {
      console.error('❌ Erro ao remover documento:', error);
      await this.mostrarToastErro('Erro ao remover documento');
    }
  }

  /**
   * Mostrar toast de sucesso
   */
  private async mostrarToastSucesso(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 3000,
      position: 'top',
      color: 'success',
      icon: 'checkmark-circle'
    });
    await toast.present();
  }

  /**
   * Mostrar toast de erro
   */
  private async mostrarToastErro(mensagem: string) {
    const toast = await this.toastController.create({
      message: mensagem,
      duration: 4000,
      position: 'top',
      color: 'danger',
      icon: 'alert-circle'
    });
    await toast.present();
  }

  /**
   * Organiza os documentos por categoria baseado na nova estrutura
   */
  organizarDocumentosPorCategoria() {
    // Limpar organizações anteriores
    this.documentosFamilia = [];
    this.documentosAluno = [];
    this.documentosIntegrantes = [];

    if (!this.familiaDocumentos?.documentosPorPessoa) {
      return;
    }

    // Organizar baseado no parentesco/tipo da pessoa
    this.familiaDocumentos.documentosPorPessoa.forEach(pessoaDocumentos => {
      const parentesco = pessoaDocumentos.pessoa.parentesco?.toLowerCase() || '';
      const nomePessoa = pessoaDocumentos.pessoa.nome?.toLowerCase() || '';

      if (parentesco === 'responsavel' || parentesco === 'familia' || nomePessoa.includes('família')) {
        // Documentos da família
        this.documentosFamilia.push(...pessoaDocumentos.documentos);
      } else if (parentesco === 'aluno' || nomePessoa.includes('aluno')) {
        // Documentos do aluno
        this.documentosAluno.push(...pessoaDocumentos.documentos);
      } else {
        // Documentos dos integrantes (pai, mãe, irmão, etc.)
        this.documentosIntegrantes.push(...pessoaDocumentos.documentos);
      }
    });

    console.log('📂 Documentos organizados por categoria:', {
      familia: this.documentosFamilia.length,
      aluno: this.documentosAluno.length,
      integrantes: this.documentosIntegrantes.length,
      total: this.documentosFamilia.length + this.documentosAluno.length + this.documentosIntegrantes.length
    });
  }

  /**
   * Filtra os documentos por categoria selecionada
   */
  filtrarDocumentosPorCategoria(event: any) {
    this.categoriaDocumentos = event.detail.value;
    console.log('🔍 Categoria selecionada:', this.categoriaDocumentos);
  }

  /**
   * Obtém os documentos visíveis baseado na categoria selecionada
   */
  obterDocumentosVisiveis(): DocumentoIndividual[] {
    switch (this.categoriaDocumentos) {
      case 'familia':
        return this.documentosFamilia;
      case 'aluno':
        return this.documentosAluno;
      case 'integrantes':
        return this.documentosIntegrantes;
      default: // 'todos'
        return [...this.documentosFamilia, ...this.documentosAluno, ...this.documentosIntegrantes];
    }
  }
}
