# Guia de Troubleshooting - Erro 400 ao Criar Loja

## Problema
Erro 400 (Bad Request) ao tentar criar uma loja.

## Alterações Realizadas para Corrigir

### 1. **DTO de Criação Melhorado** (`create-store.dto.ts`)
- ✅ Adicionada classe `LocationDto` para validação adequada do objeto location
- ✅ Campo `logo` agora é **opcional** (pode estar vazio)
- ✅ Validação de tipos numéricos para coordenadas (x, y, width, height)

### 2. **Model Atualizado** (`store.model.ts`)
- ✅ Campo `logo` agora é opcional (`required: false`)
- ✅ Permite criar loja sem logo (usuário pode adicionar depois)

### 3. **ValidationPipe Configurado** (`main.ts`)
- ✅ `transform: true` - Transforma objetos JSON em instâncias de classe
- ✅ `transformOptions.enableImplicitConversion: true` - Converte tipos automaticamente
- ✅ `whitelist: true` - Remove propriedades não definidas no DTO

### 4. **Melhor Tratamento de Erros** (Frontend)
- ✅ Validação prévia dos campos obrigatórios
- ✅ Logs detalhados no console
- ✅ Mensagens de erro mais descritivas
- ✅ Garante que `logo` nunca seja `undefined`

### 5. **Logs de Debug** (Backend)
- ✅ Console.log mostra exatamente o que está sendo recebido
- ✅ Facilita identificar qual campo está causando problema

## Como Testar

### 1. Restart do Backend
```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
cd c:\api-localiza\localiza-tech-api
npm run start:dev
```

### 2. Teste no Frontend
1. Acesse a página de lojas
2. Clique em "+ Nova Loja"
3. Preencha TODOS os campos obrigatórios:
   - ✅ Nome
   - ✅ Andar
   - ✅ Categoria
   - ✅ Horário de Funcionamento
   - ✅ Descrição
   - ⚠️ Logo (OPCIONAL - pode deixar em branco)
4. Clique em "Criar"

### 3. Verifique os Logs

**No Console do Navegador:**
```
Enviando dados: {
  name: "...",
  floor: "...",
  category: "...",
  openingHours: "...",
  description: "...",
  logo: "",
  mapId: "...",
  featureId: "...",
  location: { x: 0, y: 0 }
}
```

**No Terminal do Backend:**
```
=== DEBUG CREATE STORE ===
Dados recebidos: {
  "name": "...",
  "floor": "...",
  ...
}
User ID: ...
========================
```

## Possíveis Causas do Erro 400

### 1. ✅ Campo `location` inválido
**Solução:** Agora validado com `LocationDto` e conversão automática de tipos

### 2. ✅ Campo `logo` vazio
**Solução:** Campo agora é opcional

### 3. ⚠️ Categoria inválida
**Verifique:** A categoria deve ser uma das seguintes:
- `food`, `clothing`, `electronics`, `jewelry`, `books`, `sports`, `home`, `beauty`, `toys`, `services`, `other`

### 4. ⚠️ Token JWT inválido
**Verifique:** 
```javascript
console.log("Token:", sessionStorage.getItem("token"));
```

### 5. ⚠️ Tipos de dados incorretos
**Agora corrigido:** ValidationPipe com `enableImplicitConversion` converte automaticamente

## Script de Teste Manual

Abra o console do navegador e execute:

```javascript
// Teste 1: Verificar token
console.log("Token:", sessionStorage.getItem("token"));

// Teste 2: Criar loja sem logo
const testData = {
  name: "Loja Teste",
  floor: "Térreo",
  category: "food",
  openingHours: "9h-18h",
  logo: "", // Vazio é OK agora
  description: "Teste de criação",
  mapId: "SEU_MAP_ID_AQUI", // Substitua
  featureId: "feature-123",
  location: { x: 100, y: 200 }
};

fetch("http://localhost:3000/stores", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${sessionStorage.getItem("token")}`
  },
  credentials: "include",
  body: JSON.stringify(testData)
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
```

## Se o Erro Persistir

1. **Verifique o terminal do backend** - deve mostrar exatamente qual campo está falhando
2. **Copie a mensagem completa do erro** do console do navegador
3. **Verifique se o mapa existe** com o `mapId` fornecido
4. **Teste com dados mínimos** primeiro, depois adicione campos opcionais

## Exemplo de Dados Válidos

```json
{
  "name": "Loja ABC",
  "floor": "1º Andar",
  "category": "clothing",
  "openingHours": "Seg-Sex: 9h-18h",
  "description": "Loja de roupas",
  "logo": "",
  "mapId": "673fa1234567890abcdef123",
  "featureId": "feature-001",
  "location": {
    "x": 100,
    "y": 200,
    "width": 50,
    "height": 50
  },
  "phone": "(11) 99999-9999",
  "email": "contato@loja.com"
}
```

## Próximos Passos

Após reiniciar o backend:
1. Limpe o cache do navegador (Ctrl+Shift+Del)
2. Faça logout e login novamente
3. Tente criar uma loja novamente
4. Verifique os logs no console e no terminal

Se continuar com erro, **copie e cole aqui**:
- A mensagem completa do console do navegador
- Os logs do terminal do backend
- Os dados que você está tentando enviar
