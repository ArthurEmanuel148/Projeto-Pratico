import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MatriculaFuncionarioPageRoutingModule } from './matricula-funcionario-routing.module';
import { MatriculaFuncionarioPage } from './matricula-funcionario.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    MatriculaFuncionarioPageRoutingModule
  ],
  declarations: [MatriculaFuncionarioPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class MatriculaFuncionarioPageModule { }
