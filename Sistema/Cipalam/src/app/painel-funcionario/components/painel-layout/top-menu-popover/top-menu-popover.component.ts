// src/app/paineis/components/top-menu-popover/top-menu-popover.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { FuncionalidadeSistema } from 'src/app/core/models/funcionalidade-sistema.interface';


@Component({
  selector: 'app-top-menu-popover',
  templateUrl: './top-menu-popover.component.html',
  styleUrls: ['./top-menu-popover.component.scss'],
  standalone: false
})
export class TopMenuPopoverComponent implements OnInit {
  @Input() subMenuItems: FuncionalidadeSistema[] = []; // Agora usa a interface centralizada

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() { }

  handleSubMenuItemClick(subItem: FuncionalidadeSistema) {
    if (subItem.rota) {
      this.router.navigateByUrl(subItem.rota);
    }
    this.popoverController.dismiss();
  }

  // Função para verificar se uma rota está ativa (para destacar no popover)
  isActive(route?: string): boolean {
    return route ? this.router.url.startsWith(route) : false;
  }
}