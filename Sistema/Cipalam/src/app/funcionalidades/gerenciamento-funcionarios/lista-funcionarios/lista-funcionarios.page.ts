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
    loading = false;
    podeGerenciarFuncionarios = false;

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
                this.loading = false;
            },
            error: (error) => {
                console.error('Erro ao carregar funcionários:', error);
                // Fallback para dados simulados em caso de erro
                this.funcionarios = [
                    { id: 1, nome: 'João Silva', email: 'joao@exemplo.com', usuario: 'joao.silva' },
                    { id: 2, nome: 'Maria Santos', email: 'maria@exemplo.com', usuario: 'maria.santos' }
                ];
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
}
