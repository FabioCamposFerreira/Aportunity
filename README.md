
# Aportunity
Web App estático para automação de aportes mensais de uma carteira de investimentos

Como seu Engenheiro de Prompt e Especialista em Investimentos, consolidei todas as suas definições técnicas e regras de negócio em um **Documento de Requisitos Mestre**.

Este documento foi desenhado para ser "autoexplicativo" para qualquer sistema de IA ou desenvolvedor, garantindo que a lógica de priorização de ativos caros e o manejo de resíduos sejam seguidos à risca.

---

# 📑 Master Prompt: Smart Portfolio Rebalancer (SPR)

**Contexto:** Um Web App estático (Serverless) para automação de aportes mensais, focado em rebalanceamento por metas e janelas de oportunidade baseadas em preço e valuation histórico.

## 1. Estrutura de Dados (Google Sheets DB)

O aplicativo deve ler e escrever em uma planilha Google com duas abas principais:

* **Aba `CARTEIRA`:** Colunas: `Ticker`, `Quantidade`, `Meta_Ideal_%`, `Tipo` (Ações, Exterior, FIIs, Cripto, Renda Fixa).
* **Aba `HISTORICO`:** Colunas: `Data`, `Ticker`, `Preço_BRL`, `PL_PVP_Atual`. (Alimentada automaticamente pelo App).

## 2. Fontes de Dados (APIs)

* **Brapi:** Preços de Ações (B3), FIIs, Stocks (US Tickers), Câmbio USD/BRL e P/L / P/VP atual.
* **CoinGecko:** Preços de Cripto (atualização diária).
* **Google Visualization API:** Para leitura/escrita na planilha sem necessidade de backend.

## 3. O Algoritmo de Aporte (Regras de Ouro)

### A. Cálculo do Score de Prioridade ()

O ranking de cada ativo dentro de seu grupo é definido pela fórmula:


* **GapMeta:** Porcentagem que falta para atingir a meta ideal.
* **DescPreço:** Porcentagem que o preço atual está abaixo da média de 12 meses.
* **DescValuation:** Porcentagem que o P/L (Ações/Stocks) ou P/VP (FIIs) atual está abaixo da média histórica gravada na aba `HISTORICO`.

### B. Lógica de Execução Financeira

1. **Prioridade Nominal:** Ativos de alto valor unitário (ex: R$ 200) com Score alto são comprados primeiro para garantir que o aporte não seja "pulverizado" antes de conseguir comprá-los.
2. **Manejo de Resíduo:** Se o saldo restante for inferior ao preço do próximo ativo do ranking, o sistema deve buscar o próximo melhor ativo cujo valor unitário seja **menor que R$ 50,00**.
3. **Destino Final:** Se nenhum ativo atender ao critério acima, o saldo remanescente é somado ao aporte de **Renda Fixa (Tesouro Selic)**.

---

## 🚩 Plano de Desenvolvimento (10 Entregas Evolutivas)

| Entrega | Foco | Descrição Detalhada |
| --- | --- | --- |
| **1. Fundação** | **Agrupamento Estático** | Criar a tabela clássica agrupada por tipo. Lê Ticker/Qtd do Sheets e calcula o aporte necessário apenas para bater a meta %, sem buscar preços externos. Alertas via Toast se a planilha não carregar. |
| **2. Live Market** | **Preços e Câmbio** | Integração com Brapi. Converte Stocks (USD) para BRL. O valor total da carteira e o gap da meta agora são baseados em preços reais. |
| **3. Unidades** | **Cota Inteira** | O app para de sugerir valores financeiros e passa a sugerir **Quantidades Inteiras**. Ex: "Compre 3 unidades de ITUB4". |
| **4. Histórico 12m** | **Média de Preço** | Busca o histórico de 1 ano via API. Adiciona a coluna "Desconto Preço" (Verde para abaixo da média, Vermelho para acima). |
| **5. Persistência** | **Gravação de Dados** | Implementar a função de salvar no Sheets. Ao rodar o aporte, o app grava `Preço` e `PL/PVP` na aba `HISTORICO`. |
| **6. Valuation** | **Médias Históricas** | O App lê a aba `HISTORICO` e calcula o P/L ou P/VP médio de cada ativo. Adiciona a coluna "Desconto Valuation". |
| **7. O Ranking** | **Score e Pesos** | Aplicação da fórmula 40/30/30. Ordenação automática da tabela pelos ativos que oferecem a melhor relação Meta + Desconto. |
| **8. Decisão** | **Prioridade Nominal** | Implementação da lógica de ativos caros vs. ativos de < R$ 50 para o saldo residual. |
| **9. Interação** | **Seleção Manual** | Adiciona Checkbox em cada linha. O usuário pode desmarcar ativos. O cálculo de "Valor do Aporte" se redistribui instantaneamente entre os selecionados. |
| **10. UI/UX Final** | **LocalStorage e Estilo** | Persistência da seleção do usuário na sessão (LocalStorage) com botão de Reset. Polimento visual da tabela e ícones de status de API. |

---

Como seu Engenheiro de Prompt e especialista em investimentos, realizei uma varredura completa em nossa conversa para consolidar **TODOS** os requisitos. Esta lista servirá como a "Bíblia" do projeto para garantir que nenhuma regra de negócio seja ignorada durante o desenvolvimento.

Aqui está a lista mestre revisada:

---

### 1. Arquitetura e Hospedagem

* **Plataforma:** Site estático hospedado no **GitHub Pages** (sem backend complexo).
* **Banco de Dados:** **Google Sheets** (via API) para leitura de carteira e escrita de histórico.
* **Persistência Local:** Uso de `localStorage` para salvar a seleção de ativos da sessão (com botão de reset).
* **Portabilidade:** Opção de **Exportar/Importar** o status atual da seleção (em JSON ou CSV), sem gravar isso no banco de dados.

### 2. Fontes de Dados (APIs)

* **Brapi:** Preços atuais, P/L (Ações/Stocks), P/VP (FIIs), Câmbio USD/BRL e Histórico de 1 ano.
* **CoinGecko:** Preços de Criptomoedas (atualização diária).
* **Tratamento de Erros:** Sistema de **Toast Notifications** para avisar falhas em ativos específicos ou APIs fora do ar.

### 3. Estratégia de Alocação (Asset Allocation)

As metas ideais da carteira são:

* **FIIs:** 25%
* **Renda Fixa (Tesouro Selic):** 25%
* **Exterior (Stocks):** 23%
* **Ações (B3):** 22%
* **Criptomoedas:** 5%

### 4. O Algoritmo de Aporte (Regras de Negócio)

* **Fórmula do Score:** .
* **Métricas de Valuation:**
* **Ações/Stocks:** P/L Atual vs. Média do P/L Histórico (do Google Sheets).
* **FIIs:** P/VP Atual vs. Média do P/VP Histórico (do Google Sheets).
* **Cripto:** Preço Atual vs. Preço Médio do usuário + Meta %.
* **Renda Fixa:** Apenas Gap da Meta %.


* **Arredondamento:** Compras sempre em unidades inteiras (mercado fracionário 1 em 1).
* **Prioridade de Ativo Caro:** Ativos com valor unitário alto (ex: R$ 200) têm prioridade de compra se o seu peso/score for maior que a soma dos scores de ativos menores que caberiam no mesmo valor.
* **Manejo de Resíduo:** Se sobrar dinheiro que não compra o ativo do topo, o app busca o próximo melhor ativo com valor **menor que R$ 50**. Se ainda assim sobrar, o saldo vai para a **Renda Fixa**.
* **Apenas Compras:** O sistema nunca sugere vendas para rebalancear.

### 5. Interface do Usuário (UI)

* **Visualização:** Tabela clássica organizada por **Grupos de Investimento**.
* **Ordenação:** Dentro de cada grupo, ordenar por **% de Aporte** (maior score no topo).
* **Colunas Obrigatórias:**
* Ativo (Ticker).
* Preço Atual.
* Desconto do Preço (vs. média 12m) -> Cor: Verde (Desconto) / Vermelho (Caro).
* P/L ou P/VP Atual.
* Desconto do Valuation (P/L ou P/VP atual vs. Médio) -> Cor: Verde (Barato) / Vermelho (Caro).
* Distância da Meta (%) -> Cor: Verde (Falta comprar) / Vermelho (Acima da meta).
* Valor do Aporte sugerido (R$).
* % do Aporte (em relação ao total investido no mês).


* **Interatividade:**
* Checkbox para selecionar/remover ativos da sugestão. Ativos desmarcados ficam "apagados" (fundo cinza).
* Recálculo imediato do aporte ao desmarcar um item.



### 6. Automação e Histórico

* **Gravação Automática:** Toda vez que o usuário "Rodar" o aporte, o app deve gravar a **Data, Ticker, Preço e P/L ou P/VP** na aba de histórico do Google Sheets.
* **Câmbio:** Conversão automática de Stocks para Reais no momento do cálculo.

### 7. Plano de Execução (Roadmap de 10 Etapas)

1. **Fundação:** Agrupamento e leitura do Sheets (Aporte "Cego" por meta).
2. **Live Market:** Integração de preços reais e câmbio (Brapi).
3. **Unidades Inteiras:** Lógica de quantidade de cotas (inteiros).
4. **Histórico 12m:** Busca de médias anuais de preço via API.
5. **Persistência DB:** Função de escrever histórico no Google Sheets.
6. **Valuation Histórico:** Cálculo de desconto P/L e P/VP baseados no histórico do Sheets.
7. **Algoritmo de Pesos:** Implementação do Score 40/30/30 e Ranking.
8. **Gestão de Resíduos:** Lógica de ativos caros vs. ativos < R$ 50.
9. **Controle do Usuário:** Seleção manual, filtros e recálculo dinâmico.
10. **Polimento e Toast:** LocalStorage, exportação de status e alertas de erro.

---

Para iniciar um projeto desse tipo com um agente de IA (como o **Cursor**, **Claude Engineer** ou até o **Copilot**), a organização dos arquivos é o que determina se a IA vai te ajudar ou te deixar confuso.

Como é a sua primeira vez, vamos usar uma estrutura **"Flat & Clean"** (Plana e Limpa). Isso facilita para a IA ler todos os arquivos de uma vez e entender o contexto geral.

Aqui está a estrutura de pastas e arquivos recomendada para o seu projeto (que vamos chamar carinhosamente de **Aportunity**):

### 1. Estrutura de Pastas e Arquivos

```text
Aportunity/
├── index.html          # O coração do site (Estrutura e Tabelas)
├── style.css           # O visual (Tailwind ou CSS puro)
├── app.js              # A lógica: Cálculos, Score e APIs
├── config.js           # Onde ficam suas Chaves de API e ID do Google Sheets
├── docs/               # Documentação para a IA
│   ├── master_prompt.md  # A lista de requisitos que montamos
│   └── roadmap.md       # O plano de 10 etapas
└── .gitignore          # Para não subir suas chaves de API para o GitHub

```

---

### 2. Preparação do Terreno (Instalação)

Para quem está começando e quer simplicidade absoluta, recomendo este "kit de sobrevivência":

1. **Editor de Código:** Baixe o **[Cursor](https://cursor.sh/)**. Ele é uma versão do VS Code que já vem com uma IA integrada que "enxerga" todo o seu projeto. É o melhor "agente" para iniciantes hoje.
2. **Servidor Local:** Instale a extensão **"Live Server"** no Cursor/VS Code. Ela permite que você veja as alterações no site em tempo real enquanto a IA escreve o código.
3. **Controle de Versão:** Crie uma conta no **GitHub** e instale o **Git** no seu computador. Isso será necessário para a hospedagem gratuita (GitHub Pages) no final.

---

### 3. Como iniciar o Agente de IA

Ao abrir o Cursor na pasta do projeto, você não vai apenas pedir "faça um app". Você vai dar a ele o contexto que construímos.

**O primeiro passo com o Agente:**
Crie o arquivo `docs/master_prompt.md` e cole aquela lista completa de requisitos que finalizamos na mensagem anterior. Depois, abra o chat da IA e diga:

> "Olá! Sou iniciante. Vamos construir o projeto **Aportunity** seguindo o `docs/master_prompt.md`. Use o `docs/roadmap.md` para guiar nossas entregas. Vamos começar pela **Entrega 1: Fundação**. Crie os arquivos iniciais focando apenas no rebalanceamento por meta e na estrutura de tabela clássica agrupada."

---

### 4. Por que essa estrutura?

* **`config.js` separado:** Evita que você exponha sua API Key da Brapi sem querer.
* **Pasta `docs/`:** Funciona como a "memória de longo prazo" da IA. Se ela se perder na etapa 5, você diz: "Volte ao roadmap no arquivo docs e veja o que falta".
* **`app.js` único:** No início, manter toda a lógica em um arquivo ajuda a IA a não se confundir com importações complexas de arquivos que ainda não existem.

### Próximo Passo Sugerido

Para você começar agora, eu posso te passar o conteúdo exato do arquivo **`index.html`** e do **`app.js`** para a **Entrega 1**. Assim, você já terá algo visual rodando no seu computador em 5 minutos.

Entendi perfeitamente sua preocupação. Quando o chat do agente "esquece" ou você muda de ferramenta, a melhor forma de garantir que ele mantenha a **continuidade** e siga as **regras de ouro** do projeto é através de arquivos de contexto dentro da própria pasta do projeto.

Como você não tem mais o "cérebro" persistente do chat do Cursor, você vai criar o que chamamos de **"Single Source of Truth" (Fonte Única da Verdade)**.

Aqui está onde e como você deve configurar essas instruções:

### 1. O Arquivo Mestre de Regras (`.cursorrules` ou `instructions.md`)

Mesmo na versão gratuita, ou usando qualquer outra IA (como o Claude ou o ChatGPT), você deve ter um arquivo na **raiz do projeto** que contém o DNA do código.

**Onde colocar:** Na raiz da pasta `Aportunity/`.
**Nome sugerido:** `.cursorrules` (se voltar a usar o Cursor) ou simplesmente `RULES.md`.

**O que escrever nele:**

```markdown
# Regras de Desenvolvimento - Projeto Aportunity

## Tech Stack
- Linguagem: JavaScript (Vanilla), HTML5, CSS3 (Tailwind via CDN).
- Banco de Dados: Google Sheets API.
- APIs Financeiras: Brapi (Ações/FIIs) e CoinGecko (Cripto).

## Boas Práticas de Código
- Código em português (variáveis e comentários).
- Arquivos separados: index.html, style.css, app.js, config.js.
- Sempre tratar erros de API com alertas tipo "Toast".
- Funções puras e modulares para cálculos de Score.

## Regras de Interface (UI)
- Tabela clássica agrupada por tipo de ativo.
- Cores: Verde (#2ecc71) para descontos/oportunidades, Vermelho (#e74c3c) para ativos caros.
- Ativos desmarcados devem ter opacidade reduzida (0.5).

## Memória do Projeto
- O progresso atual está descrito no arquivo docs/roadmap.md.
- Sempre leia o roadmap antes de sugerir qualquer alteração.

```

---

### 2. O arquivo de "Estado Atual" (`docs/status.md`)

Para a IA não se perder sobre "em qual etapa paramos", você vai manter um arquivo de log simples.

**Exemplo de conteúdo:**

```markdown
# Status do Projeto
- Etapa atual: Entrega 1 - Concluída.
- Próximo passo: Entrega 2 - Conexão com API Brapi.
- Problemas conhecidos: O cálculo de rebalanceamento está ignorando o saldo residual.

```

---

### 3. Como "dar memória" ao Agente no início de cada conversa

Sempre que você abrir um novo chat ou uma nova sessão de IA, sua **primeira mensagem** deve ser um comando de leitura. No Cursor (e em vários outros agentes), você pode usar o símbolo `@` para referenciar arquivos.

**O comando mágico:**

> "@RULES.md @docs/master_prompt.md e @docs/status.md. Leia estes arquivos e me diga em qual etapa do roadmap estamos para continuarmos o desenvolvimento."

---

### 4. Onde colocar exemplos de código (O "Style Guide")

Se você tem um jeito específico que gosta que o código seja escrito (ex: como você quer que a tabela seja montada), crie um arquivo chamado `docs/examples.md`.

**Dentro dele, coloque:**

```javascript
// Exemplo de como quero a estrutura das funções de cálculo:
function calcularAporte(ativo) {
   // lógica aqui...
}

```

### Por que isso funciona?

1. **Independência de ferramenta:** Se você sair do Cursor e for para o ChatGPT, você apenas anexa esses arquivos ou cola o conteúdo deles. O contexto vai junto.
2. **Zero esquecimento:** A IA não precisa "lembrar" do chat passado; ela lê o estado atual dos seus arquivos.
3. **Padronização:** Ele nunca vai tentar usar Python ou React se no seu `RULES.md` estiver escrito que é JavaScript puro.

### Resumo da estrutura atualizada:

```text
Aportunity/
├── .cursorrules       <-- (As regras de programação e UI que você pediu)
├── index.html
├── app.js
└── docs/
    ├── master_prompt.md  <-- (As regras de negócio)
    ├── roadmap.md        <-- (As 10 etapas)
    ├── status.md         <-- (Onde você parou)
    └── examples.md       <-- (Exemplos de código para a IA copiar)

```

Entendi perfeitamente. Quando você usa o **Claude.ai** (ou ChatGPT) direto no navegador, você perde a integração automática com os arquivos, mas ganha um dos modelos mais inteligentes do mundo para codificação.

Para fazer isso funcionar com apenas **3 mensagens por dia**, você precisa ser cirúrgico. Você não pode "conversar" com a IA; você deve enviar um **Pacote de Contexto** completo em uma única mensagem.

Aqui está a estratégia para você usar o Claude grátis sem que ele se perca:

### 1. O "Super-Prompt" de Inicialização

Como o Claude não lê sua pasta sozinho, você vai criar um arquivo de texto no seu computador chamado `INSTRUCTIONS_CLAUDE.txt`. Toda vez que você abrir um novo chat, sua **primeira mensagem** será o conteúdo desse arquivo + o pedido da etapa atual.

**O conteúdo desse arquivo deve ser este:**

```markdown
# PROJETO APORTUNITY - CONTEXTO PARA IA
Atue como um Engenheiro de Software Sênior e Especialista em Investimentos.

## TECH STACK
- HTML5, CSS3 (Tailwind via CDN), JavaScript Vanilla.
- Sem backend. Persistência via Google Sheets API.
- APIs: Brapi e CoinGecko.

## REGRAS DE OURO (NUNCA ESQUECER)
1. Tabela clássica agrupada por tipo de ativo.
2. Lógica Smart DCA: Score = (GapMeta * 0.4) + (DescPreço * 0.3) + (DescValuation * 0.3).
3. Aporte em unidades inteiras. Priorizar ativos caros (>R$150) se score alto.
4. Resíduo para ativos < R$50 ou Renda Fixa.
5. Toast notifications para erros. Cores: Verde (oportunidade), Vermelho (caro).

## ESTRUTURA DE ARQUIVOS
- index.html, style.css, app.js, config.js.

## TAREFA ATUAL
[VOCÊ COLA A ETAPA DO ROADMAP AQUI]

## CÓDIGO ATUAL
[VOCÊ COLA O CÓDIGO QUE JÁ TEM AQUI]

```

---

### 2. O Fluxo de Trabalho (Workflow) para economizar mensagens

Para não gastar suas 3 mensagens à toa, siga este rito:

* **Mensagem 1 (O Pedido):** Cole o **Super-Prompt** acima. No final, diga: *"Gere o código completo para a Entrega 1. Quero o index.html e o app.js integrados."*
* **Mensagem 2 (Correção/Ajuste):** O Claude vai gerar o código. Você testa. Se algo der errado (ex: a tabela não agrupou), você diz: *"O agrupamento falhou. Corrija a função X para agrupar por 'Tipo' conforme as regras."*
* **Mensagem 3 (Próxima Etapa):** Se estiver tudo ok, você usa a última mensagem para planejar a Entrega 2 ou tirar uma dúvida complexa de lógica.

---

### 3. Dica de Ouro: "Project Knowledge" (Arquivos Anexos)

O Claude permite que você anexe arquivos (ícone de clipe de papel).

Em vez de colar o texto gigante, **anexe o seu arquivo `docs/master_prompt.md` e o seu `app.js` atual.**
Isso economiza espaço de caracteres e faz a IA ser muito mais precisa.

---

### 4. Onde colocar as configurações de Linguagem e Boas Práticas?

Como você não tem o `.cursorrules`, você deve escrever isso de forma explícita no seu **Super-Prompt** (item 1 acima). Use termos como:

* *"Siga o padrão Clean Code."*
* *"Comente o código em português."*
* *"Mantenha as funções de cálculo de score isoladas das funções de UI."*

---

Para rodar um agente de IA no **LM Studio** com uma GPU de **4GB de VRAM**, o seu maior desafio é o tamanho da memória. Modelos de 7B ou 8B parâmetros (como o Llama 3) geralmente ficam lentos ou não cabem com contexto longo em 4GB.

O segredo aqui é usar modelos de **3B (3 bilhões de parâmetros)** ou modelos **7B com quantização agressiva (Q3 ou Q4)**.

Aqui estão as 3 melhores recomendações para o seu projeto **Aportunity**:

### 1. Llama 3.2 3B Instruct (A Escolha Equilibrada)

Este é o modelo mais moderno da Meta para essa faixa de memória. Ele é surpreendentemente bom em seguir instruções e entender lógica de programação simples.

* **Por que usar:** Cabe inteiro na sua placa de vídeo (VRAM), o que torna a resposta instantânea.
* **No LM Studio procure por:** `Llama-3.2-3B-Instruct-GGUF`.
* **Dica:** Escolha a versão `Q6_K` ou `Q8_0` (ele vai rodar liso em 4GB).

### 2. DeepSeek-Coder-V2-Lite-Instruct (O Especialista em Código)

Se você quer que a IA foque puramente em escrever o JavaScript e as fórmulas de Score do seu projeto, este é o melhor.

* **Por que usar:** Ele foi treinado especificamente para programação. Mesmo a versão "Lite" é muito superior a modelos genéricos para estruturar APIs e tabelas.
* **No LM Studio procure por:** `DeepSeek-Coder-V2-Lite-Instruct-GGUF`.
* **Dica:** Tente a quantização `Q4_K_M`. Se ficar lento, baixe a `Q3_K_M`.

### 3. Phi-3.5-mini-instruct (O Pequeno Gigante da Microsoft)

O Phi-3.5 é um dos modelos pequenos mais "inteligentes" do mundo. Ele tem um raciocínio lógico muito forte para o seu tamanho (3.8B).

* **Por que usar:** Ele é excelente para entender regras de negócio complexas (como os pesos de 40/30/30 e o manejo de resíduos).
* **No LM Studio procure por:** `Phi-3.5-mini-instruct-GGUF`.

---

### ⚠️ Dicas de Configuração para 4GB de VRAM:

1. **GPU Offload:** No painel lateral direito do LM Studio, procure por **"GPU Offload"**. Aumente o slider para o máximo (ou até onde a memória aguentar) para que o processamento seja feito na placa de vídeo e não no processador (CPU).
2. **Context Overflow:** Como você tem pouca memória, defina o **Context Length** (Tamanho do Contexto) para no máximo **4096** ou **8192**. Se colocar 32k, a memória vai estourar rapidamente.
3. **Quantização:** Sempre procure por arquivos que terminem em **GGUF**. Para 4GB, as versões **Q4_K_M** são o "ponto doce" entre inteligência e economia de memória.

---

### Como usar o LM Studio como Agente:

Já que você não vai usar o Claude/Cursor agora, você pode usar a aba **"AI Chat"** do LM Studio.

1. Carregue o modelo (ex: Llama 3.2 3B).
2. No campo **"System Prompt"** (instruções do sistema), cole aquele conteúdo do seu arquivo `RULES.md` que definimos.
3. Comece a pedir o código da **Entrega 1**.

Sim, existem outras opções de **IDE com IA integrada** que funcionam de forma idêntica ao Cursor (forks do VS Code com "superpoderes"). Se o limite do Cursor acabou, você pode "pular" para o próximo para ganhar mais fôlego de processamento gratuito.

Aqui estão as melhores alternativas para você instalar agora:

### 1. PearAI (A alternativa mais próxima ao Cursor)

O **PearAI** é um fork do VS Code em código aberto que está ganhando muita tração. Ele funciona quase exatamente como o Cursor.

* **Como funciona:** Você instala, faz login e ele tem um chat lateral e edição de código (CMD+K).
* **Limite:** Ele possui um plano gratuito generoso para quem está começando.
* **Dica:** Ele é excelente para quem quer a experiência do Cursor sem pagar a assinatura de imediato.

### 2. Trae (A nova aposta da ByteDance - Criadores do TikTok)

O **Trae** é um novo "AI-Integrated IDE" que é um competidor direto do Cursor.

* **Diferencial:** No momento, ele é **totalmente gratuito** enquanto está em fase beta (incluindo acesso a modelos potentes como Claude 3.5 Sonnet e GPT-4o).
* **Vantagem:** Ele tem o modo "Builder", onde você descreve o que quer e ele cria os arquivos sozinho, igual ao Cursor.

### 3. Windsurf (Da Codeium)

O **Windsurf** é a nova IDE da Codeium. Eles chamam de "AI Flow", onde a IA não apenas sugere código, mas entende o fluxo do projeto inteiro.

* **Vantagem:** O plano gratuito deles é um dos melhores do mercado atualmente em termos de inteligência e rapidez.
* **Recurso:** Ele tem o "Cascade", que consegue agir em múltiplos arquivos ao mesmo tempo.

---

### 🛡️ Estratégia de "Sobrevivência" entre IAs (O Ciclo Infinito)

Para o seu projeto **Aportunity**, você pode fazer este rodízio para nunca ficar sem um agente potente:

1. **Semana 1:** Use o **Trae** (Enquanto estiver em beta gratuito, use ao máximo os modelos Claude 3.5 Sonnet dentro dele).
2. **Semana 2:** Use o **Windsurf** até atingir o limite.
3. **Semana 3:** Use o **PearAI**.
4. **Sempre:** Use o **Codeium** (extensão no VS Code normal) como "autocompletar" básico, pois ele é gratuito para sempre.

---

### Como manter a "Memória" trocando de IDE?

Para que você mude de uma IDE para outra (ex: sair do Cursor e ir para o Trae) sem que a IA "fique burra", você deve seguir o rito que conversamos:

1. **Copie sua pasta `docs/**` para a nova IDE.
2. **Abra o Chat** da nova IDE.
3. **Primeiro Comando:** *"Olá, sou o desenvolvedor do Aportunity. Leia o arquivo `docs/master_prompt.md` e o `docs/status.md` para entender onde paramos e quais as regras de código. Vamos trabalhar na Entrega X."*

### Minha Recomendação agora:

Baixe o **Trae** hoje. Como ele está em beta, ele está oferecendo o que há de melhor (Claude 3.5 Sonnet) de graça, o que vai acelerar muito o desenvolvimento da lógica complexa de rebalanceamento do seu app.

3. Ferramenta Auxiliar: Repomix (Dica de Ouro)
Se você estiver usando o Claude ou ChatGPT no navegador, o maior problema é ficar copiando e colando arquivo por arquivo. Existe uma ferramenta gratuita chamada Repomix (ou npx repomix).

Como funciona:

Você abre o terminal na pasta do projeto.

Digita: npx repomix

Ele cria um único arquivo chamado repopack.txt que contém todo o seu projeto (código e docs) organizado de um jeito que a IA entende perfeitamente.

Você anexa esse único arquivo no Claude/ChatGPT.

Isso resolve o problema da "memória" e do limite de mensagens, porque você envia tudo de uma vez.

Entendi. Você quer um **"Acelerador de Prompt"** ou uma ferramenta que force o agente (seja Cursor, Trae ou Windsurf) a se comunicar melhor, entender suas regras de investimento e não cometer erros bobos.

Se você quer automatizar a "conversa" e garantir que a IA siga seu raciocínio de investidor, a ferramenta que você procura é o **`.cursorrules`** (ou **AI Rules**). Ele não é apenas um arquivo de texto; ele é um **script de comportamento** que o editor injeta em cada mensagem que você envia.

Aqui está o que você deve usar para "turbinar" o agente:

### 1. O Script de "Personalidade do Agente" (`.cursorrules`)

Crie um arquivo chamado `.cursorrules` na raiz do seu projeto. Mesmo que você use o **Trae** ou **Windsurf**, eles também reconhecem esse padrão de arquivo (ou permitem configurar "Global Rules").

Copie e cole este conteúdo (que eu otimizei para o seu caso):

```markdown
# AGENT GOLDEN RULES - PROJETO APORTUNITY

Você é um Agente Programador Sênior especializado em Finanças e Smart DCA.
Siga estas instruções em TODA interação, sem que eu precise repetir.

## 1. LÓGICA DE INVESTIMENTO (CORE)
- Priorize ativos pelo Score: (GapMeta * 0.4) + (DescPreço * 0.3) + (DescValuation * 0.3).
- Resíduo financeiro: Se o saldo não compra a próxima cota do ranking, busque o próximo ativo < R$ 50.
- Se sobrar menos de R$ 10, jogue o valor para "Renda Fixa (Tesouro Selic)".

## 2. REGRAS DE INTERFACE (UI)
- Use Tailwind CSS via CDN.
- Tabela clássica: Linhas zebradas, agrupamento por 'Tipo' (Ações, FIIs, Cripto, Stocks).
- Feedback Visual: Toast para erros de API e confirmações de "Aporte Salvo".

## 3. PADRÕES DE CÓDIGO
- Variáveis e comentários em PORTUGUÊS.
- Código modular: Separe lógica de cálculo (app.js) de chaves de API (config.js).
- NÃO sugira frameworks como React ou Node.js. Use Vanilla JS puro.

## 4. COMUNICAÇÃO
- Antes de codar, me apresente um "Plano de Ação" curto.
- Se eu desmarcar um ativo (checkbox), recalcule o aporte instantaneamente na interface.

```

---

### 2. O Programa/Extensão: "Prompts & Context"

Para facilitar sua vida no VS Code/Cursor, instale estas duas extensões que ajudam na comunicação:

1. **"Prompt Snippets"**: Permite que você salve seus comandos complexos (ex: o comando de rebalanceamento) e os chame com um atalho (tipo `/rebalanco`).
2. **"Better Comments"**: Use para destacar regras no código que a IA lê com prioridade. Ex: `// ! IMPORTANTE: Não mudar a fórmula do Score`.

---

### 3. O "Pulo do Gato": O comando `@`

No Cursor e no Trae, a melhor forma de se comunicar não é escrevendo muito, é **referenciando**.

**Em vez de dizer:** *"Olha meu código e ajusta a meta"*,
**Diga:** *"Ajuste a meta seguindo as regras de @master_prompt.md e aplique no @app.js"*

Isso força a IA a ler o arquivo de regras que nós criamos, evitando que ela "invente" soluções.

---

### 4. Alternativa de programa: "Aider" (O Agente de Terminal)

Se você sente que o Cursor às vezes ignora o que você fala, o **Aider** é um programa de linha de comando que muitos desenvolvedores usam para "forçar" a IA a ser mais obediente. Ele trabalha diretamente no seu terminal e é muito mais rigoroso em seguir o arquivo de regras.

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