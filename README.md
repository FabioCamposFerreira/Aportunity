# Aportunity 💰

Web App estático para automação de aportes mensais em carteira de investimentos.

## 📋 Propósito

O Aportunity ajuda investidores a distribuírem seus aportes mensais de forma automática e proporcional, mantendo a alocação ideal da carteira de investimentos.

O aplicativo calcula automaticamente quanto você deve aportar em cada tipo de investimento para manter ou alcançar a distribuição ideal da sua carteira.

## 🚀 Como usar

### Instalação Local

1. Clone ou baixe este repositório
2. Abra o arquivo `index.html` no seu navegador (recomendado: Chrome, Firefox, Edge)

### Uso via Servidor Local (Recomendado)

Para melhor experiência ao carregar os arquivos CSV:

```bash
# Python 3
python3 -m http.server 8000

# Ou use qualquer servidor HTTP estático
# Acesse: http://localhost:8000
```

### Primeiros Passos

1. **Abra o aplicativo** - O `index.html` carrega automaticamente os dados
2. **Visualize a tabela** - Veja suas alocações ideais vs. atuais
3. **Confira os aportes** - O sistema calcula automaticamente quanto aportar em cada tipo
4. **Edite manualmente** (opcional) - Clique em "Editar" para ajustar qualquer aporte
5. **Recarregue os dados** - Use o botão "Carregar CSVs" para atualizar

## 📁 Estrutura do Projeto

```
Aportunity/
├── index.html          # Interface principal com tabela e resumo
├── style.css           # Estilos modernos (tema escuro)
├── app.js              # Lógica: parse CSV, cálculos, renderização
├── config.js           # Configurações (paths dos CSVs)
├── carteira.csv        # Dados da carteira (% ideal e atual)
├── aporte.csv          # Valores de patrimônio e aporte mensal
├── docs/               # Documentação
│   ├── .clinerules     # Regras de desenvolvimento
│   ├── roadmap.md      # Plano de desenvolvimento (10 tasks)
│   └── QA.md           # Checklist de testes
└── README.md           # Este arquivo
```

## 📊 Arquivos CSV

### carteira.csv
Define os tipos de investimento, alocação ideal e alocação atual:

```csv
Tipo, % Ideal, % Atual
Renda Fixa, 25, 0
FIIs, 25, 0
Ações, 22, 0
Stocks, 23, 0
Cripto, 5, 0
```

### aporte.csv
Define o patrimônio atual e o valor do aporte mensal:

```csv
Tipo,Valor R$
Patrimônio atual,R$ 7.920,47
Quanto vou aportar,R$ 1.748,51
```

## 🧮 Como Funciona o Cálculo

1. **Identifica os gaps**: Calcula a diferença entre % ideal e % atual para cada tipo
2. **Considera apenas gaps positivos**: Só aloca em tipos que estão abaixo da meta
3. **Distribui proporcionalmente**: Quanto maior o gap, maior o aporte sugerido
4. **Garante a soma exata**: Ajusta diferenças residuais para que a soma = aporte mensal

**Exemplo:**
- Aporte mensal: R$ 1.748,51
- Renda Fixa: 25% ideal, 0% atual → Gap: 25%
- FIIs: 25% ideal, 0% atual → Gap: 25%
- Total de gaps: 100%
- Renda Fixa recebe: R$ 437,13 (25% do aporte)
- FIIs recebe: R$ 437,13 (25% do aporte)
- ...e assim por diante

## ✨ Funcionalidades

- ✅ Carregamento automático de CSVs
- ✅ Cálculo automático de aportes proporcionais
- ✅ Edição manual de aportes (com persistência local)
- ✅ Interface responsiva (mobile e desktop)
- ✅ Tema escuro moderno
- ✅ Notificações toast
- ✅ Acessibilidade (foco visível, alto contraste)

## 🎨 Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3 puro** - Variáveis CSS, Flexbox, Grid, responsividade
- **JavaScript Vanilla (ES6+)** - Sem frameworks ou bibliotecas

## 🧪 Testes

Veja o arquivo `docs/QA.md` para uma checklist completa de testes manuais.

**Testes rápidos:**
1. Abra o console do navegador (F12) → deve ver "App iniciado"
2. A tabela deve mostrar 5 tipos de investimento com valores calculados
3. O painel lateral deve mostrar patrimônio e aporte mensal
4. Clique em "Editar" → ajuste um valor → clique em "Salvar"
5. Recarregue a página → o valor editado deve persistir

## 🐛 Troubleshooting

**Problema:** CSVs não carregam  
**Solução:** Use um servidor HTTP local (veja seção "Uso via Servidor Local")

**Problema:** Valores incorretos  
**Solução:** Verifique o formato dos CSVs (vírgula como separador, valores em BRL)

**Problema:** Edições não salvam  
**Solução:** Verifique se o localStorage está habilitado no navegador

## 📝 Licença

Projeto open-source desenvolvido para fins educacionais.

## 🤝 Contribuindo

Sinta-se livre para abrir issues ou enviar pull requests!

---

Desenvolvido com 💜 seguindo boas práticas de código limpo e arquitetura modular.
