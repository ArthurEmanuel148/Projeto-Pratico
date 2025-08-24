import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { Turma, TurmaDisponivel } from '../../models/turma.model';

@Component({
  selector: 'app-seletor-turma',
  templateUrl: './seletor-turma.component.html',
  styleUrls: ['./seletor-turma.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule]
})
export class SeletorTurmaComponent implements OnInit {

  @Input() turmasDisponiveis: TurmaDisponivel[] = [];

  turmaSelecionada: Turma | null = null;
  turmasFiltradas: TurmaDisponivel[] = [];
  filtroTexto: string = '';
  filtroPeriodo: string = '';
  filtroAtividade: string = '';

  constructor(private modalController: ModalController) { }

  ngOnInit() {
    this.aplicarFiltros();
  }

  aplicarFiltros() {
    this.turmasFiltradas = this.turmasDisponiveis.filter(turmaDisp => {
      const turma = turmaDisp.turma;
      let passa = true;

      // Filtro por texto (nome da turma ou atividade)
      if (this.filtroTexto) {
        const texto = this.filtroTexto.toLowerCase();
        passa = passa && (
          turma.nomeTurma.toLowerCase().includes(texto) ||
          turma.atividade.toLowerCase().includes(texto)
        );
      }

      // Filtro por período
      if (this.filtroPeriodo) {
        passa = passa && turma.periodo === this.filtroPeriodo;
      }

      // Filtro por atividade
      if (this.filtroAtividade) {
        passa = passa && turma.atividade.toLowerCase().includes(this.filtroAtividade.toLowerCase());
      }

      return passa;
    });
  }

  selecionarTurma(turma: Turma) {
    this.turmaSelecionada = turma;
  }

  confirmarSelecao() {
    if (this.turmaSelecionada) {
      this.modalController.dismiss({
        turmaSelecionada: this.turmaSelecionada
      });
    }
  }

  cancelar() {
    this.modalController.dismiss();
  }

  limparFiltros() {
    this.filtroTexto = '';
    this.filtroPeriodo = '';
    this.filtroAtividade = '';
    this.aplicarFiltros();
  }

  // Helpers para template
  getPeriodoTexto(periodo: string): string {
    const periodos: { [key: string]: string } = {
      'MANHA': 'Manhã',
      'TARDE': 'Tarde',
      'NOITE': 'Noite',
      'INTEGRAL': 'Integral'
    };
    return periodos[periodo] || periodo;
  }

  getCorPeriodo(periodo: string): string {
    const cores: { [key: string]: string } = {
      'MANHA': 'warning',
      'TARDE': 'primary',
      'NOITE': 'dark',
      'INTEGRAL': 'secondary'
    };
    return cores[periodo] || 'medium';
  }

  getStatusVagas(turma: Turma): { cor: string, texto: string } {
    const percentualOcupacao = (turma.capacidadeOcupada / turma.capacidadeTotal) * 100;

    if (turma.vagasDisponiveis === 0) {
      return { cor: 'danger', texto: 'Lotada' };
    } else if (percentualOcupacao >= 80) {
      return { cor: 'warning', texto: 'Poucas vagas' };
    } else {
      return { cor: 'success', texto: 'Disponível' };
    }
  }

  formatarHorario(inicio?: string, fim?: string): string {
    if (inicio && fim) {
      return `${inicio} às ${fim}`;
    }
    return 'Horário a definir';
  }

  formatarIdade(min?: number, max?: number): string {
    if (min && max) {
      return `${min} a ${max} anos`;
    } else if (min) {
      return `A partir de ${min} anos`;
    } else if (max) {
      return `Até ${max} anos`;
    }
    return 'Todas as idades';
  }
}
