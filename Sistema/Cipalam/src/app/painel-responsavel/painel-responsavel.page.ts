import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { ResponsavelDocumentosService, FamiliaDocumentos, DocumentoPorPessoa, DocumentoIndividual } from '../core/services/responsavel-documentos.service';

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
    private responsavelDocumentosService: ResponsavelDocumentosService
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

      if (!usuarioLogado?.pessoaId && !usuarioLogado?.usuarioId) {
        console.error('Usuário não está logado ou ID não disponível');
        this.familiaDocumentos = null;
        this.carregando = false;
        return;
      }

      const idUsuario = usuarioLogado.pessoaId || usuarioLogado.usuarioId;
      console.log('🔍 Buscando documentos para responsável ID:', idUsuario);

      // Chamar o serviço que busca dados reais do backend
      this.responsavelDocumentosService.getDocumentosPorFamilia(idUsuario!).subscribe({
        next: (documentos) => {
          console.log('✅ Documentos recebidos do backend:', documentos);
          this.familiaDocumentos = documentos;
          this.carregando = false;

          // Selecionar primeira pessoa automaticamente
          if (documentos?.documentosPorPessoa?.length > 0) {
            this.selecionarPessoa(documentos.documentosPorPessoa[0]);
          }
        },
        error: (error) => {
          console.error('❌ Erro ao carregar documentos da família:', error);
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
  anexarDocumento(documento: DocumentoIndividual) {
    console.log('📎 Anexar documento:', documento);
    // TODO: Implementar modal de upload de arquivo
  }

  /**
   * Baixar documento
   */
  baixarDocumento(documento: DocumentoIndividual) {
    console.log('⬇️ Baixar documento:', documento);
    // TODO: Implementar download do documento
  }

  /**
   * Remover documento
   */
  removerDocumento(documento: DocumentoIndividual) {
    console.log('🗑️ Remover documento:', documento);
    // TODO: Implementar remoção do documento
  }
}
