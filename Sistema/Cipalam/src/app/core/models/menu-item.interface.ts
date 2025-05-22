// src/app/core/models/menu-item.interface.ts
export interface MenuItem {
    id: string; // Identificador único para o item (útil para submenus)
    label: string; // Texto exibido para o item
    icon?: string; // Nome do ícone Ionic para o menu lateral ou popover
    route?: string; // Rota Angular para navegação
    action?: (event?: any) => void; // Função a ser executada ao clicar (ex: logout)
    showInTopMenu?: boolean; // Se este item principal deve aparecer no menu superior
    topMenuIcon?: string; // Ícone específico para o menu superior (pode ser o mesmo que 'icon')
    children?: MenuItem[]; // Array de subitens (para menu lateral ou dropdown no topo)
// requiredPermission?: string; // Para lógica futura de permissões (backend)
  }