import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

interface FuncionalidadeUso {
  chave: string;
  nomeAmigavel: string;
  icone: string;
  rota: string;
  contador: number;
  ultimoAcesso: Date;
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

  constructor() {
    this.carregarDados();
  }

  /**
   * Registra o acesso a uma funcionalidade
   */
  registrarAcesso(funcionalidade: any): void {
    const chave = funcionalidade.chave;

    if (this.funcionalidadesUso.has(chave)) {
      // Atualizar existente
      const item = this.funcionalidadesUso.get(chave)!;
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
        ultimoAcesso: new Date()
      };
      this.funcionalidadesUso.set(chave, novoItem);
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
    const todasFuncionalidades = Array.from(this.funcionalidadesUso.values());

    // Ordenar por: contador (desc) > último acesso (desc)
    const funcionaldadesOrdenadas = todasFuncionalidades.sort((a, b) => {
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
   * Obtém estatísticas de uso
   */
  getEstatisticas() {
    const funcionalidades = Array.from(this.funcionalidadesUso.values());
    const totalAcessos = funcionalidades.reduce((sum, f) => sum + f.contador, 0);

    return {
      totalFuncionalidades: funcionalidades.length,
      totalAcessos,
      funcionalidadeMaisUsada: funcionalidades.length > 0 ? funcionalidades[0] : null,
      ultimoAcesso: funcionalidades.length > 0
        ? new Date(Math.max(...funcionalidades.map(f => f.ultimoAcesso.getTime())))
        : null
    };
  }
}
