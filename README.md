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

