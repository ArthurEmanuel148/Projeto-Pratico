import { Component, OnInit } from '@angular/core';
import { AuthService } from '../core/services/auth.service';
import { DocumentoService } from '../core/services/documento.service';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-painel-responsavel',
  templateUrl: './painel-responsavel.page.html',
  styleUrls: ['./painel-responsavel.page.scss'],
  standalone: false,
})
export class PainelResponsavelPage implements OnInit {
  usuarioLogado: any;
  documentosPendentes: any[] = [];
  documentosCarregando: boolean = false;

  constructor(
    private authService: AuthService,
    private documentoService: DocumentoService,
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
        pessoaId: 4,
        pessoa: { idPessoa: 4, nmPessoa: 'Ana Costa Lima' },
        nomePessoa: 'Ana Costa Lima'
      };
    }
    
    this.carregarDocumentosPendentes();
  }

  async carregarDocumentosPendentes() {
    console.log('🔍 Iniciando carregamento de documentos...');
    console.log('🔍 Usuario logado completo:', JSON.stringify(this.usuarioLogado, null, 2));
    
    // Buscar ID da pessoa logada - verificar todas as possibilidades
    let idPessoa = this.usuarioLogado?.pessoaId ||
      this.usuarioLogado?.pessoa?.idPessoa ||
      this.usuarioLogado?.usuarioId ||
      this.usuarioLogado?.idPessoa;

    // Se não encontrou, tentar pegar do localStorage diretamente
    if (!idPessoa) {
      try {
        const usuarioSalvo = localStorage.getItem('usuarioLogado');
        if (usuarioSalvo) {
          const usuario = JSON.parse(usuarioSalvo);
          idPessoa = usuario?.pessoaId || usuario?.pessoa?.idPessoa || usuario?.usuarioId || usuario?.idPessoa;
        }
      } catch (error) {
        console.error('Erro ao recuperar usuário do localStorage:', error);
      }
    }

    // TEMPORÁRIO: Para testes específicos da Ana Costa Lima
    if (!idPessoa) {
      console.warn('⚠️ ID da pessoa não encontrado, usando ID de teste para Ana Costa Lima');
      idPessoa = 4; // ID da Ana Costa Lima no banco
    }

    console.log('🔍 ID da pessoa para carregar documentos:', idPessoa);

    if (!idPessoa) {
      console.error('❌ ID da pessoa não encontrado para carregar documentos');
      await this.mostrarToast('Erro: ID do usuário não encontrado', 'danger');
      return;
    }

    this.documentosCarregando = true;

    try {
      console.log('🌐 Fazendo chamada para API com ID:', idPessoa);
      console.log('🌐 URL da API:', `${this.documentoService['apiUrl']}/pendentes/${idPessoa}`);

      const documentos = await this.documentoService.listarDocumentosPendentes(idPessoa).toPromise();
      console.log('📋 Documentos recebidos da API:', documentos);
      console.log('📊 Quantidade de documentos:', documentos?.length || 0);

      // Garantir que documentos é um array
      this.documentosPendentes = Array.isArray(documentos) ? documentos : [];

      console.log('📝 Documentos pendentes processados:', this.documentosPendentes);
      console.log('📈 Total após processamento:', this.documentosPendentes.length);

      // Log detalhado dos documentos por categoria
      if (this.documentosPendentes.length > 0) {
        const familiaCount = this.documentosPendentes.filter(doc => 
          doc.categoria === 'familia' || doc.categoria === 'responsavel').length;
        const alunoCount = this.documentosPendentes.filter(doc => doc.categoria === 'aluno').length;
        const cotaCount = this.documentosPendentes.filter(doc => doc.categoria === 'cota').length;
        
        console.log('👨‍👩‍👧‍👦 Documentos família/responsável:', familiaCount);
        console.log('🎓 Documentos aluno:', alunoCount);
        console.log('🎯 Documentos cota:', cotaCount);

        // Log das categorias encontradas
        const categorias = [...new Set(this.documentosPendentes.map(doc => doc.categoria))];
        console.log('📂 Categorias encontradas:', categorias);

        // Log dos nomes dos documentos
        this.documentosPendentes.forEach((doc, index) => {
          console.log(`📄 Documento ${index + 1}:`, {
            nome: doc.nomeDocumento,
            categoria: doc.categoria,
            status: doc.status,
            id: doc.idDocumento
          });
        });

        console.log('✅ Documentos carregados com sucesso!');
      } else {
        console.warn('⚠️ Nenhum documento foi retornado da API');
        await this.mostrarToast('Nenhum documento pendente encontrado', 'warning');
      }
    } catch (error: any) {
      console.error('❌ Erro ao carregar documentos:', error);
      console.error('❌ Detalhes do erro:', {
        message: error?.message,
        status: error?.status,
        statusText: error?.statusText,
        url: error?.url
      });
      await this.mostrarToast('Erro ao carregar documentos pendentes', 'danger');
    } finally {
      this.documentosCarregando = false;
    }
  }

  obterDocumentosPorCategoria(categoria: string): any[] {
    if (!this.documentosPendentes || this.documentosPendentes.length === 0) {
      console.log(`🔍 Categoria '${categoria}': Nenhum documento pendente disponível`);
      return [];
    }

    const documentosFiltrados = this.documentosPendentes.filter(doc => {
      if (!doc || !doc.categoria) {
        console.warn('Documento sem categoria encontrado:', doc);
        return false;
      }

      const categoriaDoc = doc.categoria.toLowerCase().trim();
      const categoriaFiltro = categoria.toLowerCase().trim();

      console.log(`🔍 Comparando categoria '${categoriaDoc}' com filtro '${categoriaFiltro}' para documento '${doc.nomeDocumento}'`);
      return categoriaDoc === categoriaFiltro;
    });

    console.log(`📊 Documentos da categoria '${categoria}':`, documentosFiltrados.length, 'encontrados');
    console.log(`📋 Lista detalhada:`, documentosFiltrados.map(d => ({ nome: d.nomeDocumento, categoria: d.categoria })));
    return documentosFiltrados;
  }

  obterDocumentosResponsavelFamilia(): any[] {
    if (!this.documentosPendentes || this.documentosPendentes.length === 0) {
      console.log('🔍 ResponsavelFamilia: Nenhum documento pendente disponível');
      return [];
    }

    const documentosFiltrados = this.documentosPendentes.filter(doc => {
      if (!doc || !doc.categoria) {
        console.warn('Documento sem categoria encontrado:', doc);
        return false;
      }

      const categoriaDoc = doc.categoria.toLowerCase().trim();
      // Buscar por 'familia' ao invés de 'responsavel'
      const isResponsavelOuFamilia = categoriaDoc === 'responsavel' || categoriaDoc === 'familia';

      console.log(`🔍 Documento '${doc.nomeDocumento}' com categoria '${categoriaDoc}' - É responsável/família: ${isResponsavelOuFamilia}`);
      return isResponsavelOuFamilia;
    });

    console.log(`📊 Documentos de responsável/família:`, documentosFiltrados.length, 'encontrados');
    console.log(`📋 Lista detalhada:`, documentosFiltrados.map(d => ({ nome: d.nomeDocumento, categoria: d.categoria })));
    return documentosFiltrados;
  }

  obterIconeDocumento(categoria: string): string {
    if (this.documentoService.obterIconeDocumento) {
      return this.documentoService.obterIconeDocumento(categoria);
    }

    // Fallback para ícones baseados na categoria
    switch (categoria.toLowerCase()) {
      case 'familia': return 'people-outline';
      case 'aluno': return 'person-outline';
      case 'cota': return 'document-text-outline';
      default: return 'document-outline';
    }
  }

  obterCorStatus(status: string): string {
    if (this.documentoService.obterCorStatus) {
      return this.documentoService.obterCorStatus(status);
    }

    // Fallback para cores baseadas no status
    switch (status?.toLowerCase()) {
      case 'pendente': return 'warning';
      case 'anexado': return 'primary';
      case 'aprovado': return 'success';
      case 'rejeitado': return 'danger';
      default: return 'medium';
    }
  }

  async anexarDocumento(documento: any) {
    const alert = await this.alertController.create({
      header: 'Anexar Documento',
      message: `Selecionar arquivo para: ${documento.nomeDocumento || documento}`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Selecionar Arquivo', handler: () => { this.selecionarArquivo(documento); } }
      ]
    });
    await alert.present();
  }

  private async selecionarArquivo(documento: any) {
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

  private async enviarArquivo(arquivo: File, documento: any) {
    const validacao = this.documentoService.validarArquivo ? this.documentoService.validarArquivo(arquivo) : { valido: true };
    if (!validacao.valido) {
      await this.mostrarToast(validacao.erro!, 'danger');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Enviando documento...', spinner: 'crescent' });
    await loading.present();
    try {
      const idDocumento = documento.idDocumento || documento;
      await this.documentoService.anexarDocumento(arquivo, idDocumento, this.usuarioLogado.idPessoa).toPromise();
      await this.mostrarToast(`Documento ${arquivo.name} anexado com sucesso!`, 'success');
      await this.carregarDocumentosPendentes();
    } catch (error: any) {
      console.error('Erro ao anexar documento:', error);
      const mensagem = error?.error?.erro || 'Erro ao anexar documento';
      await this.mostrarToast(mensagem, 'danger');
    } finally {
      await loading.dismiss();
    }
  }

  async baixarDocumento(documento: any) {
    if (documento.status === 'pendente') {
      await this.mostrarToast('Documento ainda não foi anexado', 'warning');
      return;
    }
    const loading = await this.loadingController.create({ message: 'Baixando documento...', spinner: 'crescent' });
    await loading.present();
    try {
      const blob = await this.documentoService.baixarDocumento(documento.idDocumento).toPromise();
      if (!blob) {
        await this.mostrarToast('Erro ao baixar documento', 'danger');
        return;
      }
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = documento.nomeArquivoOriginal || `documento_${documento.idDocumento}`;
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

  async removerDocumento(documento: any) {
    if (documento.status === 'pendente') {
      await this.mostrarToast('Documento não foi anexado ainda', 'warning');
      return;
    }
    const alert = await this.alertController.create({
      header: 'Remover Documento',
      message: `Tem certeza que deseja remover o documento: ${documento.nomeDocumento}?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        { text: 'Remover', cssClass: 'danger', handler: async () => { await this.confirmarRemocao(documento); } }
      ]
    });
    await alert.present();
  }

  private async confirmarRemocao(documento: any) {
    try {
      await this.documentoService.removerDocumento(documento.idDocumento, this.usuarioLogado.idPessoa).toPromise();
      await this.mostrarToast('Documento removido com sucesso!', 'success');
      await this.carregarDocumentosPendentes();
    } catch (error: any) {
      console.error('Erro ao remover documento:', error);
      await this.mostrarToast('Erro ao remover documento', 'danger');
    }
  }

  async mostrarToast(mensagem: string, cor: string) {
    const toast = await this.toastController.create({ message: mensagem, color: cor, duration: 2500 });
    await toast.present();
  }

  // Método de debug para testar dados
  debugDados() {
    console.log('🐛 DEBUG - Estado atual:');
    console.log('📊 Documentos pendentes:', this.documentosPendentes.length);
    console.log('📋 Documentos família/responsável:', this.obterDocumentosResponsavelFamilia().length);
    console.log('🎓 Documentos aluno:', this.obterDocumentosPorCategoria('aluno').length);
    console.log('🎯 Documentos cota:', this.obterDocumentosPorCategoria('cota').length);
    console.log('👤 Usuário logado:', this.usuarioLogado);
    console.log('⏳ Carregando documentos:', this.documentosCarregando);
    
    if (this.documentosPendentes.length > 0) {
      console.log('📄 Lista completa de documentos:');
      this.documentosPendentes.forEach((doc, index) => {
        console.log(`${index + 1}. ${doc.nomeDocumento} (${doc.categoria}) - ${doc.status}`);
      });
    }
  }
}
