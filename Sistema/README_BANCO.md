# BANCO DE DADOS CIPALAM - VERSÃO COMPLETA

## ✅ Implementação do Fluxo de Iniciar Matrícula

Este arquivo único `CIPALAM_COMPLETO_FINAL.sql` contém toda a estrutura do banco de dados CIPALAM com o fluxo completo de iniciar matrícula implementado.

## 🚀 Como Usar

### 1. Recriar o Banco do Zero
```bash
# No MySQL/MariaDB
source /caminho/para/CIPALAM_COMPLETO_FINAL.sql
```

### 2. Testar o Banco (Opcional)
```bash
# Executar script de teste
source /caminho/para/TESTE_BANCO_CIPALAM.sql
```

## 📋 Principais Funcionalidades Implementadas

### ✅ Fluxo de Iniciar Matrícula
- **Seleção de Turma**: Funcionário escolhe turma disponível
- **Distribuição Automática**: Dados da declaração são distribuídos automaticamente
- **Integrantes Familiares**: Sistema processa e cria registros individuais
- **Documentos por Cota**: Documentos são criados baseados na cota selecionada
- **Login Automático**: Responsável recebe login automático (CPF/password)

### 🏗️ Estrutura Principal

#### Tabelas Principais
- **tbIntegranteFamilia**: Nova tabela para integrantes familiares individuais
- **tbFamilia**: Atualizada com dados completos de endereço e renda
- **tbTurma**: Controle de capacidade e disponibilidade
- **tbDocumentoMatricula**: Separação entre documentos da família e do aluno
- **tbTipoDocumento**: Campo escopo (família/aluno/ambos)

#### Procedures
- **sp_IniciarMatricula()**: Automatiza todo o processo de iniciar matrícula
- **sp_CriarDocumentosPendentes()**: Cria documentos baseados na cota
- **sp_ListarDocumentosResponsavel()**: Lista documentos do responsável

#### Functions
- **fn_ValidarIniciarMatricula()**: Valida se pode iniciar matrícula
- **fn_CountDocumentosPendentesResponsavel()**: Conta documentos pendentes

#### Views
- **vw_turmas_para_selecao**: Turmas disponíveis para seleção
- **vw_declaracoes_para_matricula**: Declarações prontas para matrícula
- **vw_documentos_responsavel**: Todos os documentos do responsável

## 🔄 Fluxo Completo de Uso

### 1. Funcionário Consulta Declarações
```sql
SELECT * FROM vw_declaracoes_para_matricula;
```

### 2. Funcionário Consulta Turmas Disponíveis
```sql
SELECT * FROM vw_turmas_para_selecao WHERE temVagas = TRUE;
```

### 3. Validar se Pode Iniciar
```sql
SELECT fn_ValidarIniciarMatricula(1, 1) as validacao;
```

### 4. Executar Iniciar Matrícula
```sql
CALL sp_IniciarMatricula(1, 1, 2);
-- Parâmetros: idDeclaracao, idTurma, idFuncionario
```

### 5. Responsável Consulta Documentos
```sql
CALL sp_ListarDocumentosResponsavel('111.222.333-44');
```

## 👤 Logins de Teste

- **admin** / password (Administrador)
- **joao.professor** / password (Funcionário)
- **maria.responsavel** / password (Responsável)
- **CPF_SEM_PONTOS** / password (Responsáveis auto-criados)

## 📋 Documentos por Cota

### Cota Livre
- RG do Responsável
- CPF do Responsável  
- Comprovante de Residência
- Certidão de Nascimento do Aluno
- Foto 3x4 do Aluno

### Cota Econômica
- Documentos básicos (cota livre) +
- Comprovante de Renda Familiar
- Declaração de Dependentes
- Comprovante de Benefícios Sociais (opcional)

### Cota Funcionário
- Documentos básicos (cota livre) +
- Comprovante de Vínculo Empregatício
- Declaração de Parentesco
- Contracheque

## 🔄 Processo Automático sp_IniciarMatricula()

1. Validar declaração e turma
2. Criar família com dados da declaração
3. Verificar se responsável já existe
4. Criar responsável (se necessário) + login
5. Vincular responsável à família
6. Criar pessoa aluno
7. Gerar matrícula automática
8. Matricular aluno na turma selecionada
9. Processar integrantes familiares (JSON → tabela)
10. Criar documentos pendentes por cota
11. Atualizar status da declaração
12. Atualizar capacidade da turma
13. Registrar log da ação
14. Retornar dados do processo

## ✨ Sistema Completamente Pronto Para

- ✅ Seleção de turma pelo funcionário
- ✅ Distribuição automática de todos os dados
- ✅ Criação automática de integrantes familiares
- ✅ Documentos organizados por cota e escopo
- ✅ Login automático para responsável
- ✅ Interface responsável para upload de documentos
- ✅ Controle completo do fluxo de matrícula

## 📁 Arquivos

- **CIPALAM_COMPLETO_FINAL.sql**: Arquivo principal único para recriar o banco
- **TESTE_BANCO_CIPALAM.sql**: Script de teste para validar a instalação
- **README_BANCO.md**: Este arquivo de documentação

---

**✨ Banco de dados completamente funcional e otimizado para o fluxo de iniciar matrícula!**
