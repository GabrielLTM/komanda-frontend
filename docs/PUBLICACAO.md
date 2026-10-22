# Publicação — Vercel e Supabase

## Componentes

| Parte | Serviço | Repositório/configuração |
|---|---|---|
| Frontend React/Vite | Vercel | `GabrielLTM/komanda-frontend` |
| API Node.js/Express | Vercel | `4nnahermes/komanda-backend` — publicação pela responsável do repositório |
| Banco PostgreSQL | Supabase | conexão configurada somente no backend |

Este guia descreve a configuração. Criar o repositório não publica automaticamente a aplicação.

## Backend na Vercel

A responsável pelo backend deve importar o repositório da API na Vercel após revisar e incorporar as alterações necessárias. A Vercel suporta Express como função Node.js; a entrada precisa exportar a aplicação no formato esperado e inicializar a conexão com o banco antes das rotas que precisam dele. Consulte as instruções da versão do backend que será publicada.

Configure `DATABASE_URL` no painel da Vercel com a conexão PostgreSQL do Supabase. Use a conexão adequada à execução serverless, copiada do painel do Supabase, com o pool configurado no backend. Não coloque essa conexão no frontend ou no Git. Não é necessário criar outro banco.

As migrations precisam ser aplicadas pelo fluxo controlado do backend antes de validar os cadastros. Não as execute no banco da equipe apenas para testar a importação do frontend.

Após publicar a API, confira `https://SEU-BACKEND.vercel.app/health`.

## Frontend na Vercel

Importe `GabrielLTM/komanda-frontend` e selecione Vite:

- Diretório raiz: raiz do repositório.
- Instalação: `npm ci`.
- Build: `npm run build`.
- Diretório de saída: `dist`.
- Variável de ambiente: `VITE_API_URL=https://SEU-BACKEND.vercel.app/api`.

A URL inclui `/api`. Variáveis `VITE_` são incorporadas ao frontend durante o build; configure o endereço antes de publicar e refaça o deploy quando ele mudar. O proxy do Vite é usado somente no desenvolvimento.

Na versão importada, a verificação de saúde usa `/health` na própria origem. A integração entre domínios separados precisa ajustar essa verificação para a URL do backend antes da homologação. Confira também as origens permitidas no CORS da API.

## Verificação depois da publicação

Abra a URL pública do frontend e confirme se categorias e produtos vieram da API. Crie ou edite um dado de teste autorizado, recarregue e confira a persistência. Dados de demonstração da versão original não comprovam conexão com o Supabase.

## Referências

- [Vite na Vercel](https://vercel.com/docs/frameworks/frontend/vite).
- [Express na Vercel](https://vercel.com/docs/frameworks/backend/express).
- [Conexão PostgreSQL do Supabase](https://supabase.com/docs/guides/database/connecting-to-postgres).
