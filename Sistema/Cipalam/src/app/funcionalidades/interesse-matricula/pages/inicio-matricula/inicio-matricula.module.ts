import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InicioMatriculaPageRoutingModule } from './inicio-matricula-routing.module';

import { InicioMatriculaPage } from './inicio-matricula.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    InicioMatriculaPageRoutingModule
  ],
  declarations: [InicioMatriculaPage]
})
export class InicioMatriculaPageModule {}
