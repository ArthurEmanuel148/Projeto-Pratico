import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';
import { FuncionarioService } from '../../../core/services/funcionario.service';

@Component({
    selector: 'app-lista-funcionarios',
    templateUrl: './lista-funcionarios.page.html',
    styleUrls: ['./lista-funcionarios.page.scss'],
    standalone: false
})
export class ListaFuncionariosPage implements OnInit {
    funcionarios: any[] = [];
    funcionariosFiltrados: any[] = [];
    loading = false;
    podeGerenciarFuncionarios = false;

    // Propriedades de filtro
    filtroTexto: string = '';
    filtroStatus: string = '';
    mostrarFiltrosAvancados = false;

    constructor(
        private authService: AuthService,
        private router: Router,
        private funcionarioService: FuncionarioService
    ) { }

    ngOnInit() {
        this.verificarPermissoes();
        this.carregarFuncionarios();
    }

    verificarPermissoes() {
        const usuario = this.authService.getFuncionarioLogado();
        this.podeGerenciarFuncionarios = !!(usuario?.tipo === 'admin' ||
            usuario?.tipo === 'funcionario' ||
            usuario?.permissoes?.['gerenciamentoFuncionarios']);
    }

    carregarFuncionarios() {
        this.loading = true;

        this.funcionarioService.listarFuncionarios().subscribe({
            next: (funcionarios) => {
                console.log('Funcionários recebidos do backend:', funcionarios);
                this.funcionarios = funcionarios.map(func => ({
                    id: func.id || func.idPessoa,
                    nome: func.nome || func.nmPessoa,
                    email: func.email || 'Email não informado',
                    usuario: func.usuario || 'Usuário não informado'
                }));
                console.log('Funcionários mapeados:', this.funcionarios);
                this.funcionariosFiltrados = [...this.funcionarios];
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar funcionários:', error);
                // Fallback para dados simulados em caso de erro
                this.funcionarios = [
                    { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', usuario: 'joao.silva' },
                    { id: 2, nome: 'Maria Santos', email: 'maria@exemplo.com', usuario: 'maria.santos' }
                ];
                this.funcionariosFiltrados = [...this.funcionarios];
                this.loading = false;
            }
        });
    }

    navegarParaCadastro() {
        this.router.navigate(['/sistema/funcionarios/cadastro']);
    }

    editarFuncionario(id: number) {
        this.router.navigate(['/sistema/funcionarios/cadastro'], { queryParams: { id } });
    }

    ionViewWillEnter() {
        this.carregarFuncionarios();
    }

    // Métodos de filtro
    aplicarFiltros() {
        let funcionariosFiltrados = [...this.funcionarios];

        // Filtro por texto (nome, email ou usuário)
        if (this.filtroTexto && this.filtroTexto.trim()) {
            const texto = this.filtroTexto.toLowerCase().trim();
            funcionariosFiltrados = funcionariosFiltrados.filter(funcionario =>
                funcionario.nome.toLowerCase().includes(texto) ||
                funcionario.email.toLowerCase().includes(texto) ||
                funcionario.usuario.toLowerCase().includes(texto)
            );
        }

        // Filtro por status (todos ativos por enquanto)
        if (this.filtroStatus === 'ativo') {
            // Como todos os funcionários estão ativos, não filtra nada por enquanto
            funcionariosFiltrados = funcionariosFiltrados;
        }

        this.funcionariosFiltrados = funcionariosFiltrados;
    }

    toggleFiltrosAvancados() {
        this.mostrarFiltrosAvancados = !this.mostrarFiltrosAvancados;
    }

    toggleFiltroStatus(status: string) {
        if (this.filtroStatus === status) {
            this.filtroStatus = '';
        } else {
            this.filtroStatus = status;
        }
        this.aplicarFiltros();
    }

    limparFiltros() {
        this.filtroTexto = '';
        this.filtroStatus = '';
        this.aplicarFiltros();
    }
}
