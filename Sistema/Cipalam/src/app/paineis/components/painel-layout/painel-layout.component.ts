// src/app/paineis/components/painel-layout/painel-layout.component.ts
import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core'; // Removido OnDestroy se não usado
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { MenuController, Platform, IonMenu } from '@ionic/angular'; // IonMenu importado aqui

@Component({
  selector: 'app-painel-layout', // Seletor correto
  templateUrl: './painel-layout.component.html',
  styleUrls: ['./painel-layout.component.scss'],
  standalone: false, // Defina como 'true' se este for um componente standalone
  // Adicione 'standalone: true' e o array 'imports' se este for um componente standalone
  // Exemplo se standalone:
  // standalone: true,
  // imports: [CommonModule, FormsModule, IonicModule, RouterModule /* ou RouterLink */ ],
})
export class PainelLayoutComponent implements OnInit {
  @ViewChild('appMenu') appMenu!: IonMenu; // Referência ao menu no template deste componente
  public openSubmenus: { [key: string]: boolean } = {};
  public isDarkMode: boolean = false;

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private platform: Platform,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) { }

  ngOnInit() {
    this.initializeAppTheme();
  }

  initializeAppTheme() {
    this.platform.ready().then(() => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const savedTheme = localStorage.getItem('themePreference');

      if (savedTheme) {
        this.isDarkMode = savedTheme === 'dark';
      } else {
        this.isDarkMode = prefersDark;
      }
      this.applyTheme();
    });
  }

  toggleTheme(event?: any) {
    if (event && typeof event.detail !== 'undefined') { // Verifica se event.detail existe
      this.isDarkMode = event.detail.checked;
    }
    this.applyTheme();
    localStorage.setItem('themePreference', this.isDarkMode ? 'dark' : 'light');
  }

  private applyTheme() {
    this.renderer.removeClass(this.document.body, this.isDarkMode ? 'light-theme' : 'dark-theme');
    this.renderer.addClass(this.document.body, this.isDarkMode ? 'dark-theme' : 'light-theme');
    this.document.body.setAttribute('color-theme', this.isDarkMode ? 'dark' : 'light');
  }

  navigateTo(url: string) {
    // Ajuste a URL se as rotas dentro do painel não começarem com '/paineis/' no routerLink
    // Exemplo: se o routerLink for '/cadastros/funcionarios', e a rota no paineis-routing for 'cadastros/funcionarios'
    // A URL completa seria '/paineis/cadastros/funcionarios'
    // Se você sempre passa a URL completa (com /paineis/ prefixo) do template, está ok.
    this.router.navigateByUrl(url);
    if (this.appMenu) {
      this.menuCtrl.close('appMenu');
    }
  }

  toggleSubmenu(menuKey: string) {
    this.openSubmenus[menuKey] = !this.openSubmenus[menuKey];
  }

  logout() {
    console.log('Logout acionado');
    if (this.appMenu) {
      this.menuCtrl.close('appMenu');
    }
    // Adicionar lógica de limpar sessão/token aqui no futuro
    this.router.navigate(['/login']); // Assume uma rota de login
  }
}