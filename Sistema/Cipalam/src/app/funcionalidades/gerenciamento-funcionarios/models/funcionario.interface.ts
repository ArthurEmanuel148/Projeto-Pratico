export interface Funcionario {
    id?: string | number;
    nomeCompleto: string;
    email: string;
    dataNascimento: string;
    dataEntradaInstituto: string;
    telefone: string;
    usuarioSistema: string;
    senhaSistema?: string; // Opcional no objeto, mas pode ser obrigatório no formulário inicial
    permissoes?: Record<string, boolean>; // Chave da funcionalidade: true/false
}