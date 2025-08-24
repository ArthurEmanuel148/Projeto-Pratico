// src/app/funcionalidades/interesse-matricula/pages/declaracao-interesse/declaracao-interesse.module.ts
import { NgModule, CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { DeclaracaoInteressePageRoutingModule } from './declaracao-interesse-routing.module';
import { DeclaracaoInteressePage } from './declaracao-interesse.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule, // Essencial
    IonicModule,
    DeclaracaoInteressePageRoutingModule
  ],
  declarations: [
    DeclaracaoInteressePage
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA, NO_ERRORS_SCHEMA]
})
export class DeclaracaoInteressePageModule { }