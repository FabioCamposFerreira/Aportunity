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
        
        // Mapeia as demais linhas
        const dados = [];
        for (let i = 1; i < linhas.length; i++) {
            const valores = linhas[i].split(',').map(val => val.trim().replace(/"/g, ''));
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
    let somaGaps = 0;
    const itensComGap = [];
    
    carteira.forEach(item => {
        const gap = item.ideal - item.atual;
        if (gap > 0) {
            somaGaps += gap;
            itensComGap.push({
                tipo: item.tipo,
                gap: gap,
                ideal: item.ideal,
                atual: item.atual
            });
        }
    });
    
    // Se não há gaps positivos, não aportar
    if (somaGaps === 0) {
        carteira.forEach(item => {
            resultado.push({
                tipo: item.tipo,
                aporteSugerido: 0
            });
        });
        return resultado;
    }
    
    // Calcular aportes proporcionais
    let somaAportes = 0;
    const aportes = [];
    
    itensComGap.forEach(item => {
        let aporte = Math.round((aporteMensal * item.gap / somaGaps) * 100) / 100;
        
        // Verificar se há override
        if (overridesAporte[item.tipo] !== undefined) {
            aporte = overridesAporte[item.tipo];
        }
        
        aportes.push({
            tipo: item.tipo,
            aporteSugerido: aporte
        });
        somaAportes += aporte;
    });
    
    // Ajustar diferença residual (distribuir nos maiores gaps)
    const diferenca = aporteMensal - somaAportes;
    if (Math.abs(diferenca) > 0.01 && aportes.length > 0) {
        aportes[0].aporteSugerido += diferenca;
        aportes[0].aporteSugerido = Math.round(aportes[0].aporteSugerido * 100) / 100;
    }
    
    // Adicionar itens sem gap
    carteira.forEach(item => {
        const jaTem = aportes.find(a => a.tipo === item.tipo);
        if (!jaTem) {
            resultado.push({
                tipo: item.tipo,
                aporteSugerido: 0
            });
        }
    });
    
    return [...aportes, ...resultado.filter(r => !aportes.find(a => a.tipo === r.tipo))];
}

/**
 * Renderiza a tabela da carteira
 */
function renderCarteira(carteiraComAportes) {
    const tbody = document.getElementById('carteiraBody');
    tbody.innerHTML = '';
    
    carteiraComAportes.forEach((item, index) => {
        const tr = document.createElement('tr');
        if (item.aporteSugerido > 0) {
            tr.classList.add('com-aporte');
        }
        
        const valorAtual = (dadosAporte.patrimonio * item.atual / 100) || 0;
        
        tr.innerHTML = `
            <td>${item.tipo}</td>
            <td>${item.ideal}%</td>
            <td>${item.atual}%</td>
            <td>${formatarBRL(valorAtual)}</td>
            <td class="valor-aporte" data-tipo="${item.tipo}">
                <span class="valor-display">${formatarBRL(item.aporteSugerido)}</span>
                <input type="number" class="valor-input" value="${item.aporteSugerido.toFixed(2)}" step="0.01" style="display:none;">
            </td>
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
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', handleEditarAporte);
    });
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
