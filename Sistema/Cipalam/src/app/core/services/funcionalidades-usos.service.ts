import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AuthService } from './auth.service';

interface FuncionalidadeUso {
  chave: string;
  nomeAmigavel: string;
  icone: string;
  rota: string;
  contador: number;
  ultimoAcesso: Date;
  usuarioId: number; // Novo campo para associar ao usuário
}

@Injectable({
  providedIn: 'root'
})
export class FuncionalidadesUsosService {
  private readonly STORAGE_KEY = 'funcionalidades_uso';
  private readonly MAX_TOP_MENU = 4; // Máximo de 4 itens no menu superior
  private readonly MAX_DASHBOARD = 6; // Máximo de 6 itens no dashboard

  private funcionalidadesUso: Map<string, FuncionalidadeUso> = new Map();
  private topMenuItems$ = new BehaviorSubject<FuncionalidadeUso[]>([]);
  private dashboardItems$ = new BehaviorSubject<FuncionalidadeUso[]>([]);

  constructor(private authService: AuthService) {
    this.carregarDados();
  }

  /**
   * Registra o acesso a uma funcionalidade
   */
  registrarAcesso(funcionalidade: any): void {
    const usuarioLogado = this.authService.getFuncionarioLogado();
    if (!usuarioLogado?.pessoa?.idPessoa) {
      console.warn('Usuário não logado, não é possível registrar uso da funcionalidade');
      return;
    }

    const chaveUnica = `${usuarioLogado.pessoa.idPessoa}_${funcionalidade.chave}`;

    if (this.funcionalidadesUso.has(chaveUnica)) {
      // Atualizar existente
      const item = this.funcionalidadesUso.get(chaveUnica)!;
      item.contador++;
      item.ultimoAcesso = new Date();
    } else {
      // Criar novo
      const novoItem: FuncionalidadeUso = {
        chave: funcionalidade.chave,
        nomeAmigavel: funcionalidade.nomeAmigavel,
        icone: funcionalidade.icone,
        rota: funcionalidade.rota,
        contador: 1,
        ultimoAcesso: new Date(),
        usuarioId: usuarioLogado.pessoa.idPessoa
      };
      this.funcionalidadesUso.set(chaveUnica, novoItem);
    }

    this.salvarDados();
    this.atualizarListasOrdenadas();
  }

  /**
   * Obtém as funcionalidades mais usadas para o menu superior
   */
  getTopMenuItems() {
    return this.topMenuItems$.asObservable();
  }

  /**
   * Obtém as funcionalidades mais usadas para o dashboard
   */
  getDashboardItems() {
    return this.dashboardItems$.asObservable();
  }

  /**
   * Atualiza as listas ordenadas por uso
   */
  private atualizarListasOrdenadas(): void {
    const usuarioLogado = this.authService.getFuncionarioLogado();
    if (!usuarioLogado?.pessoa?.idPessoa) {
      this.topMenuItems$.next([]);
      this.dashboardItems$.next([]);
      return;
    }

    const usuarioId = usuarioLogado.pessoa.idPessoa;

    // Filtrar apenas funcionalidades do usuário atual
    const funcionalidadesUsuario = Array.from(this.funcionalidadesUso.values())
      .filter(f => f.usuarioId === usuarioId);

    // Ordenar por: contador (desc) > último acesso (desc)
    const funcionaldadesOrdenadas = funcionalidadesUsuario.sort((a, b) => {
      if (b.contador !== a.contador) {
        return b.contador - a.contador; // Por contador (mais usado primeiro)
      }
      return new Date(b.ultimoAcesso).getTime() - new Date(a.ultimoAcesso).getTime(); // Por data
    });

    // Filtrar funcionalidades que não sejam 'painel' para o top menu
    const topMenuCandidatos = funcionaldadesOrdenadas.filter(f => f.chave !== 'painel');

    // Atualizar observables
    this.topMenuItems$.next(topMenuCandidatos.slice(0, this.MAX_TOP_MENU));
    this.dashboardItems$.next(funcionaldadesOrdenadas.slice(0, this.MAX_DASHBOARD));
  }

  /**
   * Carrega dados do localStorage
   */
  private carregarDados(): void {
    try {
      const dados = localStorage.getItem(this.STORAGE_KEY);
      if (dados) {
        const dadosArray = JSON.parse(dados) as FuncionalidadeUso[];
        this.funcionalidadesUso.clear();

        dadosArray.forEach(item => {
          // Converter string de data de volta para Date
          item.ultimoAcesso = new Date(item.ultimoAcesso);
          this.funcionalidadesUso.set(item.chave, item);
        });

        this.atualizarListasOrdenadas();
      }
    } catch (error) {
      console.error('Erro ao carregar dados de uso das funcionalidades:', error);
      this.funcionalidadesUso.clear();
    }
  }

  /**
   * Salva dados no localStorage
   */
  private salvarDados(): void {
    try {
      const dadosArray = Array.from(this.funcionalidadesUso.values());
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dadosArray));
    } catch (error) {
      console.error('Erro ao salvar dados de uso das funcionalidades:', error);
    }
  }

  /**
   * Limpa todos os dados de uso (útil para logout)
   */
  limparDados(): void {
    this.funcionalidadesUso.clear();
    localStorage.removeItem(this.STORAGE_KEY);
    this.topMenuItems$.next([]);
    this.dashboardItems$.next([]);
  }

  /**
   * Inicializa os dados para o usuário logado (chamado após login)
   */
  inicializarParaUsuario(): void {
    this.carregarDados();
    this.atualizarListasOrdenadas();
  }

  /**
   * Limpa dados do usuário ao fazer logout e carrega dados do novo usuário ao fazer login
   */
  trocarUsuario(): void {
    this.atualizarListasOrdenadas();
  }

  /**
   * Obtém estatísticas de uso do usuário atual
   */
  getEstatisticas() {
    const usuarioLogado = this.authService.getFuncionarioLogado();
    if (!usuarioLogado?.pessoa?.idPessoa) {
      return {
        totalFuncionalidades: 0,
        totalAcessos: 0,
        funcionalidadeMaisUsada: null,
        ultimoAcesso: null
      };
    }

    const usuarioId = usuarioLogado.pessoa.idPessoa;

    // Filtrar apenas funcionalidades do usuário atual
    const funcionalidadesUsuario = Array.from(this.funcionalidadesUso.values())
      .filter(f => f.usuarioId === usuarioId);

    const totalAcessos = funcionalidadesUsuario.reduce((sum, f) => sum + f.contador, 0);

    // Ordenar para encontrar a mais usada
    const funcionaldadesOrdenadas = funcionalidadesUsuario.sort((a, b) => b.contador - a.contador);

    return {
      totalFuncionalidades: funcionalidadesUsuario.length,
      totalAcessos,
      funcionalidadeMaisUsada: funcionaldadesOrdenadas.length > 0 ? funcionaldadesOrdenadas[0] : null,
      ultimoAcesso: funcionalidadesUsuario.length > 0
        ? new Date(Math.max(...funcionalidadesUsuario.map(f => f.ultimoAcesso.getTime())))
        : null
    };
  }
}
