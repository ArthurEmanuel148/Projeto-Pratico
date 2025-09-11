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
   */
  async carregarDocumentosFamilia() {
    this.carregando = true;
    try {
      // Buscar dados reais do backend usando o ID do usuário logado
      const usuarioLogado = this.authService.getFuncionarioLogado();
      console.log('👤 Dados completos do usuário logado:', usuarioLogado);

      if (!usuarioLogado?.pessoaId && !usuarioLogado?.usuarioId) {
        console.error('❌ Usuário não está logado ou ID não disponível');
        console.error('Dados do usuário:', usuarioLogado);
        this.familiaDocumentos = null;
        this.carregando = false;
        return;
      }

      const idUsuario = usuarioLogado.pessoaId || usuarioLogado.usuarioId;

      if (!idUsuario) {
        console.error('❌ ID do usuário não disponível');
        this.familiaDocumentos = null;
        this.carregando = false;
        return;
      }

      console.log('🔍 Carregando documentos para usuário ID:', idUsuario);
      console.log('📍 URL da requisição:', `${environment.apiUrl}/api/responsavel/${idUsuario}/familia/documentos`);

      // Chamar o serviço que busca dados reais do backend
      this.responsavelDocumentosService.getDocumentosPorFamilia(idUsuario).subscribe({
        next: (documentos) => {
          console.log('✅ Documentos recebidos do backend:', documentos);
          this.familiaDocumentos = documentos;
          this.carregando = false;

          // Selecionar primeira pessoa automaticamente
          if (documentos?.documentosPorPessoa?.length > 0) {
            this.selecionarPessoa(documentos.documentosPorPessoa[0]);
          }
        },
        error: async (error) => {
          console.error('❌ Erro ao carregar documentos da família:', error);
          console.error('Detalhes do erro:', {
            status: error.status,
            message: error.message,
            url: error.url,
            error: error.error
          });

          // Verificar se é erro 404 (não encontrado)
          if (error.status === 404) {
            console.warn('⚠️ Responsável não encontrado ou sem documentos configurados');
            await this.mostrarToastErro('Nenhum documento encontrado para este responsável');
          } else {
            await this.mostrarToastErro('Erro ao carregar documentos. Tente novamente.');
          }

          this.familiaDocumentos = null;
          this.carregando = false;
        }
      });

    } catch (error) {
      console.error('❌ Erro ao carregar documentos:', error);
      this.familiaDocumentos = null;
      this.carregando = false;
    }
  }

  /**
   * Seleciona uma pessoa para visualizar os documentos
   */
  selecionarPessoa(pessoa: DocumentoPorPessoa) {
    this.pessoaSelecionada = pessoa;
    console.log('👤 Pessoa selecionada:', pessoa);
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
   * Obtém estatísticas de documentos de uma pessoa
   */
  obterEstatisticasPessoa(pessoa: DocumentoPorPessoa): { pendentes: number; total: number; aprovados: number } {
    const pendentes = pessoa.documentos.filter(doc => doc.status === 'pendente').length;
    const aprovados = pessoa.documentos.filter(doc => doc.status === 'aprovado').length;
    const total = pessoa.documentos.length;
    return { pendentes, total, aprovados };
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
        await this.responsavelDocumentosService.anexarDocumento(
          arquivo,
          documento.idDocumentoMatricula,
          this.pessoaSelecionada!.pessoa.id
        ).toPromise();

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
   * Baixar documento
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
        this.pessoaSelecionada!.pessoa.id
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
}
