// src/app/app.component.ts
import { Component, Inject, OnDestroy, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common'; // Importe DOCUMENT
import { Router } from '@angular/router';
import { MenuController, Platform } from '@ionic/angular';
import { IonMenu } from '@ionic/angular';

// Suponha que você terá um serviço para gerenciar o tema no futuro
// import { ThemeService } from './services/theme.service'; // Exemplo

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false
})
export class AppComponent implements OnInit { // Implemente OnInit
  @ViewChild('appMenu') appMenu!: IonMenu;
  public openSubmenus: { [key: string]: boolean } = {};

  constructor(
    private router: Router,
    private menuCtrl: MenuController,
    private platform: Platform,
    private renderer: Renderer2, // Injete Renderer2
    @Inject(DOCUMENT) private document: Document // Injete DOCUMENT
    // private themeService: ThemeService // Injete seu serviço de tema no futuro
  ) {
    // A inicialização do tema será movida para ngOnInit ou um serviço
  }

  ngOnInit() {
    this.initializeAppTheme();
  }

  initializeAppTheme() {
    this.platform.ready().then(() => {
      // FORÇAR TEMA CLARO NA INICIALIZAÇÃO
      // No futuro, você leria a preferência salva do usuário aqui
      // e aplicaria o tema correspondente. Por agora, forçamos o claro.

      this.renderer.removeClass(this.document.body, 'dark-theme'); // Remove tema escuro se existir
      this.renderer.addClass(this.document.body, 'light-theme'); // Adiciona tema claro

      // Para compatibilidade com o sistema de tema do Ionic v6+ (color-theme attribute)
      // Isso é mais para quando o Ionic gerencia o tema automaticamente,
      // mas não custa garantir.
      this.document.body.setAttribute('color-theme', 'light');

      // Se você estiver usando a classe 'dark' padrão do Ionic para tema escuro:
      // this.renderer.removeClass(this.document.body, 'dark');
    });
  }

  // ... resto do seu app.component.ts (navigateTo, toggleSubmenu, logout)
  navigateTo(url: string) {
    this.router.navigateByUrl(url);
    this.menuCtrl.close('appMenu');
  }

  toggleSubmenu(menuKey: string) {
    this.openSubmenus[menuKey] = !this.openSubmenus[menuKey];
  }

  logout() {
    console.log('Logout acionado');
    this.menuCtrl.close('appMenu');
    this.router.navigate(['/login']);
  }
}