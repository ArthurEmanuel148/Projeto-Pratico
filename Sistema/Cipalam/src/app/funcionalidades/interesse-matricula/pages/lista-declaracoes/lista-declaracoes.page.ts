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

  // TODO: Implementar endpoint para buscar resumo de vagas do banco
  vagasResumo = {
    total: 0,
    porCota: [] as Array<{ tipo: string, disponiveis: number }>
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
    this.router.navigate(['/sistema/matriculas/detalhe-declaracao', declaracao.protocolo]);
  }

  formatarTipoCota(tipoCota: string | null | undefined): string {
    if (!tipoCota) return 'Não especificado';

    const mapeamento: Record<string, string> = {
      'funcionario': 'Funcionário',
      'economica': 'Cota Econômica',
      'livre': 'Ampla Concorrência',
      'social': 'Cota Social',
      'pcd': 'Pessoa com Deficiência'
    };

    return mapeamento[tipoCota] || tipoCota;
  }

  iniciarMatricula(declaracao: InteresseMatricula) {
    // Implementar navegação para página de matrícula
    this.router.navigate(['/sistema/matriculas/inicio-matricula', declaracao.id]);
  }
}
