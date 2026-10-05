# Meu Performance — Treino & Alimentação

Aplicativo pessoal integrado para publicar no **GitHub Pages**.

## Arquitetura

- Front-end 100% estático: GitHub Pages.
- Dados de treino, alimentação, metas e conversas: `localStorage` do navegador.
- IA: chamada **direta do navegador para a API do Gemini**, usando a sua própria chave configurada em Configurações.
- Nenhum backend, banco ou servidor intermediário é necessário.
- A chave da API não é colocada no código-fonte nem no repositório. Ela é informada pela interface e permanece no armazenamento local do navegador.
- Backup/exportação não inclui as chaves de API.

> Importante: uma chave usada diretamente no navegador pode ser inspecionada pelo próprio usuário e pelas ferramentas do navegador. Como este é um app pessoal, a solução mantém a chave local e não a publica no repositório. Para um app público/multiusuário seria necessário um backend/proxy seguro.

## Publicar no GitHub Pages

1. Crie um repositório no GitHub.
2. Coloque **o conteúdo desta pasta na raiz do repositório** (o `index.html` deve ficar na raiz).
3. Faça commit e push para a branch `main`.
4. No GitHub, abra **Settings → Pages**.
5. Em **Build and deployment**, escolha **Deploy from a branch**.
6. Selecione `main` e `/ (root)` e salve.
7. Aguarde o GitHub Pages publicar o site.

O projeto já usa caminhos relativos (`./`) e inclui `.nojekyll`, `manifest.json` e service worker para funcionar como site de projeto do GitHub Pages, inclusive quando a URL tiver `/nome-do-repositorio/`.

## Configurar a IA

1. Abra o app publicado.
2. Vá em **Configurações → Assistente de IA**.
3. Escolha **Google Gemini**.
4. Cole sua chave de API.
5. Clique em **Testar chave e buscar modelos**.
6. O app consulta os modelos disponíveis para **a sua chave** e seleciona um modelo compatível.

A mesma configuração Gemini é usada pelo assistente de **treino e alimentação**. A alimentação também usa a descoberta/fallback de modelos, para não ficar presa a um nome de modelo antigo.

## Dados e migração

Os dados ficam no navegador. Em **Dados locais**, use o backup integrado para exportar treino + alimentação + metas + conversas em JSON. Também há exportação CSV separada para treino e alimentação.

As chaves de API são deliberadamente excluídas dos backups.

## Desenvolvimento local

Para testar antes de publicar:

```bash
python -m http.server 8000
```

Depois abra `http://localhost:8000`.

