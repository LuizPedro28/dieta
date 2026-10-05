# Meu Diário — versão simples (sem servidor)

Só 100% arquivos estáticos. Sem Supabase, sem login, sem backend.

- Os dados (refeições, metas, conversa) ficam salvos **no navegador** (localStorage).
- A IA é o **Google Gemini**, chamado direto do navegador com a sua chave de API.

## Como usar

1. Crie uma chave grátis em https://aistudio.google.com/apikey
2. Abra `index.html` (ou publique no GitHub Pages / Netlify / qualquer hospedagem estática).
   Dica: para testar localmente, rode `python3 -m http.server` na pasta e abra http://localhost:8000
3. Cole a chave na primeira tela. Pronto.

Para instalar no celular: abra o site e use "Adicionar à tela inicial".

## Importante

- A chave fica só no seu navegador e vai apenas para o Google. Use este app só para você: **não** publique um site com a sua chave embutida no código.
- No Google AI Studio dá para restringir a chave (por domínio/site) e ver o uso.
- Dados ficam por aparelho. Para levar para outro dispositivo ou fazer backup: Ajustes → Exportar JSON / Importar backup.
- Limpar os dados do site no navegador apaga o diário. Faça backup de vez em quando.
- Modelo padrão: `gemini-2.5-flash` (pode trocar em Ajustes).
- Se o plano gratuito for usado, o Google pode usar os textos/fotos enviados para melhorar produtos; veja os termos do Gemini API.
