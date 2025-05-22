// src/app/paineis/components/top-menu-popover/top-menu-popover.component.ts
import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { PopoverController } from '@ionic/angular';
import { MenuItem } from '../../../core/models/menu-item.interface'; // Ajuste o caminho se necessário

@Component({
  selector: 'app-top-menu-popover',
  templateUrl: './top-menu-popover.component.html',
  styleUrls: ['./top-menu-popover.component.scss'],
  standalone: false
})
export class TopMenuPopoverComponent implements OnInit {
  @Input() subMenuItems: MenuItem[] = []; // Receberá os subitens do menu pai

  constructor(
    private popoverController: PopoverController,
    private router: Router
  ) { }

  ngOnInit() { }

  handleSubMenuItemClick(subItem: MenuItem) {
    if (subItem.route) {
      this.router.navigateByUrl(subItem.route);
    } else if (subItem.action) {
      subItem.action();
    }
    this.popoverController.dismiss(); // Fecha o popover após o clique
  }

  // Função para verificar se uma rota está ativa (para destacar no popover)
  isActive(route?: string): boolean {
    return route ? this.router.url.startsWith(route) : false;
  }
}