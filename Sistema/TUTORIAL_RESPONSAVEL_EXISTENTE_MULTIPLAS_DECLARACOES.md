# Tutorial Completo - Responsável Existente Fazendo Nova Declaração

## Cenário de Teste
Maria Silva já tem um filho (João Silva) estudando na instituição e agora quer matricular mais filhos.

## Ordem dos Testes no Insomnia

### 1. **VERIFICAR SE RESPONSÁVEL EXISTE**
- **Método:** GET
- **URL:** `http://localhost:8080/api/interesse-matricula/verificar-responsavel/123.456.789-00`
- **Body:** Nenhum
- **Resultado esperado:** 
```json
{
  "existe": true,
  "dadosResponsavel": {
    "nome": "Maria Silva",
    "cpf": "123.456.789-00",
    "dataNascimento": "1985-03-15",
    "email": "maria@email.com",
    "telefone": "(11) 99999-9999"
  }
}
```

### 2. **AUTENTICAR RESPONSÁVEL**
- **Método:** POST
- **URL:** `http://localhost:8080/api/interesse-matricula/autenticar-responsavel`
- **Body (JSON):**
```json
{
  "cpf": "123.456.789-00",
  "senha": "password"
}
```
- **Resultado esperado:**
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

### 3. **NOVA DECLARAÇÃO - COTA LIVRE (2º FILHO)**
- **Método:** POST
- **URL:** `http://localhost:8080/api/interesse-matricula`
- **Body (JSON):**
```json
{
  "nomeResponsavel": "Maria Silva",
  "cpfResponsavel": "123.456.789-00",
  "dataNascimentoResponsavel": "1985-03-15",
  "telefoneResponsavel": "(11) 99999-9999",
  "emailResponsavel": "maria@email.com",
  "nomeAluno": "Pedro Silva",
  "dataNascimentoAluno": "2015-08-10",
  "cpfAluno": "111.222.333-44",
  "tipoCota": "livre",
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "uf": "SP",
  "horariosSelecionados": ["manha"],
  "observacoesResponsavel": "Segundo filho matriculando na instituição. Já tenho experiência com a escola através do meu primeiro filho João Silva."
}
```

### 4. **NOVA DECLARAÇÃO - COTA ECONÔMICA (3º FILHO)**
- **Método:** POST
- **URL:** `http://localhost:8080/api/interesse-matricula`
- **Body (JSON):**
```json
{
  "nomeResponsavel": "Maria Silva",
  "cpfResponsavel": "123.456.789-00",
  "dataNascimentoResponsavel": "1985-03-15",
  "telefoneResponsavel": "(11) 99999-9999",
  "emailResponsavel": "maria@email.com",
  "nomeAluno": "Ana Clara Silva",
  "dataNascimentoAluno": "2016-12-20",
  "cpfAluno": "555.666.777-88",
  "tipoCota": "economica",
  "rendaFamiliar": 3500.00,
  "rendaPerCapita": 875.00,
  "numeroIntegrantes": 4,
  "integrantesRenda": [
    {
      "nome": "Maria Silva",
      "renda": 2500.00
    },
    {
      "nome": "José Silva",
      "renda": 1000.00
    }
  ],
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "uf": "SP",
  "horariosSelecionados": ["tarde"],
  "observacoesResponsavel": "Terceiro filho da família. Situação financeira mudou e agora preciso da cota econômica para esta filha."
}
```

### 5. **NOVA DECLARAÇÃO - COTA FUNCIONÁRIO (4º FILHO)**
- **Método:** POST
- **URL:** `http://localhost:8080/api/interesse-matricula`
- **Body (JSON):**
```json
{
  "nomeResponsavel": "Maria Silva",
  "cpfResponsavel": "123.456.789-00",
  "dataNascimentoResponsavel": "1985-03-15",
  "telefoneResponsavel": "(11) 99999-9999",
  "emailResponsavel": "maria@email.com",
  "nomeAluno": "Lucas Silva",
  "dataNascimentoAluno": "2018-05-30",
  "cpfAluno": "999.888.777-66",
  "tipoCota": "funcionario",
  "rendaFamiliar": 4200.00,
  "cep": "01310-100",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "bairro": "Bela Vista",
  "cidade": "São Paulo",
  "uf": "SP",
  "horariosSelecionados": ["integral"],
  "observacoesResponsavel": "Quarto filho da família. Agora trabalho na instituição como funcionária, então solicitando a cota de funcionário para este filho."
}
```

### 6. **LISTAR TODAS AS DECLARAÇÕES**
- **Método:** GET
- **URL:** `http://localhost:8080/api/interesse-matricula`
- **Body:** Nenhum
- **Para verificar:** Todas as declarações salvas

## Como Importar no Insomnia

1. Abra o Insomnia
2. Clique em "Create" → "Import from File"
3. Selecione o arquivo `CIPALAM_INSOMNIA_DECLARACAO_COMPLETA_RESPONSAVEL_EXISTENTE.json`
4. Todos os testes serão importados automaticamente

## Ordem de Execução

Execute os testes na ordem numérica (1 → 2 → 3 → 4 → 5 → 6) para simular o fluxo completo:

1. Verificar se Maria existe ✅
2. Autenticar Maria ✅
3. Cadastrar 2º filho (Pedro) - Cota Livre ✅
4. Cadastrar 3º filho (Ana Clara) - Cota Econômica ✅
5. Cadastrar 4º filho (Lucas) - Cota Funcionário ✅
6. Listar todas as declarações para verificar ✅

## Resultado Final

Ao final, você terá 4 declarações de interesse para a mesma responsável (Maria Silva) com diferentes filhos e diferentes tipos de cota, simulando um cenário real de uma família com múltiplos filhos na instituição.
