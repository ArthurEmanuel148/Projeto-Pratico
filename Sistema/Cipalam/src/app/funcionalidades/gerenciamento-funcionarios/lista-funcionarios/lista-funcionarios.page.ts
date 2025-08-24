import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService, LoginResponse } from '../../../core/services/auth.service';
import { IonicModule } from "@ionic/angular";
import { FuncionarioService } from 'src/app/core/services/funcionario.service';

@Component({
    selector: 'app-lista-funcionarios',
    templateUrl: './lista-funcionarios.page.html',
    styleUrls: ['./lista-funcionarios.page.scss'],
    standalone: false,
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
            next: (dados) => {
                this.funcionarios = dados;
                this.loading = false;
            },
            error: (erro) => {
                console.error('Erro ao carregar funcionários:', erro);
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
