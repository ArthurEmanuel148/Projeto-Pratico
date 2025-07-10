# Sistema CIPALAM - Instituto Raimundo Anício

<img loading="lazy" src="https://img.shields.io/badge/Status-Funcional-brightgreen"/>

## 📋 Descrição do Projeto

Sistema completo de gerenciamento para o Projeto Social Instituto Raimundo Anício, desenvolvido com Angular/Ionic e backend em Spring Boot. O sistema inclui funcionalidades modernizadas para:

- ✅ **Declaração de Interesse/Matrícula** - Fluxo completo step-by-step
- ✅ **Gerenciamento de Alunos e Responsáveis**
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
