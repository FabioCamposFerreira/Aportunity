// Aportunity - Lógica Principal

// Estado global da aplicação
let dadosCarteira = [];
let dadosAporte = {
    patrimonio: 0,
    aporteMensal: 0
};
let overridesAporte = {};

/**
 * Mostra um toast de notificação
 */
function mostrarToast(mensagem, tipo = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = mensagem;
    toast.className = `toast ${tipo} show`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

/**
 * Formata número para BRL
 */
function formatarBRL(valor) {
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
    }).format(valor);
}

/**
 * Formata percentuais para pt-BR com vírgula e sinal %
 */
function formatPercent(valor) {
    if (valor === null || valor === undefined || isNaN(valor)) return '--';
    try {
        return new Intl.NumberFormat('pt-BR', { style: 'percent', minimumFractionDigits: 2 }).format(valor / 100);
    } catch (e) {
        return `${valor}%`;
    }
}

/**
 * Parse de valor monetário brasileiro
 */
function parseValorBR(string) {
    if (!string) return NaN;
    
    // Remove R$, espaços e pontos de milhar
    let valorLimpo = string.toString()
        .replace(/R\$/g, '')
        .replace(/\s/g, '')
        .replace(/\./g, '');
    
    // Substitui vírgula por ponto
    valorLimpo = valorLimpo.replace(',', '.');
    
    const numero = Number(valorLimpo);
    return numero;
}

/**
 * Lê e parseia um arquivo CSV
 */
function lerCSV(textoCSV) {
    try {
        // Separa linhas por \n ou \r\n
        const linhas = textoCSV.split(/\r?\n/).filter(linha => linha.trim());
        
        if (linhas.length < 2) {
            throw new Error('CSV vazio ou inválido');
        }
        
        // Primeira linha é o cabeçalho
        const cabecalho = linhas[0].split(',').map(col => col.trim().replace(/"/g, ''));
        
        // Mapeia as demais linhas (tratando casos onde valores contenham vírgulas,
        // como números no formato BR: "10.042,10" que provocariam colunas extras)
        const dados = [];
        for (let i = 1; i < linhas.length; i++) {
            // Quebrar inicialmente e limpar aspas/espacos
            let valores = linhas[i].split(',').map(val => val.trim().replace(/"/g, ''));

            // Se houver mais valores que colunas do cabeçalho,
            // juntar os valores excedentes na última coluna (preserva vírgulas dentro do campo)
            if (valores.length > cabecalho.length) {
                const fix = [];
                // Copia valores até a penúltima coluna do cabeçalho
                for (let j = 0; j < cabecalho.length - 1; j++) {
                    fix.push(valores[j] || '');
                }
                // Junta o restante preservando as vírgulas internas
                const restante = valores.slice(cabecalho.length - 1).join(',');
                fix.push(restante);
                valores = fix;
            }

            const objeto = {};
            cabecalho.forEach((coluna, index) => {
                objeto[coluna] = valores[index] || '';
            });

            dados.push(objeto);
        }
        
        return dados;
    } catch (erro) {
        console.error('Erro ao parsear CSV:', erro);
        throw erro;
    }
}

/**
 * Carrega CSV via fetch
 */
async function carregarCSVviaFetch(url) {
    try {
        const resposta = await fetch(url);
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        const texto = await resposta.text();
        return lerCSV(texto);
    } catch (erro) {
        console.error(`Erro ao carregar ${url}:`, erro);
        throw erro;
    }
}

/**
 * Calcula os aportes sugeridos
 */
function calcularAportes(carteira, aporteMensal) {
    const resultado = [];

    // Calcular gaps positivos
    const itensComGap = [];
    carteira.forEach(item => {
        const gap = item.ideal - item.atual;
        if (gap > 0) {
            itensComGap.push({ tipo: item.tipo, gap: gap, ideal: item.ideal, atual: item.atual });
        }
    });

    if (itensComGap.length === 0) {
        carteira.forEach(item => resultado.push({ tipo: item.tipo, aporteSugerido: 0 }));
        return resultado;
    }

    // Separar itens com override (fixos) e flexíveis
    const fixos = [];
    const flexiveis = [];
    itensComGap.forEach(item => {
        if (overridesAporte[item.tipo] !== undefined && !isNaN(Number(overridesAporte[item.tipo]))) {
            const val = Math.max(0, Number(overridesAporte[item.tipo]));
            fixos.push({ ...item, aporteFixo: Math.round(val * 100) / 100 });
        } else {
            flexiveis.push(item);
        }
    });

    const totalFixo = fixos.reduce((s, f) => s + f.aporteFixo, 0);
    let restante = Math.round((aporteMensal - totalFixo) * 100) / 100;

    if (restante < 0) {
        restante = 0;
        if (typeof mostrarToast === 'function') mostrarToast('Soma dos aportes fixos excede o total disponível; outros aportes foram zerados.', 'warning');
    }

    const somaGapsFlex = flexiveis.reduce((s, it) => s + it.gap, 0);

    const aportes = [];
    // Alocar fixos
    fixos.forEach(f => aportes.push({ tipo: f.tipo, aporteSugerido: Math.round(f.aporteFixo * 100) / 100 }));

    // Alocar restante para flexíveis
    if (somaGapsFlex > 0) {
        flexiveis.forEach(it => {
            const aporte = Math.round((restante * it.gap / somaGapsFlex) * 100) / 100;
            aportes.push({ tipo: it.tipo, aporteSugerido: aporte });
        });
    } else {
        flexiveis.forEach(it => aportes.push({ tipo: it.tipo, aporteSugerido: 0 }));
    }

    // Ajuste residual
    let somaAportes = aportes.reduce((s, a) => s + a.aporteSugerido, 0);
    const diferenca = Math.round((aporteMensal - somaAportes) * 100) / 100;
    if (Math.abs(diferenca) > 0.001 && aportes.length > 0) {
        const indiceFlex = aportes.findIndex(a => overridesAporte[a.tipo] === undefined);
        const alvo = indiceFlex >= 0 ? indiceFlex : 0;
        aportes[alvo].aporteSugerido = Math.round((aportes[alvo].aporteSugerido + diferenca) * 100) / 100;
    }

    // Normalizar
    function normalizarAportes(aportesArr) {
        for (let iter = 0; iter < 5; iter++) {
            let somaNeg = 0, somaPos = 0;
            aportesArr.forEach(a => { if (a.aporteSugerido < 0) somaNeg += Math.abs(a.aporteSugerido); else somaPos += a.aporteSugerido; });
            if (somaNeg === 0) break;
            aportesArr.forEach(a => { if (a.aporteSugerido < 0) a.aporteSugerido = 0; });
            if (somaPos <= 0) break;
            const fator = Math.max(0, (somaPos - somaNeg) / somaPos);
            aportesArr.forEach(a => { if (a.aporteSugerido > 0) a.aporteSugerido = Math.round((a.aporteSugerido * fator) * 100) / 100; });
        }
    }

    normalizarAportes(aportes);

    // Adicionar itens sem gap
    carteira.forEach(item => { const ja = aportes.find(a => a.tipo === item.tipo); if (!ja) resultado.push({ tipo: item.tipo, aporteSugerido: 0 }); });

    return [...aportes, ...resultado.filter(r => !aportes.find(a => a.tipo === r.tipo))];
}

/**
 * Renderiza a tabela da carteira
 */
function renderCarteira(carteiraComAportes) {
    const tbody = document.getElementById('carteiraBody');
    tbody.innerHTML = '';

    const novoTotal = dadosAporte.patrimonio + dadosAporte.aporteMensal;

    carteiraComAportes.forEach((item, index) => {
        const tr = document.createElement('tr');
        if (item.aporteSugerido > 0) tr.classList.add('com-aporte');

        const valorAtual = (dadosAporte.patrimonio * item.atual / 100) || 0;
        const aporte = item.aporteSugerido || 0;
        const previstoPercent = novoTotal > 0 ? ((valorAtual + aporte) / novoTotal) * 100 : 0;

        tr.innerHTML = `
            <td>${item.tipo}</td>
            <td>${formatPercent(item.ideal)}</td>
            <td>${formatPercent(item.atual)}</td>
            <td>${formatarBRL(valorAtual)}</td>
            <td class="valor-aporte" data-tipo="${item.tipo}">
                <span class="valor-display">${formatarBRL(aporte)}</span>
                <input type="number" class="valor-input" value="${aporte.toFixed(2)}" step="0.01" style="display:none;">
            </td>
            <td>${formatPercent(previstoPercent)}</td>
            <td>
                <button class="btn-editar" data-tipo="${item.tipo}" data-index="${index}">Editar</button>
            </td>
        `;

        tbody.appendChild(tr);
    });

    // Atualizar resumo
    const somaAportes = carteiraComAportes.reduce((sum, item) => sum + item.aporteSugerido, 0);
    document.getElementById('patrimonioAtual').textContent = formatarBRL(dadosAporte.patrimonio);
    document.getElementById('aporteTotal').textContent = formatarBRL(dadosAporte.aporteMensal);
    document.getElementById('somaAportes').textContent = formatarBRL(somaAportes);

    // Adicionar eventos de edição
    document.querySelectorAll('.btn-editar').forEach(btn => btn.addEventListener('click', handleEditarAporte));
}
 

/**
 * Handler para editar aporte
 */
function handleEditarAporte(e) {
    const btn = e.target;
    const tipo = btn.dataset.tipo;
    const td = document.querySelector(`.valor-aporte[data-tipo="${tipo}"]`);
    const display = td.querySelector('.valor-display');
    const input = td.querySelector('.valor-input');
    
    if (btn.textContent === 'Editar') {
        // Modo edição
        display.style.display = 'none';
        input.style.display = 'inline-block';
        input.focus();
        input.select();
        btn.textContent = 'Salvar';
    } else {
        // Salvar
        const novoValor = parseFloat(input.value) || 0;
        overridesAporte[tipo] = novoValor;
        
        // Salvar no localStorage
        localStorage.setItem('aportes_overrides', JSON.stringify(overridesAporte));
        
        // Recalcular
        processarDados();
        
        mostrarToast(`Aporte de ${tipo} atualizado!`, 'success');
    }
}

/**
 * Processa os dados e renderiza
 */
function processarDados() {
    if (dadosCarteira.length === 0 || dadosAporte.patrimonio === 0) {
        return;
    }
    
    const aportes = calcularAportes(dadosCarteira, dadosAporte.aporteMensal);
    
    // Mesclar dados
    const carteiraCompleta = dadosCarteira.map(item => {
        const aporte = aportes.find(a => a.tipo === item.tipo);
        return {
            ...item,
            aporteSugerido: aporte ? aporte.aporteSugerido : 0
        };
    });
    
    renderCarteira(carteiraCompleta);
}

/**
 * Carrega os CSVs
 */
async function carregarCSVs() {
    try {
        mostrarToast('Carregando dados...', 'info');
        
        // Carregar carteira
        const dadosCarteiraCSV = await carregarCSVviaFetch(NOME_ARQUIVO_CARTEIRA);
        dadosCarteira = dadosCarteiraCSV.map(item => ({
            tipo: item.Tipo.trim(),
            ideal: parseFloat(item['% Ideal']) || 0,
            atual: parseFloat(item['% Atual']) || 0
        }));
        
        // Carregar aporte
        const dadosAporteCSV = await carregarCSVviaFetch(NOME_ARQUIVO_APORTE);
        dadosAporteCSV.forEach(item => {
            if (item.Tipo.includes('Patrimônio')) {
                dadosAporte.patrimonio = parseValorBR(item['Valor R$']);
            } else if (item.Tipo.includes('aportar')) {
                dadosAporte.aporteMensal = parseValorBR(item['Valor R$']);
            }
        });
        
        // Carregar overrides do localStorage
        const overridesSalvos = localStorage.getItem('aportes_overrides');
        if (overridesSalvos) {
            overridesAporte = JSON.parse(overridesSalvos);
        }
        
        processarDados();
        
        mostrarToast('Dados carregados com sucesso!', 'success');
    } catch (erro) {
        mostrarToast(`Erro ao carregar dados: ${erro.message}`, 'error');
        console.error('Erro:', erro);
    }
}

/**
 * Cria placeholders iniciais na tabela
 */
function criarPlaceholders() {
    const tbody = document.getElementById('carteiraBody');
    const tipos = ['Renda Fixa', 'FIIs', 'Ações', 'Stocks', 'Cripto'];
    
    tipos.forEach((tipo, index) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${tipo}</td>
            <td>--</td>
            <td>--</td>
            <td>R$ 0,00</td>
            <td class="valor-aporte" data-tipo="${tipo}">
                <span class="valor-display">R$ 0,00</span>
                <input type="number" class="valor-input" value="0" step="0.01" style="display:none;">
            </td>
            <td>
                <button class="btn-editar" data-tipo="${tipo}" data-index="${index}">Editar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

/**
 * Inicia a aplicação
 */
function iniciarApp() {
    console.log('App iniciado');
    
    // Criar placeholders iniciais
    criarPlaceholders();
    
    // Adicionar evento ao botão
    const btnCarregar = document.getElementById('btnCarregarCSVs');
    if (btnCarregar) {
        btnCarregar.addEventListener('click', carregarCSVs);
    }
    
    // Carregar automaticamente
    carregarCSVs();
}

// Anexar ao evento window.onload
window.onload = iniciarApp;