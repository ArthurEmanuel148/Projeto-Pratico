# CIPALAM - Guia de Testes de Autenticação de Responsáveis

## Responsáveis Cadastrados no Banco de Dados

### 1. Maria Santos
- **CPF**: 12345678901
- **Nome**: Maria Santos
- **Email**: maria.santos@email.com
- **Telefone**: (11) 98765-4321
- **Data Nascimento**: 1985-05-15
- **Senha**: password (hash: $2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi)

### 2. João Silva
- **CPF**: 98765432100
- **Nome**: João Silva
- **Email**: joao.silva@email.com
- **Telefone**: (11) 99999-8888
- **Data Nascimento**: 1990-08-22
- **Senha**: password (mesmo hash BCrypt)

### 3. Ana Costa
- **CPF**: 11122233344
- **Nome**: Ana Costa
- **Email**: ana.costa@email.com
- **Telefone**: (11) 77777-6666
- **Data Nascimento**: 1982-12-10
- **Senha**: password (mesmo hash BCrypt)

## Como Usar os Testes no Insomnia

### 1. Importar o Arquivo JSON
1. Abra o Insomnia
2. Clique em "Import/Export" 
3. Selecione "Import Data"
4. Escolha o arquivo `CIPALAM_INSOMNIA_AUTENTICACAO_RESPONSAVEL.json`

### 2. Testes Disponíveis

#### ✅ **Verificar Responsável - Maria Santos**
- **Método**: GET
- **URL**: `http://localhost:8080/api/interesse-matricula/verificar-responsavel/12345678901`
- **Descrição**: Verifica se a Maria está cadastrada no sistema
- **Resposta Esperada**:
```json
{
  "existe": true,
  "dadosResponsavel": {
    "nome": "Maria Santos",
    "cpf": "12345678901",
    "dataNascimento": "1985-05-15",
    "email": "maria.santos@email.com",
    "telefone": "(11) 98765-4321"
  }
}
```

#### ✅ **Autenticar Responsável - Maria Santos**
- **Método**: POST
- **URL**: `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`
- **Body**:
```json
{
  "cpf": "12345678901",
  "senha": "password"
}
```
- **Resposta Esperada**:
```json
{
  "autenticado": true,
  "dadosResponsavel": {
    "nome": "Maria Santos",
    "cpf": "12345678901",
    "dataNascimento": "1985-05-15",
    "email": "maria.santos@email.com",
    "telefone": "(11) 98765-4321"
  },
  "message": "Autenticação realizada com sucesso"
}
```

#### ✅ **Autenticar Responsável - João Silva**
- **Método**: POST
- **URL**: `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`
- **Body**:
```json
{
  "cpf": "98765432100",
  "senha": "password"
}
```

#### ✅ **Autenticar Responsável - Ana Costa**
- **Método**: POST
- **URL**: `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`
- **Body**:
```json
{
  "cpf": "11122233344",
  "senha": "password"
}
```

#### ❌ **Teste Senha Incorreta - Maria Santos**
- **Método**: POST
- **URL**: `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`
- **Body**:
```json
{
  "cpf": "12345678901",
  "senha": "senhaerrada123"
}
```
- **Resposta Esperada**:
```json
{
  "autenticado": false,
  "dadosResponsavel": null,
  "message": "Senha incorreta"
}
```

#### ❌ **Teste Responsável Não Cadastrado**
- **Método**: POST
- **URL**: `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`
- **Body**:
```json
{
  "cpf": "99999999999",
  "senha": "qualquersenha"
}
```
- **Resposta Esperada**:
```json
{
  "autenticado": false,
  "dadosResponsavel": null,
  "message": "Responsável não encontrado"
}
```

## Pré-requisitos para os Testes

1. **Servidor Spring Boot rodando** na porta 8080
2. **Banco de dados MySQL** com os dados inseridos do arquivo `CIPALAM_COMPLETO_FINAL.sql`
3. **Dependências BCrypt** funcionando no Spring Security

## Como Executar os Testes

1. Inicie o servidor Spring Boot:
```bash
cd Sistema/spring-cipalam/cipalam-sistema
mvn spring-boot:run
```

2. No Insomnia, execute os testes na seguinte ordem:
   - Primeiro: "Verificar Responsável - Maria Santos"
   - Segundo: "Autenticar Responsável - Maria Santos" 
   - Terceiro: Teste os outros responsáveis
   - Quarto: Teste os cenários de erro

## Resolução de Problemas

### Se a autenticação falhar:
1. Verifique se o servidor está rodando na porta 8080
2. Confirme que o banco de dados tem os dados inseridos
3. Verifique se o BCryptPasswordEncoder está funcionando
4. Teste primeiro a verificação de responsável antes da autenticação

### Se retornar "Login não encontrado":
- Significa que o responsável existe na tabela `tbPessoa` mas não tem registro na tabela `tblogin`
- Verifique se os dados foram inseridos corretamente do SQL

## Notas Importantes

- A senha real no banco está com hash BCrypt: `$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi`
- A senha em texto plano correspondente é: `password`
- O sistema agora usa verificação real de senha com BCrypt
- Todos os responsáveis de teste usam a mesma senha: `password`
