import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController, Platform, IonMenu, IonToggle, PopoverController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { TopMenuPopoverComponent } from './top-menu-popover/top-menu-popover.component';

import { FuncionalidadesSistemaService } from 'src/app/core/services/funcionalidades-sistema.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FuncionalidadesUsosService } from 'src/app/core/services/funcionalidades-usos.service';

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
    public popoverController: PopoverController,
    private funcionalidadesService: FuncionalidadesSistemaService,
    private authService: AuthService,
    private funcionalidadesUsosService: FuncionalidadesUsosService
  ) { }  ngOnInit() {
    this.initializeAppTheme();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.closeMenuIfOpen();
    });

    // Carregar menu baseado no usuário logado
    this.loadUserMenu();

    // Escutar mudanças nas funcionalidades mais usadas para o menu superior
    this.funcionalidadesUsosService.getTopMenuItems().subscribe(topItems => {
      this.updateTopMenuWithMostUsed(topItems);
    });

    // Escutar mudanças no usuário logado para reconstruir o menu
    this.authService.usuarioLogado$.subscribe(usuario => {
      if (usuario) {
        this.loadUserMenu();
      } else {
        this.menu = [];
        this.topMenuItems = [];
      }
    });
  }

  private loadUserMenu() {
    const usuarioLogado = this.authService.getFuncionarioLogado();

    if (!usuarioLogado) {
      this.menu = [];
      this.topMenuItems = [];
      return;
    }

    // OTIMIZAÇÃO: Verificar se já temos funcionalidades no localStorage
    const funcionalidadesCached = localStorage.getItem('funcionalidades_sistema');
    const cacheValido = this.isCacheValid();

    if (funcionalidadesCached && cacheValido) {
      // Usar cache para otimização
      const funcionalidades = JSON.parse(funcionalidadesCached);
      this.buildMenuFromFuncionalidades(funcionalidades, usuarioLogado);
    } else {
      // Buscar do servidor e salvar no cache
      this.funcionalidadesService.getTodasFuncionalidades().subscribe(
        funcs => {
          // Salvar no localStorage para otimização com timestamp
          const cacheData = {
            funcionalidades: funcs,
            timestamp: Date.now(),
            version: '1.0'
          };
          localStorage.setItem('funcionalidades_sistema', JSON.stringify(cacheData.funcionalidades));
          localStorage.setItem('funcionalidades_cache_info', JSON.stringify({
            timestamp: cacheData.timestamp,
            version: cacheData.version
          }));

          this.buildMenuFromFuncionalidades(funcs, usuarioLogado);
        },
        error => {
          console.error('Erro ao carregar funcionalidades do servidor:', error);
          // Em caso de erro, usar funcionalidades padrão
          this.buildMenuFromPermissoes(usuarioLogado);
        }
      );
    }
  }

  private isCacheValid(): boolean {
    const cacheInfo = localStorage.getItem('funcionalidades_cache_info');
    if (!cacheInfo) return false;

    try {
      const info = JSON.parse(cacheInfo);
      const agora = Date.now();
      const tempoCache = 30 * 60 * 1000; // 30 minutos em ms

      return (agora - info.timestamp) < tempoCache;
    } catch (e) {
      return false;
    }
  }

  private buildMenuFromFuncionalidades(funcionalidades: any[], usuarioLogado: any) {
    // Obter permissões do usuário (prioridade: backend > authService)
    let permissoes = usuarioLogado.permissoes || this.authService.getPermissoesFuncionario();

    // Se permissões estiverem vazias, buscar do authService
    if (!permissoes || Object.keys(permissoes).length === 0) {
      permissoes = this.authService.getPermissoesFuncionario();
    }

    if (!Array.isArray(funcionalidades) || funcionalidades.length === 0) {
      this.buildMenuFromPermissoes(usuarioLogado);
      return;
    }

    // Filtrar funcionalidades com base nas permissões
    const funcionaldadesPermitidas = funcionalidades.filter(f => {
      return permissoes[f.chave] === true;
    });

    if (funcionaldadesPermitidas.length === 0) {
      this.menu = [];
      this.topMenuItems = [];
      return;
    }

    // Construir menu lateral (principais + submenus)
    const principais = funcionaldadesPermitidas.filter(f => !f.pai);
    this.menu = principais.map(principal => {
      const submenus = funcionaldadesPermitidas.filter(f => f.pai === principal.chave);
      return {
        ...principal,
        submenus: submenus.length > 0 ? submenus : null,
        open: false
      };
    });

    // Construir top menu (usar funcionalidades mais usadas, máximo 4 itens)
    // Este será atualizado dinamicamente pelo serviço de uso
    this.initializeTopMenu(funcionaldadesPermitidas);
  }

  /**
   * Inicializa o menu superior com funcionalidades padrão
   */
  private initializeTopMenu(funcionaldadesPermitidas: any[]): void {
    const principais = funcionaldadesPermitidas.filter(f => !f.pai && f.chave !== 'painel');

    // Menu superior inicial (primeiros 4 itens)
    this.topMenuItems = principais.slice(0, 4).map(f => ({
      ...f,
      label: f.nomeAmigavel,
      route: f.rota,
      icon: f.icone,
      children: funcionaldadesPermitidas.filter(sub => sub.pai === f.chave)
    }));
  }

  /**
   * Atualiza o menu superior com as funcionalidades mais usadas
   */
  private updateTopMenuWithMostUsed(topItems: any[]): void {
    if (topItems && topItems.length > 0) {
      const usuarioLogado = this.authService.getFuncionarioLogado();
      if (!usuarioLogado) return;

      const permissoes = usuarioLogado.permissoes || this.authService.getPermissoesFuncionario();

      // Filtrar apenas itens que o usuário tem permissão
      const itensPermitidos = topItems.filter(item => permissoes[item.chave] === true);

      // Atualizar o menu superior com funcionalidades mais usadas
      this.topMenuItems = itensPermitidos.map(item => ({
        ...item,
        label: item.nomeAmigavel,
        route: item.rota,
        icon: item.icone,
        children: [] // Top menu não mostra submenus para manter simplicidade
      }));
    }
  }

  private buildMenuFromPermissoes(usuarioLogado: any) {
    const permissoes = usuarioLogado.permissoes || this.authService.getPermissoesFuncionario();

    // Menu básico baseado apenas nas permissões conhecidas
    const menuItems = [];

    if (permissoes['painel']) {
      menuItems.push({
        chave: 'painel',
        nomeAmigavel: 'Painel',
        rota: '/paineis/painel',
        icone: 'home-outline',
        submenus: null,
        open: false
      });
    }

    if (permissoes['funcionarios']) {
      const funcionariosSubmenus = [];
      if (permissoes['cadastroFuncionario']) {
        funcionariosSubmenus.push({
          chave: 'cadastroFuncionario',
          nomeAmigavel: 'Cadastro de Funcionário',
          rota: '/paineis/gerenciamento-funcionarios/cadastro-funcionario',
          icone: 'person-add-outline'
        });
      }
      if (permissoes['gerenciamentoFuncionarios']) {
        funcionariosSubmenus.push({
          chave: 'gerenciamentoFuncionarios',
          nomeAmigavel: 'Lista de Funcionários',
          rota: '/paineis/gerenciamento-funcionarios',
          icone: 'list-outline'
        });
      }

      menuItems.push({
        chave: 'funcionarios',
        nomeAmigavel: 'Funcionários',
        rota: '',
        icone: 'people-outline',
        submenus: funcionariosSubmenus.length > 0 ? funcionariosSubmenus : null,
        open: false
      });
    }

    if (permissoes['matriculas']) {
      const matriculasSubmenus = [];
      if (permissoes['declaracoesInteresse']) {
        matriculasSubmenus.push({
          chave: 'declaracoesInteresse',
          nomeAmigavel: 'Declarações de Interesse',
          rota: '/paineis/interesse-matricula/lista-declaracoes',
          icone: 'document-text-outline'
        });
      }
      if (permissoes['configurarDocumentosCota']) {
        matriculasSubmenus.push({
          chave: 'configurarDocumentosCota',
          nomeAmigavel: 'Configurar Documentos por Cota',
          rota: '/paineis/interesse-matricula/configuracao-documentos',
          icone: 'settings-outline'
        });
      }

      menuItems.push({
        chave: 'matriculas',
        nomeAmigavel: 'Matrículas',
        rota: '',
        icone: 'school-outline',
        submenus: matriculasSubmenus.length > 0 ? matriculasSubmenus : null,
        open: false
      });
    }

    // Adicionar outros menus conforme necessário
    if (permissoes['administracao']) {
      const adminSubmenus = [];
      if (permissoes['usuarios']) {
        adminSubmenus.push({
          chave: 'usuarios',
          nomeAmigavel: 'Gerenciar Usuários',
          rota: '/paineis/administracao/usuarios',
          icone: 'people-outline'
        });
      }
      if (permissoes['relatorios']) {
        adminSubmenus.push({
          chave: 'relatorios',
          nomeAmigavel: 'Relatórios',
          rota: '/paineis/administracao/relatorios',
          icone: 'bar-chart-outline'
        });
      }
      if (permissoes['configuracoes']) {
        adminSubmenus.push({
          chave: 'configuracoes',
          nomeAmigavel: 'Configurações',
          rota: '/paineis/administracao/configuracoes',
          icone: 'settings-outline'
        });
      }
      if (permissoes['backup']) {
        adminSubmenus.push({
          chave: 'backup',
          nomeAmigavel: 'Backup',
          rota: '/paineis/administracao/backup',
          icone: 'cloud-upload-outline'
        });
      }

      menuItems.push({
        chave: 'administracao',
        nomeAmigavel: 'Administração',
        rota: '',
        icone: 'shield-outline',
        submenus: adminSubmenus.length > 0 ? adminSubmenus : null,
        open: false
      });
    }

    this.menu = menuItems;
  }

  handleTopMenuClick(item: any, event: Event) {
    event.stopPropagation();

    // Registrar o uso da funcionalidade
    this.funcionalidadesUsosService.registrarAcesso(item);

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

  logout = () => {
    // Limpar cache de funcionalidades no logout
    this.clearFuncionalidadesCache();
    // Limpar dados de uso das funcionalidades
    this.funcionalidadesUsosService.limparDados();
    this.authService.logout();
    this.router.navigateByUrl('/login');
  }

  /**
   * Registra o acesso a uma funcionalidade (para uso no template)
   */
  onFuncionalidadeClick(funcionalidade: any): void {
    this.funcionalidadesUsosService.registrarAcesso(funcionalidade);
  }

  // OTIMIZAÇÃO: Métodos para gerenciar cache
  private clearFuncionalidadesCache() {
    localStorage.removeItem('funcionalidades_sistema');
    localStorage.removeItem('funcionalidades_cache_info');
  }

  // Método público para forçar atualização do menu (útil para quando permissões mudam)
  public refreshMenu() {
    this.clearFuncionalidadesCache();
    this.loadUserMenu();
  }

  // TrackBy functions para otimização de performance
  trackByMenuChave(index: number, item: any): string {
    return item.chave || index.toString();
  }
}
