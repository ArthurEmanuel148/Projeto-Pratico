import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http'; // Necessário para o serviço usar HttpClient no futuro
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; // Formulários para as etapas
import { IonicModule } from '@ionic/angular'; // Componentes Ionic

import { InteresseMatriculaRoutingModule } from './interesse-matricula-routing.module';
import { InteresseMatriculaService } from './services/interesse-matricula.service';

// Não precisa declarar ou importar os componentes de etapa ou a página principal aqui,
// eles serão parte do DeclaracaoInteressePageModule que será lazy loaded.

@NgModule({
  declarations: [
    // A página principal (DeclaracaoInteressePage) e seus componentes de etapa
    // serão declarados em seus próprios módulos de página ou no módulo da página principal.
  ],
  imports: [
    CommonModule,
    FormsModule, // Mantenha se algum componente de etapa usar ngModel
    ReactiveFormsModule, // Essencial para os FormGroups das etapas
    IonicModule, // Para os componentes Ionic usados nas etapas
    HttpClientModule, // Para o InteresseMatriculaService usar no futuro
    InteresseMatriculaRoutingModule
  ],
  providers: [
    InteresseMatriculaService // Torna o serviço disponível para esta funcionalidade
  ]
})
export class InteresseMatriculaModule { }