import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { HttpClientModule } from '@angular/common/http';

import { IniciarMatriculaRoutingModule } from './iniciar-matricula-routing.module';
import { MatriculaService } from './services/matricula.service';

@NgModule({
  declarations: [
    // Componentes serão declarados em seus próprios módulos
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    HttpClientModule,
    IniciarMatriculaRoutingModule
  ],
  providers: [
    MatriculaService
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class IniciarMatriculaModule { }
