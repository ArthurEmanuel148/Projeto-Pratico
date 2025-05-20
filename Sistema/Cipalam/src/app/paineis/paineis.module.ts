import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms'; // Para o toggle
import { IonicModule } from '@ionic/angular';
import { PaineisRoutingModule } from './paineis-routing.module';
import { PainelLayoutComponent } from './components/painel-layout/painel-layout.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, // Adicionado para o ion-toggle funcionar com [(ngModel)] se usar
    IonicModule,
    PaineisRoutingModule
  ],
  declarations: [PainelLayoutComponent],
  exports: [PainelLayoutComponent] // Se precisar exportar
})
export class PaineisModule { }