# Tutorial Testes Insomnia - Autenticação Responsável

## 1. VERIFICAR SE RESPONSÁVEL EXISTE

**Método:** GET
**URL:** `http://localhost:8080/api/interesse-matricula/verificar-responsavel/123.456.789-00`

**Body:** NENHUM (é um GET, não precisa de body)

---

## 2. AUTENTICAR RESPONSÁVEL (MARIA)

**Método:** POST
**URL:** `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cpf": "123.456.789-00",
  "senha": "password"
}
```

---

## 3. AUTENTICAR RESPONSÁVEL (JOÃO)

**Método:** POST
**URL:** `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cpf": "987.654.321-00",
  "senha": "password"
}
```

---

## 4. AUTENTICAR RESPONSÁVEL (ANA)

**Método:** POST
**URL:** `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cpf": "456.789.123-00",
  "senha": "password"
}
```

---

## 5. TESTE COM SENHA INCORRETA

**Método:** POST
**URL:** `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "cpf": "123.456.789-00",
  "senha": "senhaerrada"
}
```

---

## Como usar no Insomnia:

1. **Criar nova requisição**
2. **Selecionar o método** (GET ou POST)
3. **Copiar a URL**
4. **Se for POST:**
   - Ir na aba "Body"
   - Selecionar "JSON"
   - Colar o JSON do body
5. **Executar a requisição**

## Respostas esperadas:

### Autenticação com sucesso:
```json
{
  "autenticado": true,
  "dadosResponsavel": {
    "nome": "Maria Silva",
    "cpf": "123.456.789-00",
    "dataNascimento": "1985-03-15",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999"
  },
  "message": "Autenticação realizada com sucesso"
}
```

### Senha incorreta:
```json
{
  "autenticado": false,
  "dadosResponsavel": null,
  "message": "Senha incorreta"
}
```

### Responsável não encontrado:
```json
{
  "autenticado": false,
  "dadosResponsavel": null,
  "message": "Responsável não encontrado"
}
```
