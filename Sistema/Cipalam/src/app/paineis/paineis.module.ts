import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { PaineisRoutingModule } from './paineis-routing.module';
import { PainelLayoutComponent } from './components/painel-layout/painel-layout.component';
import { TopMenuPopoverComponent } from './components/top-menu-popover/top-menu-popover.component'; // Importe

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    PaineisRoutingModule
  ],
  declarations: [
    PainelLayoutComponent,
    TopMenuPopoverComponent // Declare aqui se não for standalone
  ],
  // Se TopMenuPopoverComponent for usado apenas pelo PopoverController e não
  // em templates diretamente, não precisa estar em entryComponents ou exports.
  // O PopoverController consegue encontrá-lo se estiver declarado.
})
export class PaineisModule { }