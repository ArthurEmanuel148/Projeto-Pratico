import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController, Platform, IonMenu, IonToggle, PopoverController } from '@ionic/angular'; // Adicionado PopoverController
import { MenuItem } from '../../../core/models/menu-item.interface';
import { filter } from 'rxjs/operators';
import { TopMenuPopoverComponent } from '../top-menu-popover/top-menu-popover.component'; // Importe o componente Popover

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

  private allPossibleMenuItems: MenuItem[] = [
    { id: 'home', label: 'Início', icon: 'home-outline', route: '/paineis/painel-funcionario', showInTopMenu: true, topMenuIcon: 'home' },
    {
      id: 'funcionarios', label: 'Funcionários', icon: 'document-text-outline', showInTopMenu: true, topMenuIcon: 'archive', children: [
        { id: 'cadastro-funcionario', label: 'Cadastrar funcionário', icon: 'people-outline', route: '/paineis/gerenciamento-funcionarios/cadastro-funcionario' },
        // { id: 'cad-alunos', label: 'Alunos', icon: 'school-outline', route: '/paineis/gerenciamento-alunos' },
        // { id: 'cad-familiar', label: 'Familiares', icon: 'people-circle-outline', route: '/paineis/gerenciamento-familiar' },
      ]
    },
    {
      id: 'matriculas', label: 'Matrículas', icon: 'document-text-outline', showInTopMenu: true, topMenuIcon: 'archive', children: [
        { id: 'lista-declaracoes', label: 'Declarações de interesse', icon: 'people-outline', route: '/paineis/interesse-matricula/lista-declaracoes' },
        { id: 'configuracao-documentos', label: 'Configuração de documentos', icon: 'document-outline', route: '/paineis/interesse-matricula/configuracao-documentos' },
        
        // { id: 'cad-alunos', label: 'Alunos', icon: 'school-outline', route: '/paineis/gerenciamento-alunos' },
        // { id: 'cad-familiar', label: 'Familiares', icon: 'people-circle-outline', route: '/paineis/gerenciamento-familiar' },
      ]
    },

    { id: 'advertencias', label: 'Advertências', icon: 'warning-outline', route: '/paineis/gerenciamento-advertencias', showInTopMenu: true, topMenuIcon: 'warning' },
    // { id: 'relatorios', label: 'Relatórios', icon: 'stats-chart-outline', route: '/paineis/relatorios', showInTopMenu: false },
    // { id: 'configuracoes', label: 'Configurações', icon: 'settings-outline', route: '/paineis/configuracoes', showInTopMenu: true, topMenuIcon: 'settings' },
  ];

  public sideMenuItems: MenuItem[] = [];
  public topMenuItems: MenuItem[] = [];
  public currentRoute: string = '';

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private platform: Platform,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document,
    public popoverController: PopoverController // Injetar PopoverController
  ) { }

  ngOnInit() {
    this.initializeAppTheme();
    this.prepareMenuItems();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.closeMenuIfOpen();
    });
  }

  prepareMenuItems() {
    // Futuramente, filtre com base nas permissões
    this.sideMenuItems = JSON.parse(JSON.stringify(this.allPossibleMenuItems));
    this.topMenuItems = JSON.parse(JSON.stringify(
      this.allPossibleMenuItems.filter(item => item.showInTopMenu)
    ));
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

  async handleTopMenuClick(item: MenuItem, event: Event) {
    if (item.children && item.children.length > 0) {
      event.stopPropagation(); // Previne que o popover feche imediatamente se o botão estiver dentro de outro elemento clicável
      const popover = await this.popoverController.create({
        component: TopMenuPopoverComponent,
        componentProps: {
          subMenuItems: item.children
        },
        event: event, // O evento que disparou o popover, para posicionamento
        translucent: true,
        showBackdrop: false, // Para um look mais de dropdown
        cssClass: 'top-menu-popover-class' // Classe CSS para estilizar o popover
      });
      await popover.present();
    } else if (item.route) {
      this.navigateTo(item.route);
    } else if (item.action) {
      item.action(event);
    }
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