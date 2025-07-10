# INSTRUÇÕES PARA EXECUTAR O BANCO CORRIGIDO DO CIPALAM

## ⚠️ IMPORTANTE - BACKUP ANTES DE EXECUTAR

Antes de executar o novo script, **SEMPRE faça backup** do seu banco atual se tiver dados importantes!

## 📋 PASSOS PARA EXECUÇÃO

### 1. Acesse o XAMPP e MySQL

```bash
# Inicie o XAMPP
# Certifique-se que Apache e MySQL estão rodando
```

### 2. Acesse o phpMyAdmin ou MySQL Workbench

- **phpMyAdmin**: http://localhost/phpmyadmin
- **MySQL Workbench**: Conecte-se ao servidor local

### 3. Execute o script corrigido

#### Opção A - phpMyAdmin:

1. Abra o phpMyAdmin
2. Clique em "SQL" no menu superior
3. Copie todo o conteúdo do arquivo `CIPALAM_CORRIGIDO.sql`
4. Cole na área de texto
5. Clique em "Executar"

#### Opção B - MySQL Workbench:

1. Abra o MySQL Workbench
2. Conecte-se ao servidor
3. Abra o arquivo `CIPALAM_CORRIGIDO.sql`
4. Execute o script completo (Ctrl+Shift+Enter)

#### Opção C - Linha de comando:

```bash
# Navegue até a pasta do projeto
cd "/Applications/XAMPP/xamppfiles/htdocs/GitHub/Projeto-Pratico/Sistema/"

# Execute o script
mysql -u root -p < CIPALAM_CORRIGIDO.sql
```

## 🔧 O QUE FOI CORRIGIDO

### ✅ Estrutura da tabela `tbInteresseMatricula`

- **Antes**: Campos dispersos e não alinhados com as telas
- **Agora**: Estrutura completa conforme formulário das telas
  - Dados do responsável (nome, CPF, data nascimento, telefone, email)
  - Dados do aluno (nome, data nascimento, CPF opcional)
  - Tipo de cota (ENUM: livre, economica, funcionario)
  - Informações de renda (JSON para integrantes, valores calculados)
  - Horários selecionados (JSON array)
  - Mensagem adicional

### ✅ Nova tabela `tbConfiguracaoDocumentosCota`

- Armazena configuração de documentos por tipo de cota
- Integração com a tela de configuração que você desenvolveu
- Suporte a JSON para flexibilidade

### ✅ Tipos de documento padronizados

- Documentos básicos para todas as cotas
- Documentos específicos por cota (econômica, funcionário)
- Documentos com assinatura digital

### ✅ Sistema de permissões atualizado

- Funcionalidades alinhadas com as telas desenvolvidas
- Permissões corretas para as rotas do sistema

### ✅ Dados de teste realistas

- Declarações de interesse com estrutura correta
- Responsáveis e alunos com dados completos
- Configurações padrão de documentos por cota

## 🎯 RESULTADOS ESPERADOS

Após executar o script, você terá:

1. **Banco limpo e organizado** conforme as telas
2. **Declarações de teste** que aparecerão na lista
3. **Configuração de documentos funcionando**
4. **Usuários de teste**:
   - Admin: usuario `admin`, senha `password`
   - Professor: usuario `joao.professor`, senha `password`
   - Responsável: usuario `maria.responsavel`, senha `password`

## 🧪 TESTANDO O SISTEMA

1. **Faça login** com o usuário admin
2. **Acesse a lista de declarações**: Verá 3 declarações de teste
3. **Configure documentos por cota**: Salve/carregue configurações
4. **Crie nova declaração**: Preencha o formulário completo

## 🚨 POSSÍVEIS PROBLEMAS

### Erro de charset/encoding:

```sql
-- Execute antes do script principal se necessário
SET NAMES utf8mb4;
SET CHARACTER SET utf8mb4;
```

### Erro de permissões:

- Certifique-se que o usuário MySQL tem permissões para criar/deletar tabelas
- Use o usuário root se necessário

### Erro de foreign keys:

- O script já desabilita as verificações durante a execução
- Certifique-se de executar o script completo

## 📞 SUPORTE

Se houver problemas na execução:

1. Verifique os logs do MySQL
2. Execute seção por seção para identificar onde para
3. Certifique-se que o XAMPP/MySQL está funcionando

---

**✅ APÓS EXECUTAR COM SUCESSO:**

- O sistema estará funcionando conforme as telas desenvolvidas
- As declarações de interesse aparecerão corretamente na lista
- A configuração de documentos funcionará
- Todos os formulários estarão integrados com o banco
