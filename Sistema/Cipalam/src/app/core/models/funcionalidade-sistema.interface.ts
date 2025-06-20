export interface FuncionalidadeSistema {
  chave: string; // Ex: 'gerenciarAlunos', 'emitirRelatoriosAdvertencias'
  nomeAmigavel: string; // Ex: 'Gerenciar Alunos', 'Emitir Relatórios de Advertências'
  descricao: string;
  rota: string;
  icone: string;
  pai?: string; // opcional, para submenus
}