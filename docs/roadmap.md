## Roadmap detalhado (tarefas escritas passo-a-passo para um júnior)

--

### 1) Scaffold inicial do projeto

O que fazer (passo-a-passo):
1. Criar os arquivos no diretório raiz: `index.html`, `style.css`, `app.js` e `config.js`.
2. Em `config.js` definir constantes:
   - NOME_ARQUIVO_CARTEIRA = './carteira.csv'
   - NOME_ARQUIVO_APORTE = './aporte.csv'
3. Em `app.js` adicionar uma função `iniciarApp()` que escreve `console.log('App iniciado')` e anexar ao `window.onload`.
4. Atualizar `README.md` com um parágrafo curto: como abrir `index.html` e propósito do projeto.

Critério de aceite:
- Ao abrir `index.html` no navegador, o console deve exibir `App iniciado`.
- Os arquivos listados existem no diretório.


---

### 2) Estrutura HTML básica

O que fazer (passo-a-passo):
1. Em `index.html` criar `<header>` com título do app e um botão `Carregar CSVs`.
2. Criar `<main>` com uma `<table id="carteira">` contendo `<thead>` com colunas: Tipo, % Ideal, % Atual, Valor Atual, Valor do Aporte.
3. Criar um `<aside id="resumo">` para mostrar `Patrimônio` e `Quanto vou aportar`.

Critério de aceite:
- A tabela e o painel lateral existem e são selecionáveis por `document.querySelector`.

---

### 3) Placeholders da UI (tabela)

O que fazer (passo-a-passo):
1. Preencher a `<table>` com 5 linhas estáticas inicialmente: Renda Fixa, FIIs, Ações, Stocks, Cripto.
2. Cada linha deve ter células com textos placeholders (`--` ou `0`) e um botão `Editar` na coluna Ações.
3. Implementar comportamento do botão `Editar` para transformar a célula `Valor do Aporte` em um `<input>` e alternar entre `Editar`/`Salvar`.

Critério de aceite:
- A tabela mostra 5 linhas e o botão `Editar` permite editar e salvar o valor localmente (sem persistência ainda).

---

### 4) Leitor de CSVs

O que fazer (passo-a-passo):
1. Implementar função `lerCSV(textoCSV)` que:
   - Garantidamente separa linhas por `\n` ou `\r\n`;
   - Divide o cabeçalho e mapeia colunas para objetos {coluna: valor};
   - Trima espaços e remove aspas.
3. Implementar `carregarCSVviaFetch(url)` para ambientes em que os CSVs estejam servidos .
4. Ao erro de parse, mostrar um toast/alert com mensagem em português (ex: `Erro ao ler carteira.csv: formato inválido`).

Critério de aceite:
- `lerCSV` devolve um array de objetos para `carteira.csv` e `aporte.csv` e a tabela é populada com `% Ideal` e `% Atual`.

---

### 5) Parser de valores monetários (`aporte.csv`)

O que fazer (passo-a-passo):
1. Implementar `parseValorBR(string)` que:
   - Remove `R$` e espaços;
   - Remove `.` separador de milhar;
   - Substitui vírgula por ponto e converte para Number;
   - Retorna `NaN` se não for um número válido.
2. Testar com os valores do arquivo `aporte.csv` existente.

Critério de aceite:
- `parseValorBR('R$ 1.748,51') === 1748.51` e `patrimonio` e `aporteMensal` são números válidos no código.

---

### 6) Algoritmo de aporte (versão base)

Contrato e comportamento:
- Entrada: lista `carteira` com `{tipo, ideal, atual}` e `aporteMensal` (Number).
- Saída: lista com `{tipo, aporteSugerido}`.

O que fazer (passo-a-passo):
1. Para cada item calcular `gap = ideal - atual`.
2. Considerar apenas gaps positivos (quando atual < ideal). Gaps negativos => tratar como 0 (não alocar aporte para rebalancear negativo nesta versão).
3. Somar todos os gaps positivos `somaGaps`.
4. Para cada item com gap positivo calcular `aporteSugerido = Math.round((aporteMensal * gap / somaGaps) * 100) / 100` (arredondar para centavos).
5. Garantir que a soma dos `aporteSugerido` seja, no máximo, `aporteMensal` (corrigir diferença residual somando/subtraindo dos maiores gaps se necessário).

Critério de aceite:
- Função `calcularAportes(carteira, aporteMensal)` existe e retorna valores coerentes que, somados, são ≈ `aporteMensal`.

Estimativa: 3 horas

---

### 7) Renderização dos resultados

O que fazer (passo-a-passo):
1. Implementar `renderCarteira(carteiraComAportes)` que atualiza cada linha da tabela com `aporteSugerido` formatado (BRL).
2. Atualizar o painel `#resumo` com `patrimonio`, `aporteMensal` e `somaAportesCalculados`.
3. Mostrar um destaque visual (ex: fundo verde claro) para tipos com aporte > 0.

Critério de aceite:
- Após carregar CSVs e executar `calcularAportes`, a UI mostra os valores corretamente e o painel resume bate com a soma dos aportes.

---

### 8) Editar alocação sugerida (override manual)

O que fazer (passo-a-passo):
1. Implementar edição in-line (já criada na task 3) para permitir que o usuário ajuste `aporte` manualmente.
2. Ao salvar um override, recalcular os aportes restantes proporcionalmente aos gaps não-overriden.
3. Salvar os overrides em `localStorage` sob a chave `aportes_overrides` para persistência local de teste.

Critério de aceite:
- O usuário pode ajustar manualmente um aporte e o restante se ajusta mantendo a soma igual a `aporteMensal`.

---

### 9) Estilização (`style.css`)

O que fazer (passo-a-passo):
1. Definir variáveis CSS para cores e fontes no topo do `style.css`.
2. Implementar layout responsivo com `flex` para `main` e `aside`.
3. Garantir foco acessível (outline visível) e alto contraste.
4. Use a imagem como referencia de estilo geral (cores, fontes, espaçamentos).

Critério de aceite:
- Página legível em mobile (360px) e desktop; inputs acessíveis por teclado.

---

### 10) Documentação e testes básicos

O que fazer (passo-a-passo):
1. Atualizar `README.md` com como rodar localmente e como testar (ex.: abrir `index.html`, usar botão `Carregar CSVs`).
2. Adicionar no `docs/` uma checklist de QA com passos manuais para verificar parse, cálculo e overrides.
3. Atualizar `docs/.clinerules` se houver mudanças no processo de trabalho.

Critério de aceite:
- README e `docs/` permitem que outro execute as tasks e valide os critérios sem suporte adicional.

---

