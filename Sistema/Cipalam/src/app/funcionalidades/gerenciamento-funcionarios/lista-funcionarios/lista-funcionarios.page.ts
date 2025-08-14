import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';

@Component({
    selector: 'app-lista-funcionarios',
    templateUrl: './lista-funcionarios.page.html',
    styleUrls: ['./lista-funcionarios.page.scss']
})
export class ListaFuncionariosPage implements OnInit {
    funcionarios: any[] = [];
    loading = false;
    podeGerenciarFuncionarios = false;

    constructor(
        private authService: AuthService,
        private router: Router
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
        // Por enquanto, vamos simular uma lista de funcionários
        // Em uma implementação real, isso viria de um serviço HTTP
        setTimeout(() => {
            this.funcionarios = [
                { id: 1, nome: 'João Silva', cpf: '123.456.789-00', tipo: 'funcionario' },
                { id: 2, nome: 'Maria Santos', cpf: '987.654.321-00', tipo: 'funcionario' }
            ];
            this.loading = false;
        }, 1000);
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
