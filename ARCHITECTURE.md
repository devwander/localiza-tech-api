# Documento de Arquitetura – Localiza Tech API

## 1. Visão Geral

A Localiza Tech API é um backend em **NestJS** que oferece serviços de autenticação de usuários, gerenciamento de usuários e gerenciamento de mapas interativos (geo-like) compostos por elementos estruturados. A solução integra **PostgreSQL (via TypeORM)** para persistência relacional de usuários e **MongoDB (via Mongoose)** para armazenamento de documentos de mapas, aproveitando a flexibilidade de documentos JSON para estruturas dinâmicas de features.

## 2. Objetivos Arquiteturais

- Separar responsabilidades por domínio (Auth, Users, Maps).
- Adotar persistência poliglota: relacional (usuários) + documental (mapas).
- Garantir segurança baseada em **JWT** (Bearer Token) com escopo user-centric.
- Facilitar extensibilidade para futuras features (share de mapas, versionamento, roles, etc.).
- Manter simplicidade operacional inicial (monólito modular) com possibilidade de evolução para microsserviços.

## 3. Stack Técnica

| Camada           | Tecnologia                             |
| ---------------- | -------------------------------------- |
| Runtime          | Node.js / TypeScript                   |
| Framework        | NestJS 11                              |
| ORM Relacional   | TypeORM                                |
| Banco Relacional | PostgreSQL                             |
| ODM Documental   | Mongoose                               |
| Banco Documental | MongoDB                                |
| Autenticação     | Passport + JWT                         |
| Criptografia     | bcrypt (via `HashService`)             |
| Configuração     | @nestjs/config + variáveis de ambiente |
| Testes           | Jest (configurado)                     |
| Migrações        | TypeORM CLI                            |

## 4. Visão C4 (Resumida)

### Nível 1 – Contexto

Usuários (clientes/front-end) interagem com a API para autenticar-se, gerenciar perfis e criar/mapear ambientes (ex: eventos, feiras). A API conecta-se a PostgreSQL (Users) e MongoDB (Maps).

### Nível 2 – Contêineres

- API Monolítica NestJS
  - Módulo Auth
  - Módulo Users
  - Módulo Maps
- PostgreSQL (persistência relacional)
- MongoDB (mapas e features flexíveis)

### Nível 3 – Componentes Principais

- AuthController / AuthService: fluxo de login & signup.
- JwtStrategy / JwtAuthGuard: validação do token e injeção de contexto `req.user`.
- UsersController / UsersService: CRUD protegido de usuários.
- MapsController / MapsService: CRUD, busca e manipulação de elementos (privado).
- PublicMapsController: leitura pública de um mapa.
- HashService: abstração de hashing.

(Evolução futura: adicionar Rate Limiter, Auditoria, Notificações, RBAC.)

## 5. Módulos

### AppModule

Orquestra imports globais: Config, TypeORM (assíncrono), Mongoose, Users, Hash, Auth, Maps.

### AuthModule

- Registra `JwtModule` com secret dinâmico.
- Estratégia JWT injeta `userId` e `email` após validação.
- Não há refresh token implementado (gap de segurança / escalabilidade).

### UsersModule

- Opera sobre entidade `User` (PostgreSQL).
- Funções: criação segura (hash), listagem paginada, busca, atualização e remoção.
- Filtros: nome via ILike; ordenações distintas.

### MapsModule

- Esquema `Map` (Mongoose) com features flexíveis (array de objetos Geo-like + metadata).
- Suporta escopo por usuário (`userId`).
- Public endpoint para leitura: `GET /maps/public/:id`.

### Common / Hash

- Encapsula bcrypt para hashing e comparação.

## 6. Modelo de Dados

### User (PostgreSQL – Tabela `users`)

- id (uuid, PK)
- name (varchar, obrigatório)
- email (varchar, único, obrigatório)
- password (hash bcrypt)
- createdAt / updatedAt (timestamps)

Constraints: `UNIQUE(email)`. Nenhum índice adicional definido (sugerido: índice em `created_at` para ordenações por recência).

### Map (MongoDB – Collection `maps`)

Campos:

- name (string)
- type (default: `FeatureCollection`)
- metadata { author, description?, version?, dimensions { width, height, unit } }
- features: Array<{ type, id?, geometry { type, coordinates }, properties { type, name, parentId?, category?, color?, exhibitor?, selected?, ... } }>
- userId (string de referência lógica ao `User.id`)

Observações:

- Não há referência formal (foreign key). Integridade é lógica.
- Recomenda-se índice em `{ userId: 1, name: 1 }` e em `createdAt`.

## 7. Fluxos de Uso

### 7.1 Autenticação

1. Usuário chama `POST /auth/signup` com (name, email, password).
2. `UsersService.create` valida duplicidade e aplica hash.
3. `AuthService.login` gera JWT com payload `{ email, sub: { id } }`.
4. Retorno: `{ token: { type: 'Bearer', token: <jwt> } }`.
5. Requisições autenticadas enviam `Authorization: Bearer <jwt>`.

Login (`POST /auth/signin`): valida credenciais e retorna novo token.

### 7.2 CRUD de Usuários

- Protegido via `JwtAuthGuard`.
- Operações: listar paginado, obter por id, atualizar campos (sem re-hash automático se password for alterada – gap), remover.

### 7.3 CRUD de Mapas e Elementos

- Criação, listagem, detalhe, atualização e remoção restritos ao dono (userId extraído do token).
- Elementos (features) adicionados ou manipulados integram-se ao array `features` (operações em memória + persistência). Pode gerar condições de concorrência se múltiplas atualizações simultâneas ocorrerem (falta de versionamento otimista).
- Busca de elementos por substring em `name` ou `id`.
- Leitura pública sem autenticação: `GET /maps/public/:id`.

## 8. Endpoints

### Auth

| Método | Rota         | Autenticação | Descrição                         |
| ------ | ------------ | ------------ | --------------------------------- |
| POST   | /auth/signup | Não          | Cria usuário e retorna token      |
| POST   | /auth/signin | Não          | Autentica usuário e retorna token |

### Users (Protegido)

| Método | Rota       | Descrição                                    |
| ------ | ---------- | -------------------------------------------- |
| GET    | /users     | Lista usuários (query, paginação, ordenação) |
| GET    | /users/:id | Detalhe                                      |
| PATCH  | /users/:id | Atualiza parcial                             |
| DELETE | /users/:id | Remove                                       |

### Maps (Protegido)

| Método | Rota                          | Descrição                        |
| ------ | ----------------------------- | -------------------------------- |
| POST   | /maps                         | Cria mapa                        |
| GET    | /maps                         | Lista mapas do usuário           |
| GET    | /maps/:id                     | Detalhe mapa                     |
| PATCH  | /maps/:id                     | Atualiza mapa                    |
| DELETE | /maps/:id                     | Remove mapa                      |
| GET    | /maps/:id/elements            | Busca elementos (query opcional) |
| POST   | /maps/:id/elements            | Adiciona elemento                |
| PATCH  | /maps/:id/elements/:elementId | Atualiza elemento                |
| DELETE | /maps/:id/elements/:elementId | Remove elemento                  |

### Maps Público

| Método | Rota             | Descrição                     |
| ------ | ---------------- | ----------------------------- |
| GET    | /maps/public/:id | Obtém mapa público (sem auth) |

## 9. Segurança

- Autenticação: JWT (expiração 1d) – sem refresh/blacklist (risco em revogação).
- Hash: bcrypt com salt rounds = 10.
- Não há sanitização de entrada explícita além de validação DTO (DTOs usam class-validator?). Observação: DTOs presentes mas não exibidos aqui — garantir `ValidationPipe` global futuramente.
- Falta de tratamento uniforme de erros (alguns `throw new Error` vs exceções Nest adequadas). Sugere-se filtros globais.
- Payload do token carrega `sub.id` (objeto). Simplificar para `sub: user.id` reduziria complexidade.

## 10. Configuração e Ambientes

Variáveis esperadas (implícitas pelo código):

- DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
- MONGODB_URI (opcional; fallback local)
- JWT_SECRET (OBRIGATÓRIA – código lança erro se ausente)

Sugestão: adicionar `APP_PORT`, `NODE_ENV`, `LOG_LEVEL`.

## 11. Migrações (TypeORM)

Scripts NPM:

- `migration:generate` – gera arquivo em `src/migrations`.
- `migration:run` – aplica.
- `migration:revert` – desfaz.
- Sincronização desabilitada (`synchronize: false`).

Recomendado: pipeline CI para verificação de migrações pendentes.

## 12. Estratégia de Erros

Situação atual:

- Uso de `UnauthorizedException`, `NotFoundException` consistente em parte.
- Uso de `throw new Error` em AuthController (melhor substituir por `BadRequestException`).
  Proposta:
- Implementar filtro global (`HttpExceptionFilter`).
- Padrão de payload: `{ timestamp, path, correlationId, error: { code, message, details } }`.

## 13. Observabilidade

Não implementado:

- Logs estruturados (padrão console). Sugere-se `pino` ou `winston` + correlation ID.
- Métricas: adicionar `/metrics` (Prometheus) + health checks (`@nestjs/terminus`).
- Tracing distribuído (OpenTelemetry) – futuro se extrair microsserviços.

## 14. Performance & Escalabilidade

- Map features manipuladas em memória antes de update – pode ser gargalo para listas grandes.
- Ausência de paginação em `features` (potencial risco). Sugestão: armazenar elementos em subcoleção ou paginar.
- Índices ausentes em Mongo (userId + createdAt) e Postgres (email já indexado via unique). Adicionar índices recomendados.
- Escalabilidade horizontal: Stateless (JWT) – compatível com múltiplas instâncias. Necessário gerenciar variáveis e conexões de forma pool-aware.

## 15. Testes

Configuração Jest presente, mas não há arquivos `*.spec.ts` no snapshot analisado. Recomendações:

- Auth e Users (login, criação, duplicidade de email, senha inválida).
- Maps (CRUD + elementos + edge cases de inexistência).
- Testes de integração com bancos (usar containers efêmeros / memory server para Mongo).

## 16. Riscos & Gaps

| Risco                                  | Impacto                                                       | Mitigação                                                                     |
| -------------------------------------- | ------------------------------------------------------------- | ----------------------------------------------------------------------------- |
| Falta de refresh token                 | Logout forçado após expiração ou tokens long-living inseguros | Implementar fluxo refresh + revogação                                         |
| Conflitos em atualização de `features` | Perda de alterações concorrentes                              | Usar version key / optimistic lock ou operações atômicas (positional updates) |
| `throw new Error` em controllers       | Respostas inconsistentes                                      | Substituir por exceções HTTP                                                  |
| Falta de índices                       | Query lenta em escala                                         | Adicionar índices (userId, createdAt, name)                                   |
| Exposição de estrutura interna de Map  | Potencial vazamento de dados sensíveis futuros                | Implementar DTO de saída / transformação                                      |

## 17. Backlog de Evolução (Sugestões)

1. Refresh token + revogação / logout.
2. Roles & Permissions (admin, user).
3. Rate limiting por IP/usuário.
4. Versionamento e histórico de mapas.
5. Paginação/filtragem de `features` (ou subdocumentos pagináveis).
6. Webhooks / eventos (ex: atualização de mapa) ou WebSocket para colaboração em tempo real.
7. Documentação OpenAPI (Swagger) automatizada.
8. Monitoramento (Prometheus + Grafana) + health checks.
9. Hardening de segurança (Helmet, CORS configurável, audit log).
10. CI/CD com lint, test, migrate, build.

## 18. Decisões Arquiteturais (ADR Resumidas)

| ID      | Decisão                                   | Status     | Justificativa                                           |
| ------- | ----------------------------------------- | ---------- | ------------------------------------------------------- |
| ADR-001 | Monólito modular NestJS                   | Aceita     | Rapidez de entrega inicial e simplicidade               |
| ADR-002 | Persistência poliglota (Postgres + Mongo) | Aceita     | Diferentes naturezas de dados (estruturado vs flexível) |
| ADR-003 | JWT stateless                             | Aceita     | Escalabilidade simples sem sessão compartilhada         |
| ADR-004 | Hash com bcrypt                           | Aceita     | Padrão de mercado para senhas                           |
| ADR-005 | Desligar synchronize TypeORM              | Aceita     | Controle explícito via migrações                        |
| ADR-006 | Não usar refresh token inicial            | Temporária | Reduz tempo inicial; reavaliar segurança                |

## 19. Guia de Execução

1. Definir variáveis `.env` (DB\_\* / MONGODB_URI / JWT_SECRET).
2. Executar migrações: `npm run migration:run`.
3. Rodar aplicação: `npm run start:dev`.
4. Testar endpoints Auth e obter token.
5. Usar token nas rotas protegidas (header Authorization).

## 20. Conclusão

A arquitetura atual oferece base sólida e clara separação de domínios, porém requer incrementos em segurança operacional, observabilidade e robustez concorrente para suportar crescimento. Este documento deve ser mantido vivo acompanhando cada mudança significativa.

---

_Última atualização: 2025-10-08_
