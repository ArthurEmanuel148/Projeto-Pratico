// src/app/funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeclaracaoInteressePageRoutingModule } from './declaracao-interesse-routing.module';
import { DeclaracaoInteressePage } from './declaracao-interesse.page';

// Importação dos componentes
import { EtapaRevisaoDeclaracaoComponent } from '../../components/etapa-revisao-declaracao/etapa-revisao-declaracao.component';
import { EtapaTipoVagaComponent } from '../../components/etapa-tipo-vaga/etapa-tipo-vaga.component';
import { EtapaDadosResponsavelComponent } from '../../components/etapa-dados-responsavel/etapa-dados-responsavel.component';
import { EtapaHorariosVagaComponent } from '../../components/etapa-horarios-vaga/etapa-horarios-vaga.component';
import { EtapaDadosAlunoComponent } from '../../components/etapa-dados-aluno/etapa-dados-aluno.component';
import { EtapaInfoRendaComponent } from '../../components/etapa-info-renda/etapa-info-renda.component';
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
    EtapaRevisaoDeclaracaoComponent,
    EtapaTipoVagaComponent,
    EtapaDadosResponsavelComponent,
    EtapaHorariosVagaComponent,
    EtapaDadosAlunoComponent,
    EtapaInfoRendaComponent,
    ComprovanteDeclaracaoComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class DeclaracaoInteressePageModule { }