import { Component, OnInit } from '@angular/core';
import { InteresseMatriculaService } from '../../services/interesse-matricula.service';
import { InteresseMatricula } from '../../models/interesse-matricula.interface';
import { Router } from '@angular/router';


@Component({
  selector: 'app-lista-declaracoes',
  templateUrl: './lista-declaracoes.page.html',
  styleUrls: ['./lista-declaracoes.page.scss'],
  standalone: false
})
export class ListaDeclaracoesPage implements OnInit {
  declaracoes: InteresseMatricula[] = [];
  carregando = true;

  // Quando o backend estiver pronto, descomente e ajuste o endpoint:
// this.http.get<VagasResumo>('/api/vagas-resumo').subscribe(resumo => this.vagasResumo = resumo);

// MOCK:
vagasResumo = {
  total: 40,
  porCota: [
    { tipo: 'Ampla Concorrência', disponiveis: 20 },
    { tipo: 'Cota Social', disponiveis: 15 },
    { tipo: 'Cota PCD', disponiveis: 5 }
  ]
};


  constructor(private interesseService: InteresseMatriculaService, private router: Router) { }

  ngOnInit() {
    this.carregarDeclaracoes();
  }

  carregarDeclaracoes() {
    this.carregando = true;
    this.interesseService.getTodasDeclaracoes().subscribe({
      next: (dados) => {
        this.declaracoes = dados;
        this.carregando = false;
      },
      error: () => this.carregando = false
    });
  }

  abrirDetalhe(declaracao: InteresseMatricula) {
    this.router.navigate(['/paineis/interesse-matricula/detalhe-declaracao', declaracao.protocolo]);
  }
}
