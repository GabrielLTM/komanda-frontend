# Contribuição

1. Atualize a `main` antes de começar.
2. Crie uma branch para a alteração. Exemplo: `git switch -c codex/integracao-motoboys`.
3. Faça commits pequenos, com mensagens que expliquem a mudança.
4. Execute `npm ci` e `npm run build`.
5. Abra um pull request descrevendo o comportamento alterado e como foi verificado.
6. Peça revisão de outro integrante antes de incorporar a alteração à `main`.

## O que pertence ao repositório

Código e recursos do frontend, arquivo de lock, documentação e configurações de desenvolvimento sem credenciais.

Não inclua `node_modules/`, `dist/`, `.env`, credenciais do Supabase ou a pasta `komanda-backend/`. O arquivo `.env.example` deve conter apenas exemplos públicos.

## Integração

Combine mudanças de contrato com a dupla do backend. Não apresente gravação local ou dados de demonstração como persistência no servidor. Ao alterar um cadastro, verifique criação, edição, consulta após recarregar e mensagem de erro.

## Autoria

Preserve os créditos do código original e identifique nas descrições quais mudanças são organização do repositório e quais alteram as funcionalidades.
