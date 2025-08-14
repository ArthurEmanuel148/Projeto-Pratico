# Sistema CIPALAM - Gestão Educacional

## 📋 Visão Geral
O Sistema CIPALAM é uma aplicação web desenvolvida em Angular/Ionic para gestão educacional, permitindo o gerenciamento de funcionários, matrículas e declarações de interesse.

## 🏗️ Arquitetura do Sistema

### Frontend (Angular/Ionic)
```
src/app/
├── core/                          # Serviços e modelos centrais
│   ├── models/                    # Interfaces e modelos de dados
│   │   └── funcionalidade-sistema.interface.ts
│   └── services/                  # Serviços principais
│       ├── auth.service.ts        # Autenticação e autorização
│       ├── auth.guard.ts          # Guard de autenticação
│       ├── role.guard.ts          # Guard de permissões
│       ├── funcionario.service.ts # Gestão de funcionários
│       ├── funcionalidades-sistema.service.ts # Sistema de funcionalidades
│       ├── funcionalidades-usos.service.ts    # Tracking de uso
│       ├── navigation.service.ts  # Navegação
│       ├── menu-navigation.service.ts # Navegação de menu
│       ├── api-config.service.ts  # Configuração de API
│       └── rotas-config.service.ts # Configuração de rotas
│
├── funcionalidades/               # Funcionalidades específicas do sistema
│   ├── autenticacao/             # Sistema de login
│   │   └── login/
│   ├── gerenciamento-funcionarios/ # Gestão de funcionários
│   │   ├── cadastro-funcionario/
│   │   ├── lista-funcionarios/
│   │   ├── components/
│   │   └── models/
│   └── interesse-matricula/       # Declarações de interesse para matrícula
│       ├── pages/
│       ├── components/
│       ├── models/
│       └── services/
│
├── paineis/                       # Sistema de painéis (roteamento principal)
│   ├── paineis-routing.module.ts  # Rotas: /sistema/*
│   └── paineis.module.ts
│
└── painel-funcionario/            # Layout e componentes do painel
    ├── components/
    │   ├── painel-layout/         # Layout principal do sistema
    │   └── user-info-header/      # Header com informações do usuário
    └── painel-funcionario.page.*  # Página de dashboard
```

### Backend (Spring Boot)
```
src/main/java/com/cipalam/cipalam_sistema/
├── controller/                    # Controladores REST
├── service/                       # Lógica de negócio
├── repository/                    # Acesso a dados
├── model/                         # Entidades JPA
├── DTO/                          # Data Transfer Objects
├── config/                       # Configurações
├── security/                     # Segurança e autenticação
└── enums/                        # Enumerações
```

## 🚀 Funcionalidades Principais

### 1. **Sistema de Autenticação**
- Login seguro com validação de credenciais
- Controle de acesso baseado em perfis (admin, professor, funcionário, responsável)
- Guards de proteção de rotas

### 2. **Gestão de Funcionários**
- Cadastro de novos funcionários
- Listagem e busca de funcionários
- Gerenciamento de permissões
- Histórico de atividades

### 3. **Declarações de Interesse para Matrícula**
- Formulário público para declaração de interesse
- Configuração de documentos por tipo de cota
- Lista e gerenciamento de declarações
- Workflow de aprovação

### 4. **Dashboard Inteligente**
- Funcionalidades mais utilizadas pelo usuário
- Estatísticas de uso
- Acesso rápido às principais funções
- Histórico de navegação

### 5. **Sistema de Menu Dinâmico**
- Menu adaptável baseado em permissões
- Menu superior com funcionalidades frequentes
- Menu lateral hierárquico
- Cache de funcionalidades para performance

## 🛣️ Estrutura de Rotas

### Rotas Públicas
- `/login` - Página de autenticação
- `/interesse-matricula` - Formulário público de interesse

### Rotas do Sistema (Autenticadas)
- `/sistema/dashboard` - Dashboard principal
- `/sistema/funcionarios` - Gestão de funcionários
  - `/sistema/funcionarios/lista` - Lista de funcionários
  - `/sistema/funcionarios/cadastro` - Cadastro de funcionário
- `/sistema/matriculas` - Gestão de matrículas
  - `/sistema/matriculas/declaracoes-interesse` - Declarações de interesse
  - `/sistema/matriculas/configuracao-documentos` - Config. documentos

## 🔧 Tecnologias Utilizadas

### Frontend
- **Angular 19** - Framework principal
- **Ionic 8** - Framework UI mobile-first
- **TypeScript** - Linguagem de programação
- **RxJS** - Programação reativa
- **Capacitor** - Deploy mobile nativo

### Backend
- **Spring Boot** - Framework Java
- **Spring Security** - Segurança e autenticação
- **Spring Data JPA** - Persistência de dados
- **MySQL** - Banco de dados relacional

### Ferramentas de Desenvolvimento
- **Angular CLI** - Ferramenta de linha de comando
- **Ionic CLI** - Ferramenta Ionic
- **Maven** - Gerenciamento de dependências Java
- **Git** - Controle de versão

## 📦 Instalação e Execução

### Pré-requisitos
- Node.js 18+
- Angular CLI
- Ionic CLI
- Java 17+
- Maven
- MySQL

### Frontend (Angular/Ionic)
```bash
cd Sistema/Cipalam
npm install
ionic serve
```

### Backend (Spring Boot)
```bash
cd Sistema/spring-cipalam/cipalam-sistema
mvn spring-boot:run
```

### Banco de Dados
1. Executar script: `Sistema/CIPALAM_COMPLETO_FINAL.sql`
2. Configurar conexão em `application.properties`

## 🎯 Fluxos Principais

### 1. Login e Acesso ao Sistema
1. Usuário acessa `/login`
2. Insere credenciais
3. Sistema valida e redireciona para `/sistema/dashboard`
4. Menu é construído baseado nas permissões do usuário

### 2. Declaração de Interesse (Público)
1. Responsável acessa `/interesse-matricula`
2. Preenche formulário em etapas
3. Submete declaração
4. Sistema gera protocolo

### 3. Gestão de Funcionários (Interno)
1. Funcionário autorizado acessa `/sistema/funcionarios`
2. Pode listar, cadastrar ou editar funcionários
3. Define permissões por funcionário
4. Sistema registra auditoria

## 🔒 Sistema de Permissões

### Perfis de Usuário
- **Admin**: Acesso total ao sistema
- **Professor**: Acesso limitado a suas turmas
- **Funcionário**: Acesso a funcionalidades específicas
- **Responsável**: Acesso apenas ao dashboard específico

### Permissões Granulares
- `gerenciamentoFuncionarios`: Gestão de funcionários
- `declaracoesInteresse`: Visualizar declarações
- `configurarDocumentosCota`: Configurar documentos
- `relatorios`: Gerar relatórios
- `administracao`: Funções administrativas

## 📊 Sistema de Monitoramento

### Tracking de Uso
- Registro de funcionalidades mais utilizadas
- Histórico de navegação por usuário
- Cache inteligente de menu
- Estatísticas de performance

### Logs e Auditoria
- Log de acessos
- Auditoria de alterações
- Monitoramento de erros
- Relatórios de uso

## 🚦 Status do Projeto

### ✅ Implementado
- Sistema de autenticação completo
- Layout responsivo
- Gestão básica de funcionários
- Declarações de interesse
- Menu dinâmico
- Sistema de permissões

### 🔄 Em Desenvolvimento
- Relatórios avançados
- Integração mobile completa
- Sistema de notificações
- Backup automático

### 📋 Planejado
- Dashboard analytics
- API pública
- Integração com outros sistemas
- App mobile nativo

## 🤝 Contribuição

Para contribuir com o projeto:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 📞 Suporte

Para suporte técnico ou dúvidas:
- Documentação: [README.md](./README.md)
- Issues: [GitHub Issues](../../issues)
- Email: suporte@cipalam.com.br

---

**Desenvolvido com ❤️ para a comunidade educacional**
- ✅ **Sistema de Biblioteca (Roda de Leitura)**
- ✅ **Controle de Uniformes**
- ✅ **Registro de Advertências**
- ✅ **Planejamento de Aulas**
- ✅ **Sistema de Permissões Baseado em Perfis**

## 🚀 Como Executar

### 1. Configuração do Banco de Dados

Execute o arquivo SQL único e completo:

```bash
# Navegue até a pasta Sistema
cd Sistema/

# Execute no MySQL/phpMyAdmin o arquivo:
CIPALAM_CORRIGIDO.sql
```

### 2. Backend (Spring Boot)

```bash
cd Sistema/spring-cipalam/cipalam-sistema/
./mvnw spring-boot:run
```

### 3. Frontend (Angular/Ionic)

```bash
cd Sistema/Cipalam/
npm install
ionic serve
```

## 📊 Usuários de Teste

| Usuário             | Senha      | Perfil      | Acesso               |
| ------------------- | ---------- | ----------- | -------------------- |
| `admin`             | `password` | Diretor     | Completo             |
| `joao.professor`    | `password` | Professor   | Matrículas/Aulas     |
| `maria.responsavel` | `password` | Responsável | Próprias informações |

## 🎯 Funcionalidades Principais

### Declaração de Interesse (Modernizada)

- Interface step-by-step intuitiva
- Configuração de documentos por tipo de cota
- Lista otimizada para equipe pedagógica
- Validações completas e feedback visual

### Sistema de Permissões

- Acesso baseado em perfis de usuário
- Menu dinâmico conforme permissões
- Proteção de rotas e funcionalidades

## Autores

| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/161357772?v=4" width=115><br><sub>Arthur Emanuel</sub>](https://github.com/ArthurEmanuel148) | [<img loading="lazy" src="https://avatars.githubusercontent.com/u/141276601?v=4" width=115><br><sub>Ana Luíza</sub>](https://github.com/Lubina01) |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |
