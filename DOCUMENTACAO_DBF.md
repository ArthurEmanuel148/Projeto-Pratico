# 📚 TRABALHO PRÁTICO DE DBF - PROJETO CIPALAM

> **Documentação para apresentação do trabalho de Banco de Dados (DBF)**

---

## 📂 ARQUIVOS E PASTAS PRINCIPAIS DO TRABALHO

### �️ **Banco de Dados (Foco do Trabalho)**
```
📁 /Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Projeto-Pratico/Sistema/

├── CIPALAM_COMPLETO_FINAL.sql  # ⭐ ARQUIVO PRINCIPAL DO BANCO DE DADOS
├── Cipalam_BD_Projeto.mwb      # Modelo do MySQL Workbench
└── detalhamento.md             # Documentação detalhada
```

### 💻 **Backend (Spring Boot - API REST)**
```
📁 .../spring-cipalam/cipalam-sistema/src/main/java/com/cipalam/cipalam_sistema/

├── 📁 controller/          # Controllers REST (Endpoints da API)
├── 📁 model/              # Entidades do banco (tabelas)
├── 📁 service/            # Regras de negócio
├── 📁 repository/         # Acesso aos dados
└── 📁 DTO/               # Objetos de transferência
```

---

## � CONFIGURAÇÃO DO AMBIENTE

**Porta do Backend**: `http://localhost:8080`  
**Banco de Dados**: MySQL na porta `3307`  
**Usuário BD**: `root` (sem senha)

### � Recriar o Banco de Dados:
```bash
/Applications/XAMPP/xamppfiles/bin/mysql -u root < /Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Projeto-Pratico/Sistema/CIPALAM_COMPLETO_FINAL.sql
```

---

## 🗄️ ESTRUTURA DO BANCO DE DADOS

### 📊 **Principais Tabelas**

1. **tbPessoa** - Cadastro de pessoas (alunos, responsáveis, funcionários)
2. **tbLogin** - Credenciais de acesso ao sistema
3. **tbTurma** - Turmas escolares
4. **tbInteresseMatricula** - Declarações de interesse em matrícula
5. **tbFamilia** - Famílias cadastradas
6. **tbDocumentoMatricula** - Documentos da matrícula
7. **tbTipoDocumento** - Tipos de documentos necessários
8. **tbFuncionalidade** - Funcionalidades do sistema (menu dinâmico)

### �️ **Views (Consultas Pré-definidas)**

- `vw_iniciar_matricula` - Lista declarações prontas para matrícula
- `vw_detalhamento_declaracao` - Detalhamento completo das declarações

### ⚙️ **Procedures (Procedimentos Armazenados)**

- `sp_ObterInfoSelecaoTurma` - Informações para seleção de turma
- E outras procedures para fluxo de matrícula

---

## � ENDPOINTS PRINCIPAIS DA API

### 🔐 **1. AUTENTICAÇÃO**

#### **POST** `/api/auth/login`
Login no sistema
```json
{
  "usuario": "11122233344",
  "senha": "senha123"
}
```

---

### 👤 **2. CRUD DE PESSOAS**

#### **GET** `/api/pessoa` - Listar todas as pessoas

#### **GET** `/api/pessoa/{id}` - Buscar pessoa por ID

#### **POST** `/api/pessoa/cadastro-funcionario` - Cadastrar funcionário
```json
{
  "nmPessoa": "Maria Santos",
  "cpfPessoa": "12345678901",
  "dtNascPessoa": "1990-05-15",
  "email": "maria@email.com",
  "telefone": "(11) 98765-4321",
  "tipo": "funcionario",
  "login": {
    "usuario": "12345678901",
    "senha": "senha123"
  }
}
```

#### **PUT** `/api/pessoa/{id}` - Atualizar pessoa

#### **DELETE** `/api/pessoa/{id}` - Deletar pessoa

---

### 🏫 **3. CRUD DE TURMAS**

#### **GET** `/api/turmas` - Listar todas as turmas

#### **GET** `/api/turmas/{id}` - Buscar turma por ID

#### **POST** `/api/turmas` - Criar nova turma
```json
{
  "nomeTurma": "Turma A - Manhã",
  "anoLetivo": 2025,
  "turno": "Manhã",
  "capacidadeMaxima": 30,
  "descricao": "Turma do período matutino"
}
```

#### **PUT** `/api/turmas/{id}` - Atualizar turma

#### **DELETE** `/api/turmas/{id}` - Deletar turma

---

### 📝 **4. INTERESSE/MATRÍCULA**

#### **GET** `/api/interesse-matricula` - Listar declarações de interesse

#### **GET** `/api/interesse-matricula/para-matricula` - Listar prontas para matrícula

#### **POST** `/api/interesse-matricula` - Criar declaração
```json
{
  "idResponsavel": 1,
  "idAluno": 2,
  "tipoCota": "Livre",
  "observacoes": "Interesse em matrícula para 2025"
}
```

#### **POST** `/api/interesse-matricula/{declaracaoId}/iniciar-matricula-completa`
Iniciar matrícula (com parâmetros: `turmaId` e `funcionarioId`)

---

### 📄 **5. DOCUMENTOS**

#### **GET** `/api/documentos/pendentes/{idResponsavel}` - Documentos pendentes

#### **POST** `/api/documentos/anexar` - Anexar documento (Multipart Form Data)
```
Form Data:
- arquivo: [arquivo PDF/JPG/PNG]
- idDocumento: 1
- idResponsavel: 1
```

#### **GET** `/api/documentos/download/{idDocumento}` - Baixar documento

#### **GET** `/api/documentos/para-aprovacao` - Listar docs para aprovação

#### **POST** `/api/documentos/aprovar/{idDocumento}` - Aprovar documento

#### **POST** `/api/documentos/rejeitar/{idDocumento}` - Rejeitar documento

---

### 👨‍💼 **6. FUNCIONÁRIOS (Aprovação)**

#### **POST** `/api/funcionario/aprovar-documento`
```json
{
  "documentoId": 1,
  "observacoes": "Documento aprovado"
}
```

#### **POST** `/api/funcionario/rejeitar-documento`
```json
{
  "documentoId": 1,
  "motivoRejeicao": "Documento ilegível"
}
```

#### **GET** `/api/funcionario/documentos-para-aprovacao` - Buscar docs pendentes

---

### ⚙️ **7. FUNCIONALIDADES (Menu Dinâmico)**

#### **GET** `/api/funcionalidades` - Listar todas

#### **GET** `/api/funcionalidades/ativas` - Listar ativas

#### **GET** `/api/funcionalidades/{id}` - Buscar por ID

#### **GET** `/api/funcionalidades/chave/{chave}` - Buscar por chave

---

## 🎯 CONCEITOS DE BANCO DE DADOS APLICADOS

### 1. **Modelagem de Dados**
- Modelo Entidade-Relacionamento
- Normalização (1FN, 2FN, 3FN)
- Chaves Primárias e Estrangeiras

### 2. **SQL - DDL (Data Definition Language)**
- CREATE TABLE
- ALTER TABLE
- DROP TABLE
- Constraints (PRIMARY KEY, FOREIGN KEY, UNIQUE, NOT NULL)

### 3. **SQL - DML (Data Manipulation Language)**
- SELECT (consultas complexas com JOIN)
- INSERT
- UPDATE
- DELETE

### 4. **Views**
- Consultas pré-definidas reutilizáveis
- Simplificação de queries complexas

### 5. **Stored Procedures**
- Encapsulamento de lógica no banco
- Parâmetros de entrada e saída
- Controle de fluxo (IF, WHILE, etc)

### 6. **Triggers**
- Automação de ações no banco
- Auditoria e log automático

### 7. **Transações**
- ACID (Atomicidade, Consistência, Isolamento, Durabilidade)
- COMMIT e ROLLBACK

---

## � EXEMPLO DE CONSULTA SQL

### Listar declarações prontas para matrícula:
```sql
SELECT 
    i.idInteresse,
    i.protocolo,
    p.nmPessoa AS nomeAluno,
    r.nmPessoa AS nomeResponsavel,
    i.tipoCota,
    i.dataDeclaracao,
    i.status
FROM tbInteresseMatricula i
INNER JOIN tbPessoa p ON i.idAluno = p.idPessoa
INNER JOIN tbPessoa r ON i.idResponsavel = r.idPessoa
WHERE i.status = 'Aprovado'
ORDER BY i.dataDeclaracao DESC;
```

---

## 🧪 TESTES NO INSOMNIA/POSTMAN

### 📋 **Sequência de Testes Sugerida:**

1. **Autenticação**
   - Fazer login com usuário válido

2. **CRUD de Pessoas**
   - Listar pessoas
   - Criar funcionário
   - Atualizar dados
   - Deletar (opcional)

3. **CRUD de Turmas**
   - Listar turmas
   - Criar nova turma
   - Atualizar turma

4. **Fluxo de Matrícula**
   - Criar declaração de interesse
   - Listar declarações
   - Iniciar matrícula

5. **Gestão de Documentos**
   - Anexar documento
   - Listar pendentes
   - Aprovar/Rejeitar

---

## ✅ CHECKLIST PARA APRESENTAÇÃO

- [ ] Banco de dados criado (MySQL rodando)
- [ ] Backend Spring Boot rodando (porta 8080)
- [ ] Insomnia/Postman configurado
- [ ] Testar login
- [ ] Demonstrar CRUD de Pessoas
- [ ] Demonstrar CRUD de Turmas
- [ ] Demonstrar processo de matrícula
- [ ] Mostrar views do banco
- [ ] Mostrar procedures armazenadas
- [ ] Explicar relacionamentos entre tabelas

---

## 📌 OBSERVAÇÕES IMPORTANTES

1. **O sistema usa autenticação**, mas os endpoints de teste permitem acesso temporário
2. **Menu dinâmico** - Funcionalidades são cadastradas no banco
3. **Documentos** - Suporta PDF, JPG, PNG (máx 10MB)
4. **Senha padrão** dos responsáveis: últimos 4 dígitos do CPF
5. **Status da matrícula** - Fluxo controlado por procedures

---

**Base URL do Backend**: `http://localhost:8080`  
**Database**: `Cipalam` (MySQL porta 3307)
