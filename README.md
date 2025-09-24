# Sistema CIPALAM - Plataforma Integrada de Gestão Educacional

## 📋 Visão Geral
O Sistema CIPALAM é uma plataforma completa desenvolvida para o Instituto Cipalam, oferecendo gestão integrada de matrículas, documentos, funcionários e diversos processos administrativos. Com interface moderna e responsiva, o sistema facilita tanto o trabalho administrativo quanto o acesso às informações por responsáveis e alunos.

## 🚀 Principais Funcionalidades

- **Gestão de Matrículas**: Processo completo desde manifestação de interesse até efetivação
- **Gerenciamento de Documentos**: Upload, validação e aprovação de documentos por tipo de cota
- **Administração de Funcionários**: Cadastro, permissões e controle de acesso
- **Dashboard Personalizado**: Interface adaptativa com funcionalidades mais utilizadas
- **Menu Dinâmico**: Navegação inteligente baseada em permissões de usuário

## � Stack Tecnológica

### Frontend
- **Angular 19** com TypeScript 5.6.3
- **Ionic 8** para interface responsiva e mobile-first
- **Capacitor 7.2.0** para desenvolvimento mobile
- **RxJS** para programação reativa
- **SCSS** com tema personalizado e design system

### Backend
- **Spring Boot 3.4.9** com Java 21
- **Spring Security** com JWT para autenticação
- **Spring Data JPA** para acesso ao banco de dados
- **MySQL 8.0+** como banco de dados relacional

## 💻 Instalação e Execução

### Requisitos
- Node.js 18+ e NPM
- Angular CLI e Ionic CLI
- Java 21 JDK
- MySQL 8.0+
- XAMPP (opcional para desenvolvimento)

### Passos Rápidos

1. **Banco de Dados**
   ```bash
   /Applications/XAMPP/xamppfiles/bin/mysql -u root < Sistema/CIPALAM_COMPLETO_FINAL.sql
   ```

2. **Backend**
   ```bash
   cd Sistema/spring-cipalam/cipalam-sistema/
   ./mvnw spring-boot:run
   ```

3. **Frontend**
   ```bash
   cd Sistema/Cipalam/
   npm install
   ionic serve
   ```

## 🔒 Segurança e Permissões

O sistema implementa um controle de acesso granular com:

- **Autenticação JWT** com tokens de 24h e refresh tokens
- **Perfis de Usuário**: Administrador, Funcionário, Professor, Responsável
- **Permissões Específicas** para cada funcionalidade
- **Menu Adaptável** que exibe apenas o que o usuário tem acesso
- **Proteção de Rotas** no frontend e endpoints no backend

## 🏗️ Arquitetura

O projeto segue a seguinte arquitetura:

### Frontend
- **Core Module**: Serviços centralizados e modelos de dados
- **Feature Modules**: Módulos por funcionalidade
- **Componentes Reutilizáveis**: Design system consistente
- **Interceptors**: Tratamento de tokens e erros
- **Guards**: Proteção de rotas baseada em permissões

### Backend
- **API REST**: Mais de 130 endpoints documentados
- **Controladores**: Separação por domínio de negócio
- **Serviços**: Encapsulamento da lógica de negócio
- **Repositórios**: Acesso ao banco de dados
- **DTOs**: Transferência segura de dados

## � Versão Mobile

O sistema também visa um funcionamento otimizado para mobile:

- Interface responsiva funcional em qualquer dispositivo
- Capacitor para empacotamento em apps nativos
- Experiência otimizada para telas menores
- Funcionalidades offline para operações críticas

## 📊 Dashboard e Funcionalidades Inteligentes

O sistema adapta-se ao uso de cada usuário:

- **Dashboard Personalizado**: Prioriza funcionalidades mais utilizadas
- **Menu Inteligente**: Adapta-se ao histórico de navegação

## 🔄 Fluxos Principais

### Processo de Matrícula
1. **Manifestação de Interesse**: Formulário público acessível a responsáveis
2. **Upload de Documentos**: Envio de documentação conforme tipo de cota
3. **Validação**: Funcionários verificam a documentação enviada
4. **Aprovação ou Rejeição**: Feedback para o responsável
5. **Matrícula Efetiva**: Formalização do ingresso na instituição

### Gestão de Documentos
- Upload seguro com validação de tamanho e formato
- Organização por tipo, família e ano
- Sistema de aprovação com auditoria
- Histórico completo de alterações

## 👥 Usuários e Acessos

| Perfil       | Funcionalidades Principais                           |
|--------------|-----------------------------------------------------|
| Administrador | Acesso completo ao sistema                          |
| Funcionário  | Gestão de matrículas e aprovação de documentos      |
| Professor    | Acesso a turmas e registro de informações acadêmicas |
| Responsável  | Upload de documentos e acompanhamento do processo    |

## � Acessando o Sistema

### Credenciais de Teste

| Usuário      | Senha      | Perfil       | Acesso                     |
|--------------|------------|--------------|----------------------------|
| `admin`      | `admin123` | Administrador | Acesso completo            |
| `funcionario`| `func123`  | Funcionário  | Gestão de matrículas       |
| `responsavel`| `resp123`  | Responsável  | Upload de documentos       |

### URLs de Acesso
- **Frontend**: http://localhost:8100
- **Backend API**: http://localhost:8080/api
- **Documentos**: /cipalam_documentos/

## � Status do Projeto

O sistema está em constante evolução, com funcionalidades sendo implementadas continuamente:

- **✅ Implementado**: Autenticação, gestão de funcionários, processamento de matrículas
- **🔄 Em Andamento**: Relatórios avançados, otimizações de performance
- **📅 Planejado**: Módulo de acompanhamento acadêmico, app mobile nativo

## 🤖 Desenvolvimento com IA

Este projeto foi desenvolvido com auxílio do **GitHub Copilot**, utilizando inteligência artificial para:
- Geração de código mais eficiente e consistente
- Detecção de bugs e vulnerabilidades
- Sugestões de melhores práticas
- Aceleração do desenvolvimento

## 📝 Licença

Este projeto está sob a licença MIT. Consulte o arquivo `LICENSE` para mais detalhes.

---

## 👥 Autores

| [<img loading="lazy" src="https://avatars.githubusercontent.com/u/161357772?v=4" width=80><br><sub>Arthur Emanuel</sub>](https://github.com/ArthurEmanuel148) | [<img loading="lazy" src="https://avatars.githubusercontent.com/u/141276601?v=4" width=80><br><sub>Ana Luíza</sub>](https://github.com/Lubina01) |
| :------------------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------: |