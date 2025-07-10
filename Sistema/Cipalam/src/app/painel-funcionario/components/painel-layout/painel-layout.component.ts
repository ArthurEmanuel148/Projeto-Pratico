import { Component, Inject, OnInit, Renderer2, ViewChild } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { MenuController, Platform, IonMenu, IonToggle, PopoverController } from '@ionic/angular';
import { filter } from 'rxjs/operators';
import { TopMenuPopoverComponent } from './top-menu-popover/top-menu-popover.component';

import { FuncionalidadesSistemaService } from 'src/app/core/services/funcionalidades-sistema.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { FuncionalidadesUsosService } from 'src/app/core/services/funcionalidades-usos.service';
import { NavigationService } from 'src/app/core/services/navigation.service';
import { HttpClient } from '@angular/common/http';
import { ApiConfigService } from 'src/app/core/services/api-config.service';

interface UserInfo {
  pessoaId: number;
  nomePessoa: string;
  cpfPessoa: string;
  usuario: string;
  tipo: string;
  dtNascPessoa?: string;
  caminhoImagem?: string;
}

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
  lastAccessedFeature: any = null; // Funcionalidade anterior (penúltima acessada)
  featureHistory: any[] = []; // Histórico das funcionalidades acessadas

  // Propriedades do usuário integradas
  userInfo: UserInfo | null = null;
  userInfoLoading = true;

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
    private funcionalidadesUsosService: FuncionalidadesUsosService,
    private navigationService: NavigationService,
    private http: HttpClient,
    private apiConfig: ApiConfigService
  ) { }  ngOnInit() {
    this.initializeAppTheme();

    // Verificar se o usuário está na rota correta
    this.checkAndRedirectToCorrectPanel();

    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.currentRoute = event.urlAfterRedirects;
      this.closeMenuIfOpen();
      
      // Verificar a cada navegação se o usuário deveria estar onde está
      this.validateCurrentRoute();
      
      // Atualizar a última funcionalidade acessada (se não for o painel principal)
      this.updateLastAccessedFeature(event.urlAfterRedirects);
    });

    // Carregar menu baseado no usuário logado
    this.loadUserMenu();

    // Carregar a última funcionalidade acessada
    this.loadLastAccessedFeature();

    // Carregar informações do usuário
    this.loadUserInfo();

    // Escutar mudanças nas funcionalidades mais usadas para o menu superior
    this.funcionalidadesUsosService.getTopMenuItems().subscribe(topItems => {
      this.updateTopMenuWithMostUsed(topItems);
    });

    // Escutar mudanças no usuário logado para reconstruir o menu
    this.authService.usuarioLogado$.subscribe(usuario => {
      if (usuario) {
        this.loadUserMenu();
        // Inicializar dados de funcionalidades mais usadas para o novo usuário
        this.funcionalidadesUsosService.inicializarParaUsuario();
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

    // Se a resposta do login já trouxe as funcionalidades, usar elas diretamente
    if (usuarioLogado.funcionalidades && usuarioLogado.funcionalidades.length > 0) {
      this.buildMenuFromFuncionalidades(usuarioLogado.funcionalidades, usuarioLogado);
      return;
    }

    // Caso contrário, buscar do endpoint de menu hierárquico
    if (usuarioLogado.pessoaId) {
      this.funcionalidadesService.getMenuHierarquico(usuarioLogado.pessoaId).subscribe(
        menu => {
          this.menu = menu;
          this.initializeTopMenuFromMenu(menu);
        },
        error => {
          console.error('Erro ao carregar menu hierárquico:', error);
          // Fallback para permissões padrão
          this.buildMenuFromPermissoes(usuarioLogado);
        }
      );
    } else {
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
        filhos: submenus.length > 0 ? submenus : null, // Compatibilidade com backend
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
   * Inicializa o menu superior a partir do menu hierárquico
   */
  private initializeTopMenuFromMenu(menu: any[]): void {
    if (menu && Array.isArray(menu)) {
      // Pegar apenas os itens principais (máximo 4) que não sejam o painel
      const principais = menu.filter(item => item.chave !== 'painel').slice(0, 4);

      this.topMenuItems = principais.map(item => ({
        ...item,
        label: item.nomeAmigavel,
        route: item.rota,
        icon: item.icone,
        children: item.filhos || []
      }));
    }
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

      // Limitar a 4 itens únicos para evitar repetição
      const itensUnicos = itensPermitidos.slice(0, 4);

      // Atualizar o menu superior com funcionalidades mais usadas (somente se houver mudança)
      if (this.shouldUpdateTopMenu(itensUnicos)) {
        this.topMenuItems = itensUnicos.map(item => ({
          ...item,
          label: item.nomeAmigavel,
          route: item.rota,
          icon: item.icone,
          children: [] // Top menu não mostra submenus para manter simplicidade
        }));
      }
    }
  }

  /**
   * Verifica se o menu superior precisa ser atualizado
   */
  private shouldUpdateTopMenu(newItems: any[]): boolean {
    if (this.topMenuItems.length !== newItems.length) {
      return true;
    }

    return !this.topMenuItems.every((item, index) => 
      item.chave === newItems[index]?.chave
    );
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

  /**
   * Verifica se o usuário está acessando o painel correto e redireciona se necessário
   */
  private checkAndRedirectToCorrectPanel(): void {
    const usuario = this.authService.getFuncionarioLogado();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUrl = this.router.url;
    const userType = usuario.tipo;

    // Se está apenas em /paineis (sem subrota), redirecionar para o painel correto
    if (currentUrl === '/paineis' || currentUrl === '/paineis/') {
      this.navigationService.redirectToHomePage();
      return;
    }

    // Verificar se o usuário está no painel correto
    this.validateCurrentRoute();
  }

  /**
   * Valida se o usuário atual tem permissão para estar na rota atual
   */
  private validateCurrentRoute(): void {
    const usuario = this.authService.getFuncionarioLogado();
    if (!usuario) {
      this.router.navigate(['/login']);
      return;
    }

    const currentUrl = this.router.url;
    const userType = usuario.tipo;

    // Responsáveis só podem acessar dashboard-responsavel
    if (userType === 'responsavel') {
      if (!currentUrl.includes('dashboard-responsavel')) {
        console.warn('Responsável tentando acessar painel não autorizado:', currentUrl);
        this.router.navigate(['/paineis/dashboard-responsavel']);
        return;
      }
    }

    // Admin, professor e funcionário podem acessar painel-funcionario
    if (userType === 'admin' || userType === 'professor' || userType === 'funcionario') {
      if (currentUrl.includes('dashboard-responsavel')) {
        console.warn('Funcionário/Professor/Admin tentando acessar dashboard de responsável:', currentUrl);
        this.router.navigate(['/paineis/painel-funcionario']);
        return;
      }
    }

    // Verificar permissões específicas para funcionalidades
    this.validateFunctionalityAccess(currentUrl);
  }

  /**
   * Valida se o usuário tem permissão para acessar a funcionalidade específica
   */
  private validateFunctionalityAccess(currentUrl: string): void {
    const permissions = this.authService.getPermissoesFuncionario();

    // Mapear URLs para permissões
    const urlPermissionMap: { [key: string]: string } = {
      'gerenciamento-funcionarios': 'gerenciamentoFuncionarios',
      'interesse-matricula': 'declaracoesInteresse',
      // Adicionar mais mapeamentos conforme necessário
    };

    // Verificar se a URL atual requer uma permissão específica
    for (const [urlPattern, permission] of Object.entries(urlPermissionMap)) {
      if (currentUrl.includes(urlPattern)) {
        if (!permissions[permission]) {
          console.warn('Usuário sem permissão tentando acessar:', urlPattern);
          // Redirecionar para o painel apropriado
          this.navigationService.redirectToHomePage();
          return;
        }
      }
    }
  }

  /**
   * Carrega informações detalhadas do usuário logado
   */
  private loadUserInfo() {
    const usuario = this.authService.getFuncionarioLogado();
    
    if (!usuario || !usuario.pessoaId) {
      this.userInfoLoading = false;
      return;
    }

    // Buscar informações detalhadas do usuário
    const url = `${this.apiConfig.getLoginUrl().replace('/login', '')}/user-info/${usuario.pessoaId}`;
    
    this.http.get<{ success: boolean; [key: string]: any }>(url).subscribe({
      next: (response) => {
        if (response.success) {
          this.userInfo = {
            pessoaId: response['pessoaId'],
            nomePessoa: response['nomePessoa'],
            cpfPessoa: response['cpfPessoa'],
            usuario: response['usuario'],
            tipo: response['tipo'],
            dtNascPessoa: response['dtNascPessoa'],
            caminhoImagem: response['caminhoImagem']
          };
        }
        this.userInfoLoading = false;
      },
      error: (error) => {
        console.error('Erro ao buscar informações do usuário:', error);
        // Usar dados básicos do AuthService como fallback
        this.userInfo = {
          pessoaId: usuario.pessoaId,
          nomePessoa: usuario.nomePessoa || usuario.pessoa?.nmPessoa || 'Usuário',
          cpfPessoa: usuario.pessoa?.cpfPessoa || '',
          usuario: usuario.usuario,
          tipo: usuario.tipo || 'funcionario'
        };
        this.userInfoLoading = false;
      }
    });
  }

  /**
   * Retorna as iniciais do usuário
   */
  getUserInitials(): string {
    if (!this.userInfo) return 'U';
    
    const names = this.userInfo.nomePessoa.split(' ');
    if (names.length >= 2) {
      return names[0].charAt(0).toUpperCase() + names[1].charAt(0).toUpperCase();
    }
    return names[0].charAt(0).toUpperCase();
  }

  /**
   * Retorna o tipo de usuário formatado
   */
  getUserTypeDisplay(): string {
    if (!this.userInfo) return '';
    
    switch (this.userInfo.tipo) {
      case 'admin':
        return 'Administrador';
      case 'professor':
        return 'Professor';
      case 'funcionario':
        return 'Funcionário';
      case 'responsavel':
        return 'Responsável';
      default:
        return 'Usuário';
    }
  }

  // TrackBy functions para otimização de performance
  trackByMenuChave(index: number, item: any): string {
    return item.chave || index.toString();
  }

  async toggleMoreMenu(event: Event) {
    event.stopPropagation();
    
    // Criar uma lista com os itens restantes (após os primeiros 3)
    const remainingItems = this.topMenuItems.slice(3);
    
    if (remainingItems.length === 0) {
      return;
    }

    const popover = await this.popoverController.create({
      component: TopMenuPopoverComponent,
      componentProps: {
        menuItems: remainingItems
      },
      event: event,
      translucent: true,
      cssClass: 'top-menu-popover'
    });

    await popover.present();

    const { data } = await popover.onDidDismiss();
    if (data && data.selectedItem) {
      this.handleTopMenuClick(data.selectedItem, event);
    }
  }

  // Métodos para gerenciar o histórico de funcionalidades
  private loadLastAccessedFeature() {
    try {
      const storedHistory = localStorage.getItem('featureHistory');
      if (storedHistory) {
        this.featureHistory = JSON.parse(storedHistory);
        // A funcionalidade a ser exibida é a penúltima do histórico
        if (this.featureHistory.length >= 2) {
          this.lastAccessedFeature = this.featureHistory[this.featureHistory.length - 2];
        } else if (this.featureHistory.length === 1) {
          this.lastAccessedFeature = this.featureHistory[0];
        }
      }
    } catch (error) {
      console.warn('Erro ao carregar histórico de funcionalidades:', error);
      this.lastAccessedFeature = null;
      this.featureHistory = [];
    }
  }

  private updateLastAccessedFeature(url: string) {
    // Ignorar se for o painel principal
    if (url === '/paineis/painel-funcionario' || url.endsWith('/painel-funcionario')) {
      return;
    }

    // Encontrar a funcionalidade correspondente no menu
    const foundFeature = this.findFeatureByUrl(url, this.menu);
    
    if (foundFeature) {
      // Se já existe no histórico, remove para evitar duplicatas
      const existingIndex = this.featureHistory.findIndex(f => 
        f.route === foundFeature.route
      );
      
      if (existingIndex !== -1) {
        this.featureHistory.splice(existingIndex, 1);
      }
      
      // Adiciona no final do histórico (mais recente)
      this.featureHistory.push(foundFeature);
      
      // Manter apenas as últimas 5 funcionalidades
      if (this.featureHistory.length > 5) {
        this.featureHistory = this.featureHistory.slice(-5);
      }
      
      // Atualizar a funcionalidade a ser exibida (penúltima)
      if (this.featureHistory.length >= 2) {
        this.lastAccessedFeature = this.featureHistory[this.featureHistory.length - 2];
      } else if (this.featureHistory.length === 1) {
        // Se só tem uma, não exibe nada (pois estamos nela)
        this.lastAccessedFeature = null;
      }
      
      // Salvar no localStorage
      try {
        localStorage.setItem('featureHistory', JSON.stringify(this.featureHistory));
      } catch (error) {
        console.warn('Erro ao salvar histórico de funcionalidades:', error);
      }
    }
  }

  private findFeatureByUrl(url: string, menuItems: any[]): any {
    for (const item of menuItems) {
      // Verificar se a URL corresponde à rota do item
      if (item.rota && url.includes(item.rota)) {
        return {
          label: item.nomeAmigavel,
          route: item.rota,
          icon: item.icone || 'apps-outline'
        };
      }
      
      // Verificar submenus recursivamente
      if (item.submenus && item.submenus.length > 0) {
        const found = this.findFeatureByUrl(url, item.submenus);
        if (found) {
          return found;
        }
      }
    }
    
    return null;
  }
}
