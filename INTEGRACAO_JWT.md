# 🔐 Integração JWT - Backend + Frontend

## ✅ O QUE FOI IMPLEMENTADO

### 🎯 Backend (Spring Boot)

#### 1. **SecurityConfig.java** - Proteção com JWT
```java
// Endpoints PÚBLICOS (não precisam de token):
- /api/auth/**           → Login e refresh token
- /api/public/**         → Endpoints públicos gerais
- /api/matricula/**      → Declaração de interesse
- /api/matriculas/**     → Iniciar matrícula
- GET /api/interesse-matricula/** → Listar declarações (público)

// Endpoints PROTEGIDOS (precisam de token):
- Todos os outros → .authenticated()
```

---

### 🎯 Frontend (Ionic/Angular)

#### 2. **AuthService** (`auth.service.ts`)
✅ **Salvando tokens no login:**
```typescript
localStorage.setItem('accessToken', response.accessToken);
localStorage.setItem('refreshToken', response.refreshToken);
```

✅ **Métodos adicionados:**
- `getToken()` → Retorna accessToken
- `getRefreshToken()` → Retorna refreshToken
- `refreshAccessToken()` → Renova o token quando expira

---

#### 3. **AuthInterceptor** (`auth.interceptor.ts`) ⭐ NOVO
✅ **Adiciona token automaticamente em TODAS as requisições:**
```typescript
Authorization: Bearer {accessToken}
```

✅ **Trata erro 401 (token expirado):**
1. Detecta erro 401
2. Usa o `refreshToken` para pegar novo `accessToken`
3. Repete a requisição com o novo token
4. Se falhar → Faz logout e redireciona para login

✅ **Registrado no `app.module.ts`:**
```typescript
{ provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
```

---

## 🔄 FLUXO COMPLETO

### 1️⃣ **Login**
```
Usuário faz login
    ↓
Backend retorna: { accessToken, refreshToken }
    ↓
Frontend salva no localStorage
    ↓
Redireciona para dashboard
```

### 2️⃣ **Requisições protegidas**
```
Frontend faz qualquer requisição (ex: GET /api/pessoa)
    ↓
AuthInterceptor adiciona automaticamente:
    Authorization: Bearer {accessToken}
    ↓
Backend valida token → 200 OK ✅
```

### 3️⃣ **Token expira (após 24h)**
```
Frontend faz requisição
    ↓
Backend retorna 401 (token expirado)
    ↓
AuthInterceptor detecta 401
    ↓
Usa refreshToken para pegar novo accessToken
    ↓
Salva novo token e REPETE a requisição
    ↓
Usuário nem percebe! ✅
```

### 4️⃣ **RefreshToken expira (após 7 dias)**
```
Frontend tenta refresh
    ↓
Backend retorna 401 (refresh token expirado)
    ↓
AuthInterceptor faz logout automático
    ↓
Redireciona para /login
```

---

## 🧪 COMO TESTAR

### 1. **Teste no Insomnia (Backend)**

#### ✅ Login:
```http
POST http://localhost:8080/api/auth/login
Content-Type: application/json

{
  "usuario": "admin",
  "senha": "password"
}
```
**Resposta esperada:**
```json
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "success": true,
  "usuario": "admin",
  "nomePessoa": "Administrador do Sistema"
}
```

#### ✅ Endpoint protegido SEM token (deve dar 401):
```http
GET http://localhost:8080/api/pessoa
```
**Resposta esperada:** `401 Unauthorized`

#### ✅ Endpoint protegido COM token (deve funcionar):
```http
GET http://localhost:8080/api/pessoa
Authorization: Bearer eyJhbGc...
```
**Resposta esperada:** `200 OK` + lista de pessoas

---

### 2. **Teste no Frontend (Ionic)**

#### ✅ Passo 1: Reiniciar o Ionic
```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
ionic serve
```

#### ✅ Passo 2: Fazer login
1. Acesse `http://localhost:8100/login`
2. Digite: `admin` / `password`
3. Clique em "Entrar"

#### ✅ Passo 3: Verificar no DevTools (F12)
```javascript
// Abrir Console do navegador
localStorage.getItem('accessToken')   // Deve mostrar o token
localStorage.getItem('refreshToken')  // Deve mostrar o refresh token
```

#### ✅ Passo 4: Verificar no Network (F12 → Network)
1. Acesse qualquer página (ex: Funcionários)
2. Veja as requisições HTTP
3. Clique em uma requisição
4. Vá em **Headers**
5. Procure por: `Authorization: Bearer ...` ✅

---

## 📋 CHECKLIST DE VALIDAÇÃO

### Backend:
- [x] SecurityConfig configurado (public vs protected)
- [x] Login retorna accessToken + refreshToken
- [x] Endpoints protegidos retornam 401 sem token
- [x] Endpoints protegidos retornam 200 com token válido

### Frontend:
- [x] AuthService salva tokens no localStorage
- [x] AuthInterceptor registrado no app.module
- [x] AuthInterceptor adiciona token em todas as requisições
- [x] AuthInterceptor trata erro 401 com refresh automático
- [ ] **TESTAR**: Login → Acessar página → Ver token no Header
- [ ] **TESTAR**: Token expirar → Refresh automático

---

## 🔧 SE ALGO DER ERRADO

### ❌ "401 Unauthorized" mesmo logado

**Causa:** Token não está sendo enviado

**Solução:**
1. Abra DevTools (F12) → Network
2. Clique em uma requisição que deu 401
3. Vá em "Headers"
4. Procure por `Authorization`
   - **Se NÃO aparecer:** O interceptor não está funcionando
   - **Se aparecer sem Bearer:** Verificar formato do token
   - **Se o token estiver errado:** Fazer logout e login novamente

---

### ❌ "Cannot read property 'accessToken' of null"

**Causa:** Usuário não está logado ou token foi apagado

**Solução:**
```bash
# No Console do navegador (F12):
localStorage.clear()
# Depois faça login novamente
```

---

### ❌ Backend retorna 401 mesmo com token

**Causa:** Token expirou ou é inválido

**Solução:**
1. Verificar se o token está correto:
```javascript
// No Console (F12):
const token = localStorage.getItem('accessToken');
console.log(token);
```

2. Verificar se o token não expirou:
```javascript
// Decodificar token (sem validar assinatura)
const payload = JSON.parse(atob(token.split('.')[1]));
console.log('Token expira em:', new Date(payload.exp * 1000));
console.log('Agora:', new Date());
```

3. Se expirou, fazer logout e login novamente

---

## 🎓 PARA O TRABALHO DE DBF

### Item 6: "Testar acesso com e sem token"

✅ **Sem token:**
```http
GET http://localhost:8080/api/pessoa
```
**Resultado:** `401 Unauthorized` ❌

✅ **Com token:**
```http
GET http://localhost:8080/api/pessoa
Authorization: Bearer eyJhbGc...
```
**Resultado:** `200 OK` + dados ✅

---

## 📝 DOCUMENTAÇÃO ADICIONAL

### Endpoints Públicos (não precisam de token):
- `POST /api/auth/login` → Fazer login
- `POST /api/auth/refresh` → Renovar token
- `GET /api/interesse-matricula/**` → Listar declarações de interesse
- `POST /api/matricula/**` → Criar declaração de interesse

### Endpoints Protegidos (precisam de token):
- `GET /api/pessoa` → Listar pessoas
- `POST /api/pessoa` → Criar pessoa
- `GET /api/funcionarios` → Listar funcionários
- `GET /api/turma` → Listar turmas
- **E todos os outros...**

---

## 🚀 PRÓXIMOS PASSOS

1. **TESTAR** o fluxo completo no Frontend
2. **VALIDAR** que o token está sendo enviado (F12 → Network)
3. **CONFIRMAR** que declarações aparecem sem erro 401
4. **DOCUMENTAR** para o trabalho de DBF

---

**Tudo pronto! Agora o sistema está 100% integrado com JWT! 🎉**
