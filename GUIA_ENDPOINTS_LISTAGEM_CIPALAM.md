# 📊 CIPALAM - Guia Completo de Endpoints de Listagem

Este documento contém todos os endpoints GET (listagem) disponíveis no backend do sistema CIPALAM, organizados por funcionalidade.

## 🚀 Como Usar

1. **Importe no Insomnia**: Use o arquivo `CIPALAM_ENDPOINTS_LISTAGEM_INSOMNIA.json` 
2. **Configure as variáveis de ambiente**:
   - `base_url`: `http://localhost:8080`
   - `responsavel_id`: `11` (exemplo)
   - `funcionario_id`: `1` (exemplo)  
   - `declaracao_id`: `10` (exemplo)

---

## 📋 **Interesse de Matrícula** (`/api/interesse-matricula`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/interesse-matricula` | Lista todas as declarações de interesse |
| `GET` | `/api/interesse-matricula/{id}` | Busca declaração por ID |
| `GET` | `/api/interesse-matricula/protocolo/{protocolo}` | Busca por protocolo |
| `GET` | `/api/interesse-matricula/responsavel/{responsavelId}` | Lista declarações de um responsável |
| `GET` | `/api/interesse-matricula/verificar-responsavel/{cpf}` | Verifica se responsável existe |

---

## 🎓 **Matrícula** (`/api/matricula`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/matricula/tipos-documentos` | Lista tipos de documentos |
| `GET` | `/api/matricula/status/{interesseId}` | Status de uma matrícula |
| `GET` | `/api/matricula/documentos/{interesseId}` | Documentos de uma matrícula |
| `GET` | `/api/matricula/responsavel/documentos-pendentes?responsavelId={id}` | Documentos pendentes do responsável |
| `GET` | `/api/matricula/responsavel/status?responsavelId={id}` | Status do responsável |
| `GET` | `/api/matricula/responsavel/template-documento/{tipoDocumentoId}` | Template de documento |
| `GET` | `/api/matricula/turmas-disponiveis` | Turmas disponíveis para matrícula |
| `GET` | `/api/matricula/turmas` | Lista todas as turmas |
| `GET` | `/api/matricula/turma/{id}` | Detalhes de uma turma |

---

## 📄 **Documentos** (`/api/documentos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/documentos/pendentes/{idResponsavel}` | Documentos pendentes por responsável |
| `GET` | `/api/documentos/download/{idDocumento}` | Download de documento |
| `GET` | `/api/documentos/configuracao/{tipoCota}` | Configuração de documentos por cota |

---

## ⚙️ **Configuração Documentos por Cota** (`/api/configuracao-documentos`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/configuracao-documentos` | Lista todas as configurações |
| `GET` | `/api/configuracao-documentos?format=frontend` | Configurações (formato frontend) |
| `GET` | `/api/configuracao-documentos/{tipoCota}` | Configuração por tipo de cota |

---

## 👨‍👩‍👧‍👦 **Responsável** (`/api/responsavel`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/responsavel/dashboard?responsavelId={id}` | Dashboard do responsável |
| `GET` | `/api/responsavel/documentos-pendentes?responsavelId={id}` | Documentos pendentes |
| `GET` | `/api/responsavel/template-documento/{tipoDocumentoId}` | Template de documento |
| `GET` | `/api/responsavel/status-matricula?responsavelId={id}` | Status da matrícula |

---

## 👤 **Pessoa** (`/api/pessoa`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/pessoa` | Lista todas as pessoas |
| `GET` | `/api/pessoa/{id}` | Busca pessoa por ID |
| `GET` | `/api/pessoa/funcionarios` | Lista funcionários |

---

## ⚡ **Funcionalidades** (`/api/funcionalidades`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/funcionalidades` | Lista todas as funcionalidades |
| `GET` | `/api/funcionalidades/ativas` | Lista funcionalidades ativas |
| `GET` | `/api/funcionalidades/{id}` | Busca funcionalidade por ID |
| `GET` | `/api/funcionalidades/chave/{chave}` | Busca por chave |

---

## 📋 **Tipos de Documento** (`/api/tipos-documento`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/tipos-documento` | Lista todos os tipos de documento |
| `GET` | `/api/tipos-documento/{id}` | Busca tipo por ID |
| `GET` | `/api/tipos-documento/cota/{tipoCota}` | Tipos por cota |
| `GET` | `/api/tipos-documento/ativos` | Lista apenas tipos ativos |

---

## 🔐 **Autenticação** (`/api/auth`)

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Login no sistema (não é GET, mas importante) |

---

## 📝 **Exemplos de Parâmetros**

### Tipos de Cota Disponíveis:
- `economica`
- `funcionario` 
- `livre`

### IDs de Exemplo:
- **Responsável**: `11`
- **Funcionário**: `1`
- **Declaração**: `10`
- **Tipo Documento**: `1`

### CPF de Exemplo:
- `12345678901`

### Protocolo de Exemplo:
- `TEST2025998`

---

## 💡 **Dicas de Uso no Insomnia**

1. **Variáveis de Ambiente**: Configure as variáveis `base_url`, `responsavel_id`, etc.
2. **Autenticação**: Alguns endpoints podem requerer token de autenticação
3. **Formato de Resposta**: Todos os endpoints retornam JSON
4. **Query Parameters**: Use `?parametro=valor` para parâmetros de consulta
5. **Path Parameters**: Substitua `{id}` pelos valores reais

---

## 🔄 **Status dos Servidores**

Para testar, certifique-se de que os servidores estejam rodando:

- **Backend (Spring Boot)**: `http://localhost:8080`
- **Frontend (Ionic)**: `http://localhost:8102`
- **Banco de Dados (MySQL)**: Porta `3306`

---

## 📚 **Próximos Passos**

1. Importe o arquivo JSON no Insomnia
2. Configure as variáveis de ambiente
3. Teste os endpoints começando pelos mais simples como `/api/funcionalidades`
4. Use os endpoints de autenticação se necessário
5. Explore os dados retornados para entender a estrutura do sistema

---

**🎯 Arquivo para Insomnia**: `CIPALAM_ENDPOINTS_LISTAGEM_INSOMNIA.json`

Este arquivo contém todas as requisições prontas para importar no Insomnia com configurações adequadas para testar todos os endpoints de listagem do sistema CIPALAM.
