import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { RotasConfigService } from './rotas-config.service';
import { FuncionalidadeSistema } from '../models/funcionalidade-sistema.interface';

export interface MenuItemNavegavel {
    chave: string;
    nomeAmigavel: string;
    icone: string;
    rota: string;
    pai?: string;
    categoria?: 'menu' | 'acao' | 'configuracao';
    children?: MenuItemNavegavel[];
    filhos?: MenuItemNavegavel[];
    // Compatibilidade com padrões existentes
    label?: string;
    route?: string;
    icon?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MenuNavigationService {

    constructor(
        private router: Router,
        private rotasConfig: RotasConfigService
    ) { }

    /**
     * Converte uma funcionalidade em um item de menu navegável
     */
    toMenuItemNavegavel(funcionalidade: FuncionalidadeSistema): MenuItemNavegavel {
        const rota = this.rotasConfig.getRota(funcionalidade.chave);

        return {
            chave: funcionalidade.chave,
            nomeAmigavel: funcionalidade.nomeAmigavel,
            icone: funcionalidade.icone,
            rota: rota,
            pai: funcionalidade.pai,
            categoria: funcionalidade.categoria,
            // Aliases para compatibilidade
            label: funcionalidade.nomeAmigavel,
            route: rota,
            icon: funcionalidade.icone
        };
    }

    /**
     * Converte múltiplas funcionalidades em itens de menu navegáveis
     */
    toMenuItemsNavegaveis(funcionalidades: FuncionalidadeSistema[]): MenuItemNavegavel[] {
        return funcionalidades.map(f => this.toMenuItemNavegavel(f));
    }

    /**
     * Constrói um menu hierárquico com rotas
     */
    buildMenuHierarquico(funcionalidades: FuncionalidadeSistema[]): MenuItemNavegavel[] {
        const principais = funcionalidades.filter(f => !f.pai);

        return principais.map(principal => {
            const filhos = funcionalidades.filter(f => f.pai === principal.chave);
            const item = this.toMenuItemNavegavel(principal);

            if (filhos.length > 0) {
                item.children = this.toMenuItemsNavegaveis(filhos);
                item.filhos = item.children; // Alias para compatibilidade
            }

            return item;
        });
    }

    /**
     * Navega para uma funcionalidade se ela tiver rota
     */
    navegarPara(chave: string): boolean {
        const rota = this.rotasConfig.getRota(chave);

        if (rota && rota !== '') {
            this.router.navigateByUrl(rota);
            return true;
        }

        return false;
    }

    /**
     * Verifica se uma funcionalidade é navegável
     */
    isNavegavel(chave: string): boolean {
        return this.rotasConfig.isNavegavel(chave);
    }

    /**
     * Obtém a rota de uma funcionalidade
     */
    getRota(chave: string): string {
        return this.rotasConfig.getRota(chave);
    }

    /**
     * Filtra itens de menu apenas pelos navegáveis
     */
    filtrarNavegaveis(items: MenuItemNavegavel[]): MenuItemNavegavel[] {
        return items.filter(item => this.isNavegavel(item.chave));
    }

    /**
     * Converte item de menu para formato legacy (compatibilidade)
     */
    toLegacyFormat(item: MenuItemNavegavel): any {
        return {
            ...item,
            rota: item.rota || item.route,
            nomeAmigavel: item.nomeAmigavel || item.label,
            icone: item.icone || item.icon
        };
    }

    /**
     * Converte múltiplos itens para formato legacy
     */
    toLegacyFormatArray(items: MenuItemNavegavel[]): any[] {
        return items.map(item => this.toLegacyFormat(item));
    }
}
