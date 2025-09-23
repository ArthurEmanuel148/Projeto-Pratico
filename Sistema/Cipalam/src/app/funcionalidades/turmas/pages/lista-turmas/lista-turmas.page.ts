import { Component, OnInit } from '@angular/core';
import { TurmasService, Turma, AlunoTurma } from '../../services/turmas.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-lista-turmas',
    templateUrl: './lista-turmas.page.html',
    styleUrls: ['./lista-turmas.page.scss'],
    standalone: false
})
export class ListaTurmasPage implements OnInit {
    turmas: Turma[] = [];
    carregando = true;

    constructor(
        private turmasService: TurmasService,
        private router: Router
    ) { }

    ngOnInit() {
        this.carregarTurmas();
    }

    carregarTurmas() {
        this.carregando = true;
        this.turmasService.listarTurmas().subscribe({
            next: (turmas) => {
                this.turmas = turmas;
                this.carregando = false;
            },
            error: (error) => {
                console.error('Erro ao carregar turmas:', error);
                this.carregando = false;
            }
        });
    }

    abrirDetalheTurma(turma: Turma) {
        this.router.navigate(['/sistema/turmas/detalhe', turma.id]);
    }
}