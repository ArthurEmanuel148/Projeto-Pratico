import { Injectable } from '@angular/core';

export interface RotaFuncionalidade {
    chave: string;
    rota: string;
}

@Injectable({
    providedIn: 'root'
})
export class RotasConfigService {

    private readonly rotasMap: Map<string, string> = new Map([
        // Painéis principais
        ['painel', '/paineis/painel'],

        // Funcionários
        ['cadastroFuncionario', '/paineis/gerenciamento-funcionarios'],
        ['gerenciamentoFuncionarios', '/paineis/gerenciamento-funcionarios'],

        // Matrículas
        ['declaracoesInteresse', '/paineis/interesse-matricula/lista-declaracoes'],
        ['configurarDocumentosCota', '/paineis/interesse-matricula/configuracao-documentos'],
        ['declaracaoInteresse', '/paineis/interesse-matricula/declaracao-interesse'],

        // Alunos (futuras implementações)
        ['listaAlunos', '/paineis/alunos/lista'],
        ['cadastroAluno', '/paineis/alunos/cadastro'],

        // Administração
        ['configuracaoSistema', '/paineis/administracao/configuracao'],
        ['relatorios', '/paineis/administracao/relatorios'],
        ['auditoria', '/paineis/administracao/auditoria']
    ]);

    constructor() { }

    /**
     * Obtém a rota para uma funcionalidade específica
     * @param chave Chave da funcionalidade
     * @returns Rota correspondente ou string vazia se não encontrada
     */
    getRota(chave: string): string {
        return this.rotasMap.get(chave) || '';
    }

    /**
     * Verifica se uma funcionalidade possui rota definida
     * @param chave Chave da funcionalidade
     * @returns True se possui rota, false caso contrário
     */
    temRota(chave: string): boolean {
        return this.rotasMap.has(chave) && this.rotasMap.get(chave) !== '';
    }

    /**
     * Adiciona ou atualiza uma rota dinamicamente
     * @param chave Chave da funcionalidade
     * @param rota Nova rota
     */
    setRota(chave: string, rota: string): void {
        this.rotasMap.set(chave, rota);
    }

    /**
     * Remove uma rota
     * @param chave Chave da funcionalidade
     */
    removeRota(chave: string): void {
        this.rotasMap.delete(chave);
    }

    /**
     * Obtém todas as rotas configuradas
     * @returns Array com todas as configurações de rota
     */
    getTodasRotas(): RotaFuncionalidade[] {
        return Array.from(this.rotasMap.entries()).map(([chave, rota]) => ({ chave, rota }));
    }

    /**
     * Verifica se uma funcionalidade é navegável (tem rota)
     * @param chave Chave da funcionalidade
     * @returns True se é navegável, false caso contrário
     */
    isNavegavel(chave: string): boolean {
        const rota = this.getRota(chave);
        return rota !== '' && rota.startsWith('/');
    }
}
