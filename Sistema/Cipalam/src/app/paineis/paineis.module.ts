import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { PaineisRoutingModule } from './paineis-routing.module';
import { PainelLayoutComponent } from '../painel-funcionario/components/painel-layout/painel-layout.component';
import { TopMenuPopoverComponent } from '../painel-funcionario/components/painel-layout/top-menu-popover/top-menu-popover.component';
import { UserInfoHeaderComponent } from '../painel-funcionario/components/user-info-header/user-info-header.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    PainelLayoutComponent,
    TopMenuPopoverComponent,
    UserInfoHeaderComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    PaineisRoutingModule
  ],
  exports: [
    UserInfoHeaderComponent
  ]
})
export class PaineisModule { }
