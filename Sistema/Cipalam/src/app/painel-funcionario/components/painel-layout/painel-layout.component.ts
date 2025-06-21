import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController, Platform, IonMenu, IonToggle, PopoverController } from '@ionic/angular'; // Adicionado PopoverController
import { filter } from 'rxjs/operators';
import { TopMenuPopoverComponent } from './top-menu-popover/top-menu-popover.component'; // Importe o componente Popover

import { FuncionalidadesSistemaService } from 'src/app/core/services/funcionalidades-sistema.service';

@Component({
  selector: 'app-painel-layout',
  templateUrl: './painel-layout.component.html',
  styleUrls: ['./painel-layout.component.scss'],
  standalone: false
})
export class PainelLayoutComponent implements OnInit {
  @ViewChild('appMenu') appMenu!: IonMenu;
  @ViewChild('themeToggle') themeToggle!: IonToggle;

  public openSideSubmenus: { [key: string]: boolean } = {};
  public isDarkMode: boolean = false;
  readonly THEME_KEY = 'themePreference';

  menu: any[] = [];
  topMenuItems: any[] = [];


  public currentRoute: string = '';

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private platform: Platform,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    public popoverController: PopoverController, // Injetar PopoverController
    private funcionalidadesService: FuncionalidadesSistemaService
  ) { }

  ngOnInit() {
    this.initializeAppTheme();


    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.closeMenuIfOpen();
    });

    this.funcionalidadesService.getTodasFuncionalidades().subscribe(funcs => {
      // Menu lateral
      const principais = funcs.filter(f => !f.pai);
      this.menu = principais.map(principal => {
        const submenus = funcs.filter(f => f.pai === principal.chave);
        return {
          ...principal,
          submenus: submenus.length > 0 ? submenus : null
        };
      });

      // Top menu (exemplo: só menus principais que não são painel)
      this.topMenuItems = principais
        .filter(f => f.chave !== 'painel')
        .map(f => ({
          ...f,
          label: f.nomeAmigavel,
          route: f.rota,
          icon: f.icone,
          children: funcs.filter(sub => sub.pai === f.chave)
        }));
    });
  }

  handleTopMenuClick(item: any, event: Event) {
    event.stopPropagation();
    if (item.children && item.children.length > 0) {
      // Aqui você pode abrir um popover ou dropdown com os submenus
      // Exemplo: abrir popover (adapte conforme seu projeto)
      // this.openPopover(item.children, event);
    } else if (item.route) {
      this.router.navigateByUrl(item.route);
    }
  }

  isActive(route?: string): boolean {
    return route ? this.router.url.startsWith(route) : false; // Usar this.router.url para refletir a rota atual antes de redirecionamentos
  }

  closeMenuIfOpen() {
    this.menuCtrl.isOpen('appMenu').then(isOpen => {
      if (isOpen) {
        this.menuCtrl.close('appMenu');
      }
    });
  }

  initializeAppTheme() {
    this.platform.ready().then(() => {
      const savedTheme = localStorage.getItem(this.THEME_KEY);
      this.isDarkMode = savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme();
      if (this.themeToggle) {
        this.themeToggle.checked = this.isDarkMode;
      }
    });
  }

  toggleTheme(event?: any) {
    if (event && typeof event.detail !== 'undefined') {
      this.isDarkMode = event.detail.checked;
    }
    this.applyTheme();
    localStorage.setItem(this.THEME_KEY, this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    this.renderer.removeClass(this.document.body, this.isDarkMode ? 'light-theme' : 'dark-theme');
    this.renderer.addClass(this.document.body, this.isDarkMode ? 'dark-theme' : 'light-theme');
    this.document.body.setAttribute('color-theme', this.isDarkMode ? 'dark' : 'light');
  }



  navigateTo(url: string) {
    this.router.navigateByUrl(url);
  }

  toggleSideSubmenu(menuId: string) { // Usar menuId
    this.openSideSubmenus[menuId] = !this.openSideSubmenus[menuId];
  }

  logout = () => { // Definido como arrow function para manter o 'this' se passado como callback
    console.log('Logout acionado');
    // Limpar dados de sessão/token aqui
    this.navigateTo('/login');
  }
}