import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InteresseMatricula } from '../../models/interesse-matricula.interface'; // Ajuste o caminho

@Component({
  selector: 'app-comprovante-declaracao',
  templateUrl: './comprovante-declaracao.component.html',
  styleUrls: ['./comprovante-declaracao.component.scss'],
  standalone: false
})
export class ComprovanteDeclaracaoComponent implements OnInit {
  @Input() dadosComprovante: InteresseMatricula | null = null;
  @Output() novaDeclaracao = new EventEmitter<void>();

  protocoloSimulado: string = '';

  // Reutiliza os mapas da etapa de revisão
  mapaCotas: { [key: string]: string } = {
    funcionario: 'Cota de Funcionário',
    economica: 'Cota Econômica (Renda)',
    livre: 'Cota Livre (Ampla Concorrência)',
  };
  mapaHorarios: { [key: string]: string } = {
    segundaManha: 'Segunda-feira - Manhã',
    segundaTarde: 'Segunda-feira - Tarde',
    tercaManha: 'Terça-feira - Manhã',
    tercaTarde: 'Terça-feira - Tarde',
  };

  constructor() { }

  ngOnInit() {
    if (this.dadosComprovante) {
      // Simula um protocolo (no futuro viria da resposta do backend)
      this.protocoloSimulado = `INT-${new Date().getFullYear()}${String(Math.random()).substring(2, 8)}`;
      console.log("Dados para Comprovante:", this.dadosComprovante);
    }
  }

  fazerNova() {
    this.novaDeclaracao.emit();
  }

  getValorCota(chave: string | null | undefined): string {
    return chave ? this.mapaCotas[chave] || 'Não informado' : 'Não informado';
  }

  getNomesHorarios(chaves: string[] | undefined): string {
    if (!chaves || chaves.length === 0) return 'Nenhum horário selecionado.';
    return chaves.map(chave => this.mapaHorarios[chave] || chave).join('; ');
  }
}