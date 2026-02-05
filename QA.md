# Checklist de QA - Aportunity

## Objetivo
Este documento contém os passos manuais para verificar todas as funcionalidades do Aportunity.

---

## 1. Setup Inicial

### 1.1 Verificação de Arquivos
- [ ] Todos os arquivos existem: `index.html`, `style.css`, `app.js`, `config.js`, `carteira.csv`, `aporte.csv`
- [ ] A pasta `docs/` existe com `.clinerules` e `roadmap.md`

### 1.2 Servidor Local
- [ ] Servidor HTTP local rodando (ex: `python3 -m http.server 8000`)
- [ ] Acesso via navegador em `http://localhost:8000`

---

## 2. Carregamento Inicial

### 2.1 Interface Visual
- [ ] Header exibe título "💰 Aportunity" e subtítulo
- [ ] Botão "Carregar CSVs" está visível
- [ ] Tabela com 6 colunas está renderizada
- [ ] Painel lateral "Resumo" está visível à direita (ou abaixo em mobile)

### 2.2 Console do Navegador (F12)
- [ ] Mensagem "App iniciado" aparece no console
- [ ] Não há erros vermelhos no console

### 2.3 Carregamento Automático
- [ ] A tabela mostra 5 linhas com os tipos de investimento
- [ ] Valores de "% Ideal" e "% Atual" estão preenchidos
- [ ] Coluna "Valor do Aporte" mostra valores calculados (não zeros)
- [ ] Toast de sucesso aparece: "Dados carregados com sucesso!"

---

## 3. Parse de CSV

### 3.1 Arquivo carteira.csv
- [ ] Tipos corretos: Renda Fixa, FIIs, Ações, Stocks, Cripto
- [ ] % Ideal: 25, 25, 22, 23, 5
- [ ] % Atual: 0, 0, 0, 0, 0 (valores iniciais)

### 3.2 Arquivo aporte.csv
- [ ] Painel "Patrimônio Atual" exibe "R$ 7.920,47"
- [ ] Painel "Quanto vou aportar" exibe "R$ 1.748,51"

### 3.3 Parse de Valores Monetários
- [ ] Valores BRL são parseados corretamente (R$ 7.920,47 → 7920.47)
- [ ] Formatação exibe corretamente "R$ 7.920,47" (ponto de milhar e vírgula decimal)

---

## 4. Cálculo de Aportes

### 4.1 Algoritmo Base
- [ ] Soma dos "Valor do Aporte" = "Quanto vou aportar" (R$ 1.748,51)
- [ ] Tipos com gap positivo recebem aporte > 0
- [ ] Tipos sem gap (ideal = atual) recebem aporte = 0

### 4.2 Distribuição Proporcional
- [ ] Renda Fixa (gap 25%): ≈ R$ 437,13
- [ ] FIIs (gap 25%): ≈ R$ 437,13
- [ ] Ações (gap 22%): ≈ R$ 384,67
- [ ] Stocks (gap 23%): ≈ R$ 402,16
- [ ] Cripto (gap 5%): ≈ R$ 87,43
- [ ] **Total:** R$ 1.748,51 (exato, sem diferença residual)

---

## 5. Renderização da UI

### 5.1 Tabela
- [ ] Todas as 5 linhas estão visíveis
- [ ] Colunas alinhadas corretamente
- [ ] Linhas com aporte > 0 têm destaque visual (fundo verde claro)
- [ ] Hover nas linhas muda a cor de fundo

### 5.2 Painel Resumo
- [ ] "Patrimônio Atual" exibe o valor correto
- [ ] "Quanto vou aportar" exibe o valor correto
- [ ] "Soma dos aportes" bate com o total calculado

### 5.3 Responsividade
- [ ] Desktop (>768px): Tabela à esquerda, resumo à direita
- [ ] Mobile (≤768px): Tabela e resumo empilhados verticalmente
- [ ] Texto legível em 360px de largura

---

## 6. Edição Manual (Override)

### 6.1 Modo Edição
- [ ] Clicar em "Editar" transforma o valor em input
- [ ] Input fica focado e selecionado
- [ ] Botão muda para "Salvar"

### 6.2 Salvamento
- [ ] Digitar novo valor (ex: 500.00 para Renda Fixa)
- [ ] Clicar em "Salvar"
- [ ] Toast aparece: "Aporte de Renda Fixa atualizado!"
- [ ] Valor atualizado na tabela
- [ ] Outros aportes recalculados proporcionalmente
- [ ] Soma total continua = aporte mensal

### 6.3 Persistência (localStorage)
- [ ] Recarregar a página (F5)
- [ ] Valor editado permanece (não volta ao original)
- [ ] localStorage contém `aportes_overrides` com o valor salvo

### 6.4 Reset de Overrides
- [ ] Abrir DevTools → Application → Local Storage
- [ ] Deletar chave `aportes_overrides`
- [ ] Recarregar página
- [ ] Valores voltam ao cálculo automático original

---

## 7. Tratamento de Erros

### 7.1 CSV Inválido
- [ ] Renomear `carteira.csv` para `carteira_backup.csv`
- [ ] Recarregar página
- [ ] Toast de erro aparece: "Erro ao carregar dados: ..."
- [ ] Mensagem de erro no console

### 7.2 CSV Vazio
- [ ] Criar `carteira.csv` vazio
- [ ] Recarregar página
- [ ] Toast de erro aparece

---

## 8. Acessibilidade

### 8.1 Navegação por Teclado
- [ ] Tab navega entre botões e inputs
- [ ] Foco visível (outline roxo/azul)
- [ ] Enter ativa botões

### 8.2 Contraste
- [ ] Texto legível em fundo escuro
- [ ] Botões têm contraste suficiente
- [ ] Links/ações facilmente identificáveis

---

## 9. Performance

### 9.1 Carregamento
- [ ] Página carrega em < 1 segundo
- [ ] CSVs carregam em < 500ms
- [ ] Renderização instantânea

### 9.2 Interação
- [ ] Edição e salvamento responsivos (< 100ms)
- [ ] Animações suaves (toasts, hovers)
- [ ] Sem travamentos ou lentidão

---

## 10. Compatibilidade

### 10.1 Navegadores
- [ ] Chrome/Edge (últimas versões)
- [ ] Firefox (últimas versões)
- [ ] Safari (últimas versões)

### 10.2 Dispositivos
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (360x640)

---

## ✅ Critérios de Aceite Final

Para considerar o app aprovado, TODOS os itens devem estar marcados:

- [ ] Todas as 10 tasks do roadmap concluídas
- [ ] Nenhum erro no console do navegador
- [ ] CSVs carregam e são parseados corretamente
- [ ] Cálculo de aportes está matematicamente correto
- [ ] Edição manual funciona e persiste
- [ ] Interface responsiva em mobile e desktop
- [ ] Acessibilidade básica implementada
- [ ] README.md e documentação completos

---

**Data do último teste:** _____/_____/_____  
**Testador:** _____________________  
**Status:** ⬜ Aprovado | ⬜ Reprovado | ⬜ Pendente
