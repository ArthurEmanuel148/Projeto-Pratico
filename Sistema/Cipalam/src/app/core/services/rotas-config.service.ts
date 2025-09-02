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
        // Dashboard principal
        ['painel', '/sistema/dashboard'],

        // Funcionários
        ['cadastroFuncionario', '/sistema/funcionarios/cadastro'],
        ['gerenciamentoFuncionarios', '/sistema/funcionarios/lista'],
        ['funcionarios', '/sistema/funcionarios'],

        // Matrículas
        ['declaracoesInteresse', '/sistema/matriculas/declaracoes'],
        ['configurarDocumentosCota', '/sistema/matriculas/configuracao-documentos'],
        ['declaracaoInteresse', '/sistema/matriculas/declaracao-interesse'],
        ['matriculas', '/sistema/matriculas'],
        ['iniciarMatricula', '/sistema/iniciar-matricula'],

        // Documentos
        ['aprovacaoDocumentos', '/sistema/documentos'],
        ['gerenciamentoDocumentos', '/sistema/documentos'],
        ['documentos', '/sistema/documentos'],

        // Alunos (futuras implementações)
        ['listaAlunos', '/sistema/alunos/lista'],
        ['cadastroAluno', '/sistema/alunos/cadastro'],
        ['alunos', '/sistema/alunos'],

        // Administração
        ['configuracaoSistema', '/sistema/administracao/configuracao'],
        ['relatorios', '/sistema/administracao/relatorios'],
        ['auditoria', '/sistema/administracao/auditoria'],
        ['administracao', '/sistema/administracao']
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
