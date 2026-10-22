# Publicação — Vercel e MongoDB Atlas

| Parte | Serviço | Endereço |
|---|---|---|
| Frontend React/Vite | Vercel | https://komanda-frontend.vercel.app |
| API Express/Prisma | Vercel | https://komanda-backend.vercel.app |
| Banco MongoDB | Atlas | conexão secreta somente no backend |

Repositórios próprios: `GabrielLTM/komanda-frontend` e `GabrielLTM/komanda-backend`. A cópia do backend foi migrada para Prisma/MongoDB; o backend original da equipe e o Supabase não foram modificados. O histórico e a autoria original foram preservados.

## Configuração do frontend

Projeto Vercel `komanda-frontend`, raiz do repositório, preset Vite, instalação `npm ci`, build `npm run build`, saída `dist`. Variável pública em Production:

```text
VITE_API_URL=https://komanda-backend.vercel.app/api
```

O prefixo `/api` é obrigatório. Essa variável é incorporada ao build; após alterá-la, publicar novamente. O adaptador deriva `/health` da origem da API. O proxy Vite só é usado no desenvolvimento; `API_PROXY_TARGET` permite escolher a API local.

## Configuração do backend

Projeto Vercel `komanda-backend`, Node 24 e Express. `DATABASE_URL` contém a conexão Atlas com nome do banco `komanda`, somente no backend. Ela nunca deve ser copiada para variáveis VITE_, código, documentação ou Git.

O schema e os índices são preparados explicitamente com `prisma db push`, conforme o guia do backend. A preparação inicial já foi realizada em 22/10/2026; depois o build foi restaurado para `npm run build`, sem mudanças automáticas no banco. Novas alterações de schema devem seguir o procedimento controlado do backend, sem reset ou aceitação automática de perda de dados.

## Verificação realizada

Em 22/10/2026, `/health` da API retornou 200. Foram criados uma categoria e um produto pela interface pública, recuperados após recarga e conferidos na API. Somente os dois registros de verificação foram removidos ao final. Categorias, produtos, ingredientes/adicionais, bairros e motoboys usam a API; pedidos, quadro, estoque, caixa e acerto continuam demonstrativos.

## Referências

- [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite).
- [Express na Vercel](https://vercel.com/docs/frameworks/backend/express).
- [Prisma com MongoDB](https://www.prisma.io/docs/orm/v6/overview/databases/mongodb).
