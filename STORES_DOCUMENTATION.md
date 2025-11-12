# Sistema de Gerenciamento de Lojas

## Visão Geral

Este módulo implementa um CRUD completo para gerenciamento de lojas associadas a mapas, permitindo que o responsável pela criação do mapa cadastre e gerencie lojas com suas informações detalhadas e localização no mapa.

## Regras de Negócio

1. **Associação com Categoria**: Toda loja deve estar associada a uma categoria
2. **Identificação Única**: Pode haver 2 lojas com nomes iguais, desde que se diferenciem pelo ID
3. **Campos Obrigatórios**:
   - Nome
   - Andar
   - Categoria
   - Horário de funcionamento
   - Logo/ícone
   - Descrição
4. **Vinculação com Mapa**: Cada loja criada é vinculada a um espaço de loja no mapa e possui localização

## Categorias Disponíveis

- Alimentação (`food`)
- Vestuário (`clothing`)
- Eletrônicos (`electronics`)
- Joalheria (`jewelry`)
- Livros (`books`)
- Esportes (`sports`)
- Casa e Decoração (`home`)
- Beleza e Cosméticos (`beauty`)
- Brinquedos (`toys`)
- Serviços (`services`)
- Outros (`other`)

## Backend (NestJS)

### Estrutura de Arquivos

```
src/
├── model/
│   └── store.model.ts          # Schema MongoDB da loja
├── stores/
│   ├── dto/
│   │   ├── create-store.dto.ts  # DTO de criação
│   │   ├── update-store.dto.ts  # DTO de atualização
│   │   └── find-stores.dto.ts   # DTO de busca/filtros
│   ├── stores.controller.ts     # Controller com endpoints REST
│   ├── stores.service.ts        # Service com lógica de negócio
│   └── stores.module.ts         # Module do NestJS
└── app.module.ts                # Importação do StoresModule
```

### Endpoints da API

#### POST /stores
Cria uma nova loja

**Body:**
```json
{
  "name": "Loja ABC",
  "floor": "1º Andar",
  "category": "clothing",
  "openingHours": "Seg-Sex: 9h-18h",
  "logo": "https://example.com/logo.png",
  "description": "Loja de roupas femininas",
  "mapId": "map-id-123",
  "featureId": "feature-id-456",
  "location": {
    "x": 100,
    "y": 200,
    "width": 50,
    "height": 50
  },
  "phone": "(11) 99999-9999",
  "email": "contato@lojaabc.com",
  "website": "https://lojaabc.com"
}
```

#### GET /stores
Lista todas as lojas com filtros opcionais

**Query Parameters:**
- `query`: Busca por nome ou descrição
- `mapId`: Filtrar por ID do mapa
- `category`: Filtrar por categoria
- `floor`: Filtrar por andar
- `page`: Número da página (default: 1)
- `limit`: Itens por página (default: 10)

#### GET /stores/:id
Retorna uma loja específica por ID

#### GET /stores/map/:mapId
Retorna todas as lojas de um mapa específico

#### PATCH /stores/:id
Atualiza uma loja existente

**Body:** Campos opcionais para atualização
```json
{
  "name": "Novo Nome",
  "openingHours": "Seg-Dom: 10h-22h"
}
```

#### DELETE /stores/:id
Remove uma loja

### Validações e Permissões

- Todos os endpoints requerem autenticação (JWT)
- Apenas o criador da loja pode editá-la ou excluí-la
- Validação de campos obrigatórios via class-validator
- Validação de categorias válidas

## Frontend (React + TypeScript)

### Estrutura de Arquivos

```
src/
├── models/
│   └── store.model.ts           # Interfaces TypeScript
├── services/
│   └── store.ts                 # Service com chamadas à API
├── queries/
│   └── store.query.ts           # React Query hooks de consulta
├── mutation/
│   └── store.mutation.ts        # React Query hooks de mutação
├── components/
│   └── store/
│       ├── StoreForm.tsx        # Formulário de criação/edição
│       ├── StoreList.tsx        # Lista de lojas
│       └── index.ts
├── pages/
│   └── stores/
│       ├── StoresPage.tsx       # Página principal de gerenciamento
│       └── index.ts
└── routes/
    └── index.tsx                # Configuração de rotas
```

### Componentes Principais

#### StoreForm
Formulário completo para criar ou editar lojas com todos os campos obrigatórios e opcionais.

**Props:**
- `store?`: Loja a ser editada (opcional)
- `mapId`: ID do mapa
- `featureId`: ID do feature no mapa
- `location`: Localização no mapa
- `onSubmit`: Callback ao submeter
- `onCancel`: Callback ao cancelar
- `isLoading?`: Estado de carregamento

#### StoreList
Lista de lojas com cards visuais mostrando informações principais.

**Props:**
- `stores`: Array de lojas
- `onEdit`: Callback para editar
- `onDelete`: Callback para excluir
- `isLoading?`: Estado de carregamento

#### StoresPage
Página completa de gerenciamento com lista e modal de criação/edição.

### Hooks Disponíveis

#### Queries
```typescript
// Buscar lojas com filtros
const { data, isLoading } = useStoresQuery({ 
  mapId: "map-id", 
  category: "food" 
});

// Buscar uma loja específica
const { data: store } = useStoreQuery("store-id");

// Buscar lojas de um mapa
const { data: stores } = useStoresByMapQuery("map-id");
```

#### Mutations
```typescript
// Criar loja
const createMutation = useCreateStoreMutation();
createMutation.mutate(storeData);

// Atualizar loja
const updateMutation = useUpdateStoreMutation();
updateMutation.mutate({ id: "store-id", data: updates });

// Excluir loja
const deleteMutation = useDeleteStoreMutation();
deleteMutation.mutate("store-id");
```

### Rota

```
/stores/:mapId - Página de gerenciamento de lojas do mapa
```

## Fluxo de Uso

1. **Acessar Página de Lojas**: Navegar para `/stores/:mapId`
2. **Criar Nova Loja**: 
   - Clicar em "+ Nova Loja"
   - Preencher formulário com todos os campos obrigatórios
   - Selecionar localização no mapa (TODO: integração com mapa)
   - Submeter formulário
3. **Editar Loja**:
   - Clicar em "Editar" no card da loja
   - Modificar campos desejados
   - Salvar alterações
4. **Excluir Loja**:
   - Clicar em "Excluir" no card da loja
   - Confirmar exclusão

## Próximos Passos / TODOs

- [ ] Integrar seleção de feature/localização com o componente de mapa
- [ ] Adicionar upload de imagens para logos
- [ ] Implementar filtros visuais na página de listagem
- [ ] Adicionar paginação visual na lista
- [ ] Criar visualização de loja no mapa público
- [ ] Adicionar busca em tempo real
- [ ] Implementar ordenação da lista
- [ ] Adicionar exportação de dados das lojas

## Exemplo de Integração

Para adicionar um link de gerenciamento de lojas na página de detalhes do mapa:

```tsx
import { useNavigate } from "react-router-dom";

function MapDetailPage({ mapId }) {
  const navigate = useNavigate();
  
  return (
    <button onClick={() => navigate(`/stores/${mapId}`)}>
      Gerenciar Lojas
    </button>
  );
}
```

## Testes

### Backend
```bash
# Executar testes
npm run test

# Testar endpoint manualmente
curl -X POST http://localhost:3000/stores \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name":"Test Store","floor":"1","category":"food",...}'
```

### Frontend
```bash
# Executar aplicação
npm run dev

# Acessar página de lojas
http://localhost:5173/stores/<map-id>
```
