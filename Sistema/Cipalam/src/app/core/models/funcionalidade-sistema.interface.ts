export interface FuncionalidadeSistema {
  chave: string; // Ex: 'gerenciarAlunos', 'emitirRelatoriosAdvertencias'
  nomeAmigavel: string; // Ex: 'Gerenciar Alunos', 'Emitir Relatórios de Advertências'
  descricao: string;
  icone: string;
  pai?: string; // opcional, para submenus
  categoria?: 'menu' | 'acao' | 'configuracao'; // tipo da funcionalidade
  ordemExibicao?: number; // ordem de exibição
}