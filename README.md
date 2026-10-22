# Komanda — Frontend

Aplicação de atendimento e gestão da **Mau Mau Lanches**, desenvolvida com React e Vite para o projeto Komanda.

Este repositório reúne **somente o frontend** do trabalho de [Diego Rosa](https://github.com/diego-rosa), originalmente publicado em [projeto_mau_mau_lanches_teste](https://github.com/diego-rosa/projeto_mau_mau_lanches_teste). As telas, os estilos e a integração existente foram preservados. O histórico importado contém apenas arquivos do frontend; também foram mantidos os ajustes locais existentes na cópia fornecida. Veja [a origem da importação](docs/ORIGEM.md).

O backend é mantido separadamente em [komanda-backend](https://github.com/GabrielLTM/komanda-backend).

## Executar localmente

Pré-requisitos: Node.js 22 e npm. Com nvm, use `nvm use`.

```sh
git clone https://github.com/GabrielLTM/komanda-frontend.git
cd komanda-frontend
npm ci
cp .env.example .env
npm run dev
```

Abra o endereço informado pelo Vite, normalmente `http://localhost:5173`. Para utilizar a integração existente, execute o backend separadamente na porta 3000. O proxy de desenvolvimento encaminha `/api` e `/health` para ele.

## Comandos

| Comando | Finalidade |
|---|---|
| `npm ci` | Instalar as dependências exatas do arquivo de lock |
| `npm run dev` | Iniciar o frontend em desenvolvimento |
| `npm run build` | Gerar a versão de produção em `dist/` |
| `npm run preview` | Conferir localmente o build gerado |

## Organização

```text
src/
  components/      telas e componentes da aplicação
  services/api.js  chamadas para o backend
  data/            dados de demonstração da versão original
  utils/           formatação e funções auxiliares
  App.jsx          composição da aplicação
  main.jsx         entrada do React
  index.css        estilos da aplicação
public/assets/     fontes e imagens usadas pelas telas
docs/              origem do código e publicação
.github/           verificação automática e modelo de pull request
```

## Estado da integração importada

A versão de origem já consulta e mantém categorias e produtos pelo backend. Algumas operações ainda preservam dados somente na memória da aplicação ou utilizam os dados de demonstração quando o backend está indisponível. Bairros, motoboys, pedidos, estoque e caixa precisam ser avaliados separadamente antes de serem considerados persistidos no servidor.

O objetivo da importação inicial é preservar o código fornecido. Ajustes de compatibilidade e evolução das funcionalidades devem ser revisados em alterações separadas, sem incluir uma cópia do backend neste repositório.

## Publicação

O frontend e a API estão publicados na **Vercel, com banco MongoDB Atlas e persistência Prisma**. Frontend: https://komanda-frontend.vercel.app. API: https://komanda-backend.vercel.app. Consulte [o guia de publicação](docs/PUBLICACAO.md).

A variável `VITE_API_URL` contém somente a URL pública da API. Credenciais e conexão do Atlas pertencem exclusivamente ao backend.

## Contribuir

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Não versione dependências instaladas, arquivos de build ou configurações locais. A integração contínua verifica a instalação e o build do frontend.
