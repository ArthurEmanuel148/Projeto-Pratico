import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { InteresseMatricula } from '../../models/interesse-matricula.interface'; // Ajuste o caminho
// Importe o tipo EtapaFormulario da página pai
import { EtapaFormulario } from '../../pages/declaracao-interesse/declaracao-interesse.page';

@Component({
  selector: 'app-etapa-revisao-declaracao',
  templateUrl: './etapa-revisao-declaracao.component.html',
  styleUrls: ['./etapa-revisao-declaracao.component.scss'],
  standalone: false
})
export class EtapaRevisaoDeclaracaoComponent implements OnInit {
  @Input() dadosRevisao: InteresseMatricula | null = null;
  @Output() formSubmitted = new EventEmitter<void>(); // Para o botão "Enviar Declaração"
  @Output() editStepRequest = new EventEmitter<EtapaFormulario>();

  // Para usar no template ao emitir o evento de edição
  readonly ETAPAS_EDIT = {
    DADOS_RESPONSAVEL: 'dadosResponsavel' as EtapaFormulario,
    TIPO_VAGA: 'tipoVaga' as EtapaFormulario,
    INFO_RENDA: 'infoRenda' as EtapaFormulario,
    DADOS_ALUNO: 'dadosAluno' as EtapaFormulario,
    HORARIOS_VAGA: 'horariosVaga' as EtapaFormulario,
  };

  // Mapeamento para os labels das cotas
  mapaCotas: { [key: string]: string } = {
    funcionario: 'Cota de Funcionário',
    economica: 'Cota Econômica (Renda)',
    livre: 'Cota Livre (Ampla Concorrência)',
  };
  // Mapeamento para os labels dos horários
  mapaHorarios: { [key: string]: string } = {
    segundaManha: 'Segunda-feira - Manhã',
    segundaTarde: 'Segunda-feira - Tarde',
    tercaManha: 'Terça-feira - Manhã',
    tercaTarde: 'Terça-feira - Tarde',
    // Adicione outros conforme definido no EtapaHorariosVagaComponent
  };


  constructor() { }

  ngOnInit() {
    if (!this.dadosRevisao) {
      console.warn('Dados de revisão não fornecidos para EtapaRevisaoDeclaracaoComponent');
    }
  }

  editar(etapa: EtapaFormulario) {
    this.editStepRequest.emit(etapa);
  }

  enviarDeclaracao() {
    // A validação final deve ocorrer na página pai antes de chegar aqui.
    // Este componente apenas dispara o evento para o pai tomar a ação de envio.
    this.formSubmitted.emit();
  }

  getValorCota(chave: string | null | undefined): string {
    return chave ? this.mapaCotas[chave] || 'Não informado' : 'Não informado';
  }

  getNomesHorarios(chaves: string[] | undefined): string {
    if (!chaves || chaves.length === 0) return 'Nenhum horário selecionado.';
    return chaves.map(chave => this.mapaHorarios[chave] || chave).join('; ');
  }
}