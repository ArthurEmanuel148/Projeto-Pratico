// src/app/funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.module.ts
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeclaracaoInteressePageRoutingModule } from './declaracao-interesse-routing.module';
import { DeclaracaoInteressePage } from './declaracao-interesse.page';

// Importe TODOS os seus componentes de etapa
import { EtapaDadosResponsavelComponent } from '../../components/etapa-dados-responsavel/etapa-dados-responsavel.component';
import { EtapaTipoVagaComponent } from '../../components/etapa-tipo-vaga/etapa-tipo-vaga.component';
import { EtapaInfoRendaComponent } from '../../components/etapa-info-renda/etapa-info-renda.component';
import { EtapaDadosAlunoComponent } from '../../components/etapa-dados-aluno/etapa-dados-aluno.component';
import { EtapaHorariosVagaComponent } from '../../components/etapa-horarios-vaga/etapa-horarios-vaga.component';
import { EtapaRevisaoDeclaracaoComponent } from '../../components/etapa-revisao-declaracao/etapa-revisao-declaracao.component';
import { ComprovanteDeclaracaoComponent } from '../../components/comprovante-declaracao/comprovante-declaracao.component';


@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Essencial
    IonicModule,
    DeclaracaoInteressePageRoutingModule
  ],
  declarations: [
    DeclaracaoInteressePage,
    EtapaDadosResponsavelComponent, // Declare todos aqui
    EtapaTipoVagaComponent,
    EtapaInfoRendaComponent,
    EtapaDadosAlunoComponent,
    EtapaHorariosVagaComponent,
    EtapaRevisaoDeclaracaoComponent,
    ComprovanteDeclaracaoComponent
  ]
})
export class DeclaracaoInteressePageModule { }