// src/app/painel-funcionario/components/painel-layout/top-menu-popover/top-menu-popover.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { FuncionalidadeSistema } from 'src/app/core/models/funcionalidade-sistema.interface';
import { RotasConfigService } from 'src/app/core/services/rotas-config.service';


@Component({
  selector: 'app-top-menu-popover',
  templateUrl: './top-menu-popover.component.html',
  styleUrls: ['./top-menu-popover.component.scss'],
  standalone: false
})
export class TopMenuPopoverComponent implements OnInit {
  @Input() subMenuItems: FuncionalidadeSistema[] = []; // Agora usa a interface centralizada

  constructor(
    private router: Router,
    private popoverController: PopoverController,
    private rotasConfig: RotasConfigService
  ) { }

  ngOnInit() { }

  handleSubMenuItemClick(subItem: FuncionalidadeSistema) {
    const rota = this.rotasConfig.getRota(subItem.chave);
    if (rota) {
      this.router.navigateByUrl(rota);
    }
    this.popoverController.dismiss();
  }

  isActive(chave: string): boolean {
    const rota = this.rotasConfig.getRota(chave);
    return rota ? this.router.url.includes(rota) : false;
  }

}