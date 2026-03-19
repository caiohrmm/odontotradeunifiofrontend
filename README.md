# OdontoTrade UNIFIO - Frontend

Este é o frontend web do OdontoTrade UNIFIO. Ele é um monorepo com:

- `apps/web`: aplicação Next.js (rotas, páginas e UI)
- `packages/ui`: pacote de componentes/estilos (shadcn/ui)

O frontend consome um backend REST que fica em `C:\\Users\\caiohrm\\Desktop\\OdontoTradeUNIFIO` (via URL base configurada em `NEXT_PUBLIC_API_URL`).

## Pré-requisitos

- Node.js `>= 20`
- `pnpm` (recomendado para instalar/rodar o monorepo)
- O backend precisa estar acessível via HTTP(S) a partir do navegador.

## Configurando o backend

O frontend monta as requisições assim:

`NEXT_PUBLIC_API_URL` + `path` (por exemplo, `"/api/v1/auth/login"`)

No código, a variável usada é `NEXT_PUBLIC_API_URL` (com fallback para `http://localhost:8080`).

Crie um arquivo `.env.local` em `apps/web`:

```bash
# apps/web/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8080
```

### Ajuste para o seu ambiente (Windows)

O fato do backend estar em `C:\\Users\\caiohrm\\Desktop\\OdontoTradeUNIFIO` não muda a URL HTTP. O que importa é a porta e o protocolo em que o backend está escutando (ex.: `http://localhost:8080`, `http://127.0.0.1:5000`, etc.).

Se seu backend estiver em outra porta, ajuste o `NEXT_PUBLIC_API_URL` de acordo.

## Contrato de API (respostas esperadas)

As funções em `apps/web/lib/api.ts` esperam que o backend responda no formato:

```json
{
  "success": true,
  "message": "opcional",
  "data": { }
}
```

Quando `success`/status HTTP não é `ok`, o frontend lança um erro usando `message`.

## Autenticação

- Login/registro chamam endpoints do backend.
- O token retornado é salvo no `localStorage` e também em um cookie `auth_token` para permitir proteção de rotas via `middleware`.
- Nas requisições autenticadas (cliente), o frontend envia:
  - `Authorization: Bearer <token>`

Rotas públicas (sem exigir login):

- `/login`
- `/register`

## Endpoints usados pelo frontend

Base prefixo: `/api/v1`

- `POST /api/v1/auth/login`
- `POST /api/v1/auth/register`
- `GET /api/v1/categories`
- `GET /api/v1/listings?status=&sellerId=&categoryId=&search=&page=&size=`
- `GET /api/v1/listings/:id`
- `POST /api/v1/listings` (criar anúncio)
- `PUT /api/v1/listings/:id` (editar anúncio)
- `DELETE /api/v1/listings/:id` (excluir anúncio)
- `GET /api/v1/users/me` (dados do usuário autenticado)
- `PUT /api/v1/users/me` (atualizar perfil)
- `PATCH /api/v1/users/me/password` (alterar senha)
- `POST /api/v1/upload` (upload de imagem)

## Upload de imagens

O upload é `multipart/form-data` no endpoint:

- `POST /api/v1/upload`

Campo enviado no form:

- `file` (imagem)

A resposta esperada contém uma URL, por exemplo:

```json
{ "success": true, "data": { "url": "https://..." } }
```

Em seguida, essas `imageUrls` são enviadas junto do `POST/PUT /api/v1/listings`.

## Como rodar (dev)

No diretório raiz do monorepo (`odontotradeunifiofrontend`):

```bash
pnpm install
pnpm dev
```

Isso deve iniciar o app de `apps/web` (Next.js).

## Rotas principais (frontend)

- `/` : listagem com filtros (categorias, status, paginação)
- `/login` e `/register`
- `/listings/new` : criar anúncio
- `/listings/[id]` : detalhes do anúncio
- `/listings/[id]/edit` : editar anúncio
- `/profile` : meus anúncios
- `/profile/edit` : editar perfil e alterar senha
- `/users/[id]` : página do usuário (dependendo do backend)

## Dicas / Troubleshooting comuns

- `CORS` no navegador: como algumas chamadas acontecem no client (`apiFetch`), o backend deve liberar a origem do frontend (ex.: `http://localhost:3000` ou a porta que você estiver usando).
- `401` ao acessar páginas protegidas: verifique se o backend emite um token válido em `/api/v1/auth/login` e se a resposta bate com o contrato `{ success, data }`.
- API apontando para lugar errado: confirme se `NEXT_PUBLIC_API_URL` está correto e acessível via navegador.

## Referências no projeto

- Configuração de API: `apps/web/lib/api.ts`
- Proteção de rotas: `apps/web/middleware.ts`
- Auth: `apps/web/contexts/auth-context.tsx`
