import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TurmasService } from '../../services/turmas.service';
import { AlertController, ModalController } from '@ionic/angular';
import { environment } from '../../../../../environments/environment';

@Component({
    selector: 'app-detalhes-aluno',
    templateUrl: './detalhes-aluno.page.html',
    styleUrls: ['./detalhes-aluno.page.scss'],
    standalone: false
})
export class DetalhesAlunoPage implements OnInit {
    alunoId!: number;
    aluno: any = null;
    carregando = true;

    // Controle de seções
    secaoAtiva = 'estudante';

    // Controle de integrantes da família
    integranteSelecionado = 0;
    integranteAtual: any = null;

    // Controle de documentos
    integranteDocumentos = 'todos';
    categoriaDocumentos = 'todos';
    documentos: any[] = [];
    documentosFiltrados: any[] = [];
    carregandoDocumentos = false;
    isLoading = false;

    // Documentos organizados
    documentosFamilia: any[] = [];
    documentosAluno: any[] = [];
    documentosIntegrantes: Map<string, any[]> = new Map();

    constructor(
        private route: ActivatedRoute,
        private turmasService: TurmasService,
        private alertController: AlertController,
        private modalController: ModalController
    ) { }

    ngOnInit() {
        this.alunoId = Number(this.route.snapshot.paramMap.get('id'));
        this.carregarDetalhesAluno();
    }

    carregarDetalhesAluno() {
        this.carregando = true;
        this.turmasService.obterDetalhesAluno(this.alunoId).subscribe({
            next: (response) => {
                console.log('Detalhes do aluno recebidos:', response);
                this.aluno = response;

                // Inicializar o primeiro integrante se houver família
                if (this.aluno.integrantesRenda) {
                    const integrantes = this.getIntegrantes(this.aluno.integrantesRenda);
                    if (integrantes.length > 0) {
                        this.integranteAtual = integrantes[0];
                    }
                }

                this.carregando = false;
            },
            error: (error) => {
                console.error('Erro ao carregar detalhes do aluno:', error);
                this.carregando = false;
                this.mostrarErro('Erro ao carregar os detalhes do aluno');
            }
        });
    }

    // Controle de seções
    mudarSecao(event: any) {
        this.secaoAtiva = event.detail.value;

        // Carregar documentos quando entrar na seção de documentos
        if (this.secaoAtiva === 'documentos' && this.documentos.length === 0) {
            this.carregarDocumentos();
        }
    }

    // Métodos para trabalhar com integrantes da família
    getIntegrantes(integrantesRenda: string): any[] {
        if (!integrantesRenda) return [];

        try {
            const integrantes = JSON.parse(integrantesRenda);
            return Array.isArray(integrantes) ? integrantes : [];
        } catch (error) {
            console.error('Erro ao parsear integrantes:', error);
            return [];
        }
    }

    mudarIntegrante(event: any) {
        const index = event.detail.value;
        const integrantes = this.getIntegrantes(this.aluno.integrantesRenda);
        this.integranteAtual = integrantes[index] || null;
        this.integranteSelecionado = index;
    }

    // Métodos para cálculos
    calcularIdade(dataNascimento: string): number {
        if (!dataNascimento) return 0;

        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const m = hoje.getMonth() - nascimento.getMonth();

        if (m < 0 || (m === 0 && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return idade;
    }

    calcularRendaTotal(): number {
        const integrantes = this.getIntegrantes(this.aluno.integrantesRenda);
        return integrantes.reduce((total, integrante) => total + (integrante.renda || 0), 0);
    }

    calcularRendaPerCapita(): number {
        const integrantes = this.getIntegrantes(this.aluno.integrantesRenda);
        const total = this.calcularRendaTotal();
        return integrantes.length > 0 ? total / integrantes.length : 0;
    }

    // Métodos para formatação
    formatarTipoCota(tipo: string): string {
        const tipos: { [key: string]: string } = {
            'cota_economica': 'Cota Econômica',
            'cota_funcionario': 'Cota Funcionário',
            'cota_livre': 'Cota Livre'
        };

        return tipos[tipo] || tipo;
    }

    formatarStatus(status: string): string {
        const statusMap: { [key: string]: string } = {
            'interesse_declarado': 'Interesse Declarado',
            'aguardando_aprovacao': 'Aguardando Aprovação',
            'aprovado': 'Aprovado',
            'matriculado': 'Matriculado',
            'rejeitado': 'Rejeitado'
        };

        return statusMap[status] || status;
    }

    // Métodos para documentos
    carregarDocumentos() {
        if (this.alunoId) {
            this.isLoading = true;
            this.carregandoDocumentos = true;
            console.log('Carregando documentos para aluno ID:', this.alunoId);

            this.turmasService.obterDocumentosAluno(this.alunoId).subscribe({
                next: (response) => {
                    console.log('Resposta dos documentos:', response);
                    this.documentos = response || [];
                    this.organizarDocumentosPorCategoria();
                    this.isLoading = false;
                    this.carregandoDocumentos = false;
                },
                error: (error) => {
                    console.error('Erro ao carregar documentos:', error);
                    this.isLoading = false;
                    this.carregandoDocumentos = false;
                    this.mostrarErro('Erro ao carregar documentos');
                }
            });
        }
    }

    organizarDocumentosPorCategoria() {
        console.log('Organizando documentos por categoria...');

        // Limpar arrays anteriores
        this.documentosFamilia = [];
        this.documentosAluno = [];
        this.documentosIntegrantes.clear();

        if (!this.documentos || this.documentos.length === 0) {
            console.log('Nenhum documento encontrado');
            return;
        }

        this.documentos.forEach((documento: any) => {
            console.log('Processando documento:', documento.tipoDocumento, '- Categoria:', documento.categoria);

            // Converter data para formato brasileiro se necessário
            if (documento.dataEnvio) {
                const data = new Date(documento.dataEnvio);
                documento.dataEnvioFormatada = data.toLocaleDateString('pt-BR') + ' às ' +
                    data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
            }

            switch (documento.categoria?.toUpperCase()) {
                case 'FAMILIA':
                    this.documentosFamilia.push(documento);
                    console.log('Adicionado à categoria FAMÍLIA:', documento.tipoDocumento);
                    break;

                case 'ALUNO':
                    this.documentosAluno.push(documento);
                    console.log('Adicionado à categoria ALUNO:', documento.tipoDocumento);
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
                    console.log('Categoria não reconhecida:', documento.categoria);
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

    filtrarDocumentosPorCategoria(event: any) {
        this.categoriaDocumentos = event.detail.value;
        console.log('Filtrando documentos por categoria:', this.categoriaDocumentos);

        // Não é necessário fazer nada especial aqui, 
        // pois o template já usa as variáveis organizadas diretamente
    }

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
                return this.documentos;
        }
    }

    // Método removido - usando nova organização por categorias

    filtrarDocumentosPorIntegrante(event: any) {
        this.integranteDocumentos = event.detail.value;
        // Não é mais necessário filtrar - a organização é feita automaticamente
    }

    verDocumentosIntegrante(integrante: any) {
        // Mudar para a seção de documentos e categoria de integrantes
        this.categoriaDocumentos = 'integrantes';
        this.secaoAtiva = 'documentos';

        // Carregar documentos se ainda não foram carregados
        if (this.documentos.length === 0) {
            this.carregarDocumentos();
        }
    }

    verDocumento(documento: any) {
        if (documento.nomeArquivo) {
            // Abrir documento em nova aba
            const url = `${environment.apiUrl.replace('/api', '')}/cipalam_documentos/${documento.nomeArquivo}`;
            window.open(url, '_blank');
        } else {
            this.mostrarErro('Documento não foi anexado ainda');
        }
    }

    async baixarTodosDocumentos() {
        const alert = await this.alertController.create({
            header: 'Download dos Documentos',
            message: 'Esta funcionalidade será implementada em breve para baixar todos os documentos em um arquivo ZIP.',
            buttons: ['OK']
        });
        await alert.present();
    }

    async aprovarTodosDocumentos() {
        const alert = await this.alertController.create({
            header: 'Confirmar Aprovação',
            message: 'Deseja aprovar todos os documentos anexados desta família?',
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Aprovar Todos',
                    handler: () => {
                        this.executarAprovacaoEmMassa();
                    }
                }
            ]
        });
        await alert.present();
    }

    async executarAprovacaoEmMassa() {
        const documentosParaAprovar = this.documentos.filter(doc => doc.status === 'enviado');

        if (documentosParaAprovar.length === 0) {
            this.mostrarErro('Não há documentos anexados para aprovar');
            return;
        }

        const loading = await this.alertController.create({
            header: 'Aprovando Documentos',
            message: 'Processando aprovações...',
            backdropDismiss: false
        });
        await loading.present();

        let aprovados = 0;
        let erros = 0;

        for (const documento of documentosParaAprovar) {
            try {
                await this.turmasService.aprovarDocumento(documento.id, 'Aprovação em massa').toPromise();
                aprovados++;
            } catch (error) {
                console.error('Erro ao aprovar documento:', error);
                erros++;
            }
        }

        await loading.dismiss();

        const alert = await this.alertController.create({
            header: 'Resultado',
            message: `${aprovados} documentos aprovados com sucesso. ${erros > 0 ? `${erros} erros encontrados.` : ''}`,
            buttons: ['OK']
        });
        await alert.present();

        // Recarregar documentos
        this.carregarDocumentos();
    }

    async aprovarDocumento(documento: any) {
        const alert = await this.alertController.create({
            header: 'Aprovar Documento',
            message: `Deseja aprovar o documento "${documento.tipoDocumento}"?`,
            inputs: [
                {
                    name: 'observacoes',
                    type: 'textarea',
                    placeholder: 'Observações (opcional)'
                }
            ],
            buttons: [
                {
                    text: 'Cancelar',
                    role: 'cancel'
                },
                {
                    text: 'Aprovar',
                    handler: (data) => {
                        this.executarAprovacao(documento.id, data.observacoes);
                    }
                }
            ]
        });
        await alert.present();
    }

    async rejeitarDocumento(documento: any) {
        const alert = await this.alertController.create({
            header: 'Rejeitar Documento',
            message: `Deseja rejeitar o documento "${documento.tipoDocumento}"?`,
            inputs: [
                {
                    name: 'motivo',
                    type: 'textarea',
                    placeholder: 'Motivo da rejeição (obrigatório)',
                    attributes: {
                        required: true,
                        minlength: 10
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
                    handler: (data) => {
                        if (!data.motivo || data.motivo.trim().length < 10) {
                            this.mostrarErro('É necessário informar um motivo com pelo menos 10 caracteres');
                            return false;
                        }
                        this.executarRejeicao(documento.id, data.motivo);
                        return true;
                    }
                }
            ]
        });
        await alert.present();
    }

    executarAprovacao(documentoId: number, observacoes?: string) {
        this.turmasService.aprovarDocumento(documentoId, observacoes).subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.mostrarSucesso('Documento aprovado com sucesso!');
                    this.carregarDocumentos(); // Recarregar lista
                } else {
                    this.mostrarErro('Erro ao aprovar documento: ' + response.message);
                }
            },
            error: (error: any) => {
                console.error('Erro ao aprovar documento:', error);
                this.mostrarErro('Erro ao aprovar documento');
            }
        });
    }

    executarRejeicao(documentoId: number, motivo: string) {
        this.turmasService.rejeitarDocumento(documentoId, motivo).subscribe({
            next: (response: any) => {
                if (response.success) {
                    this.mostrarSucesso('Documento rejeitado com sucesso!');
                    this.carregarDocumentos(); // Recarregar lista
                } else {
                    this.mostrarErro('Erro ao rejeitar documento: ' + response.message);
                }
            },
            error: (error: any) => {
                console.error('Erro ao rejeitar documento:', error);
                this.mostrarErro('Erro ao rejeitar documento');
            }
        });
    }

    async mostrarSucesso(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'Sucesso',
            message: mensagem,
            buttons: ['OK'],
            cssClass: 'alert-success'
        });
        await alert.present();
    }

    getStatusColor(status: string): string {
        switch (status?.toLowerCase()) {
            case 'aprovado': return 'success';
            case 'rejeitado': return 'danger';
            case 'anexado': return 'warning';
            case 'pendente': return 'medium';
            default: return 'medium';
        }
    }

    getStatusIcon(status: string): string {
        switch (status?.toLowerCase()) {
            case 'aprovado': return 'checkmark-circle';
            case 'rejeitado': return 'close-circle';
            case 'anexado': return 'document-attach';
            case 'pendente': return 'time';
            default: return 'help-circle';
        }
    }

    // Métodos para contar documentos por status
    contarDocumentosPorStatus(status: string): number {
        return this.documentos.filter(doc => doc.status === status).length;
    }

    temDocumentosAnexados(): boolean {
        return this.documentos.some(doc => doc.status === 'anexado');
    }

    // Método removido - usando nova implementação acima

    // Métodos antigos - comentados para usar nova organização
    /*
    getCategorias(): string[] {
        const categorias = [...new Set(this.documentosFiltrados.map(d => d.categoria))];
        return categorias.sort();
    }

    getDocumentosPorCategoria(categoria: string): any[] {
        return this.documentosFiltrados.filter(d => d.categoria === categoria);
    }

    getDocumentosPorStatus(status: string): any[] {
        return this.documentosFiltrados.filter(d => d.status === status);
    }
    */

    getIconeDocumento(documento: any): string {
        if (documento.caminhoArquivo) {
            return 'document-attach-outline';
        }
        switch (documento.status) {
            case 'aprovado': return 'checkmark-circle-outline';
            case 'rejeitado': return 'close-circle-outline';
            case 'enviado': return 'document-text-outline';
            default: return 'document-outline';
        }
    }

    getCorStatus(status: string): string {
        switch (status) {
            case 'aprovado': return 'success';
            case 'rejeitado': return 'danger';
            case 'enviado': return 'warning';
            case 'pendente': return 'medium';
            default: return 'medium';
        }
    }

    getTotalDocumentosIntegrantes(): number {
        let total = 0;
        this.documentosIntegrantes.forEach(docs => {
            total += docs.length;
        });
        return total;
    }

    // Método para visualizar documento
    async visualizarDocumento(documento: any) {
        if (!documento.caminhoArquivo) {
            this.mostrarErro('Documento não possui arquivo anexado');
            return;
        }

        try {
            // Por enquanto, apenas exibir informações do documento
            const alert = await this.alertController.create({
                header: 'Documento: ' + documento.tipoDocumento,
                message: `
                    <strong>Status:</strong> ${documento.statusFormatado || documento.status}<br>
                    <strong>Arquivo:</strong> ${documento.nomeArquivoOriginal || 'Sem nome'}<br>
                    ${documento.dataEnvio ? '<strong>Data de envio:</strong> ' + new Date(documento.dataEnvio).toLocaleString() + '<br>' : ''}
                    ${documento.observacoes ? '<strong>Observações:</strong> ' + documento.observacoes + '<br>' : ''}
                    ${documento.motivoRejeicao ? '<strong>Motivo da rejeição:</strong> ' + documento.motivoRejeicao : ''}
                `,
                buttons: ['OK']
            });

            await alert.present();
        } catch (error) {
            console.error('Erro ao visualizar documento:', error);
            this.mostrarErro('Erro ao carregar documento');
        }
    }

    // Método para exibir erros
    async mostrarErro(mensagem: string) {
        const alert = await this.alertController.create({
            header: 'Erro',
            message: mensagem,
            buttons: ['OK']
        });
        await alert.present();
    }
}