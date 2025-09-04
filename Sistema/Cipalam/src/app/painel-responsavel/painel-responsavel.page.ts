import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { DocumentoService } from '../core/services/documento.service';
import { ResponsavelDocumentosService, FamiliaDocumentos, DocumentoPorPessoa, DocumentoIndividual } from '../core/services/responsavel-documentos.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-painel-responsavel',
  templateUrl: './painel-responsavel.page.html',
  styleUrls: ['./painel-responsavel.page.scss'],
  standalone: false,
})
export class PainelResponsavelPage implements OnInit {
  usuarioLogado: any;
  familiaDocumentos: FamiliaDocumentos | null = null;
  documentosCarregando: boolean = false;
  pessoaSelecionada: DocumentoPorPessoa | null = null;

  constructor(
    private authService: AuthService,
    private documentoService: DocumentoService,
    private responsavelDocumentosService: ResponsavelDocumentosService,
    private alertController: AlertController,
    private toastController: ToastController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.usuarioLogado = this.authService.getFuncionarioLogado();
    console.log('🔐 Usuario logado no painel responsavel:', this.usuarioLogado);
    
    // DEBUG: Simular login da Ana Costa Lima para testes
    if (!this.usuarioLogado || !this.usuarioLogado.pessoaId) {
      console.log('🧪 Simulando login da Ana Costa Lima para testes...');
      this.usuarioLogado = {
        pessoaId: 6, // Ana Costa Lima que tem matrícula iniciada
        pessoa: { idPessoa: 6, nmPessoa: 'Ana Costa Lima' },
        nomePessoa: 'Ana Costa Lima'
      };
    }
    
    this.carregarDocumentosFamilia();
  }

  /**
   * Carrega todos os documentos da família organizados por pessoa
   */
  async carregarDocumentosFamilia() {
    console.log('🔍 Iniciando carregamento de documentos da família...');
    
    // Buscar ID da pessoa logada
    let idResponsavel = this.usuarioLogado?.pessoaId ||
      this.usuarioLogado?.pessoa?.idPessoa ||
      this.usuarioLogado?.usuarioId ||
      this.usuarioLogado?.idPessoa;

    // TEMPORÁRIO: Para testes específicos da Ana Costa Lima
    if (!idResponsavel) {
      console.warn('⚠️ ID da pessoa não encontrado, usando ID de teste para Ana Costa Lima');
      idResponsavel = 6; // ID da Ana Costa Lima no banco que tem matrícula iniciada
    }

    console.log('🔍 ID do responsável para carregar documentos:', idResponsavel);

    if (!idResponsavel) {
      console.error('❌ ID do responsável não encontrado');
      await this.mostrarToast('Erro: ID do usuário não encontrado', 'danger');
      return;
    }

    this.documentosCarregando = true;

    try {
      this.responsavelDocumentosService.getDocumentosPorFamilia(idResponsavel).subscribe({
        next: (familiaDocumentos) => {
          console.log('📋 Documentos da família recebidos:', familiaDocumentos);
          this.familiaDocumentos = familiaDocumentos;
          
          // Seleciona a primeira pessoa por padrão
          if (this.familiaDocumentos.documentosPorPessoa.length > 0) {
            this.pessoaSelecionada = this.familiaDocumentos.documentosPorPessoa[0];
          }
          
          this.documentosCarregando = false;
          console.log('✅ Documentos da família carregados com sucesso!');
        },
        error: (error: any) => {
          console.error('❌ Erro ao carregar documentos da família:', error);
          this.documentosCarregando = false;
          this.mostrarToast('Erro ao carregar documentos da família', 'danger');
        }
      });

    } catch (error) {
      this.documentosCarregando = false;
      this.mostrarToast('Erro inesperado ao carregar documentos', 'danger');
    }
  }

  /**
   * Seleciona uma pessoa para visualizar os documentos
   */
  selecionarPessoa(pessoa: DocumentoPorPessoa) {
    this.pessoaSelecionada = pessoa;
    console.log('👤 Pessoa selecionada:', pessoa.pessoa.nome);
  }

  /**
   * Retorna o ícone baseado no parentesco da pessoa
   */
  obterIconeParentesco(parentesco: string): string {
    switch (parentesco) {
      case 'responsavel': return 'person-circle-outline';
      case 'aluno': return 'school-outline';
      case 'integrante': return 'people-outline';
      default: return 'person-outline';
    }
  }

  /**
   * Retorna a cor baseada no parentesco da pessoa
   */
  obterCorParentesco(parentesco: string): string {
    switch (parentesco) {
      case 'responsavel': return 'primary';
      case 'aluno': return 'secondary';
      case 'integrante': return 'tertiary';
      default: return 'medium';
    }
  }

  /**
   * Retorna a descrição do parentesco
   */
  obterDescricaoParentesco(parentesco: string): string {
    switch (parentesco) {
      case 'responsavel': return 'Responsável';
      case 'aluno': return 'Aluno';
      case 'integrante': return 'Integrante da Família';
      default: return 'Membro';
    }
  }

  /**
   * Retorna ícone baseado na categoria do documento
   */
  obterIconeDocumento(categoria: string): string {
    return this.responsavelDocumentosService.obterIconeCategoria(categoria);
  }

  /**
   * Retorna cor baseada no status do documento
   */
  obterCorStatus(status: string): string {
    return this.responsavelDocumentosService.obterCorStatus(status);
  }

  /**
   * Anexa um documento
   */
  async anexarDocumento(documento: DocumentoIndividual) {
    const alert = await this.alertController.create({
      header: 'Anexar Documento',
      message: `Selecionar arquivo para: ${documento.tipoDocumento.nome}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Selecionar Arquivo', handler: () => { this.selecionarArquivo(documento); } }
      ]
    });
    await alert.present();
  }

  /**
   * Seleciona arquivo para upload
   */
  private async selecionarArquivo(documento: DocumentoIndividual) {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.jpg,.jpeg,.png';
    input.style.display = 'none';
    input.onchange = async (event: any) => {
      const arquivo = event.target.files[0];
      if (arquivo) {
        await this.enviarArquivo(arquivo, documento);
      }
    };
    document.body.appendChild(input);
    input.click();
    document.body.removeChild(input);
  }

  /**
   * Envia arquivo para o servidor
   */
  private async enviarArquivo(arquivo: File, documento: DocumentoIndividual) {
    const validacao = this.responsavelDocumentosService.validarArquivo(arquivo);
    if (!validacao.valido) {
      await this.mostrarToast(validacao.erro!, 'danger');
      return;
    }

    const loading = await this.loadingController.create({ 
      message: 'Enviando documento...', 
      spinner: 'crescent' 
    });
    await loading.present();

    try {
      const idPessoa = this.pessoaSelecionada!.pessoa.id;
      await this.responsavelDocumentosService.anexarDocumento(
        arquivo, 
        documento.idDocumentoMatricula, 
        idPessoa
      ).toPromise();
      
      await this.mostrarToast(`Documento ${arquivo.name} anexado com sucesso!`, 'success');
      await this.carregarDocumentosFamilia();
    } catch (error: any) {
      console.error('Erro ao anexar documento:', error);
      const mensagem = error?.error?.erro || 'Erro ao anexar documento';
      await this.mostrarToast(mensagem, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Baixa um documento
   */
  async baixarDocumento(documento: DocumentoIndividual) {
    if (documento.status === 'pendente') {
      await this.mostrarToast('Documento ainda não foi anexado', 'warning');
      return;
    }

    const loading = await this.loadingController.create({ 
      message: 'Baixando documento...', 
      spinner: 'crescent' 
    });
    await loading.present();

    try {
      const blob = await this.responsavelDocumentosService.baixarDocumento(documento.idDocumentoMatricula).toPromise();
      if (!blob) {
        await this.mostrarToast('Erro ao baixar documento', 'danger');
        return;
      }

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nomeArquivo || `documento_${documento.idDocumentoMatricula}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      await this.mostrarToast('Download concluído!', 'success');
    } catch (error: any) {
      console.error('Erro ao baixar documento:', error);
      await this.mostrarToast('Erro ao baixar documento', 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  /**
   * Remove um documento
   */
  async removerDocumento(documento: DocumentoIndividual) {
    if (documento.status === 'pendente') {
      await this.mostrarToast('Documento não foi anexado ainda', 'warning');
      return;
    }

    const alert = await this.alertController.create({
      header: 'Remover Documento',
      message: `Tem certeza que deseja remover o documento: ${documento.tipoDocumento.nome}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Remover', cssClass: 'danger', handler: async () => { await this.confirmarRemocao(documento); } }
      ]
    });
    await alert.present();
  }

  /**
   * Confirma remoção do documento
   */
  private async confirmarRemocao(documento: DocumentoIndividual) {
    try {
      const idPessoa = this.pessoaSelecionada!.pessoa.id;
      await this.responsavelDocumentosService.removerDocumento(
        documento.idDocumentoMatricula, 
        idPessoa
      ).toPromise();
      
      await this.mostrarToast('Documento removido com sucesso!', 'success');
      await this.carregarDocumentosFamilia();
    } catch (error: any) {
      console.error('Erro ao remover documento:', error);
      await this.mostrarToast('Erro ao remover documento', 'danger');
    }
  }

  /**
   * Mostra toast com mensagem
   */
  async mostrarToast(mensagem: string, cor: string = 'primary') {
    const toast = await this.toastController.create({ 
      message: mensagem, 
      color: cor, 
      duration: 2500 
    });
    await toast.present();
  }

  /**
   * Obtém estatísticas de documentos para uma pessoa
   */
  obterEstatisticasPessoa(pessoa: DocumentoPorPessoa): { pendentes: number; total: number } {
    const pendentes = pessoa.documentos.filter(doc => doc.status === 'pendente').length;
    const total = pessoa.documentos.length;
    return { pendentes, total };
  }

  /**
   * Método de debug para testar dados
   */
  debugDados() {
    console.log('🐛 DEBUG - Estado atual:');
    console.log('👤 Usuário logado:', this.usuarioLogado);
    console.log('👨‍👩‍👧‍👦 Família documentos:', this.familiaDocumentos);
    console.log('👤 Pessoa selecionada:', this.pessoaSelecionada);
    console.log('⏳ Carregando documentos:', this.documentosCarregando);
    
    if (this.familiaDocumentos) {
      console.log('📊 Resumo:', this.familiaDocumentos.resumo);
      console.log('👥 Pessoas da família:', this.familiaDocumentos.documentosPorPessoa.length);
      
      this.familiaDocumentos.documentosPorPessoa.forEach((pessoa, index) => {
        console.log(`${index + 1}. ${pessoa.pessoa.nome} (${pessoa.pessoa.parentesco}) - ${pessoa.documentos.length} documentos`);
      });
    }
  }
}
