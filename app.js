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
 * Parse de percentual (remove % e converte para número)
 */
function parsePercent(string) {
    if (!string) return NaN;
    
    // Remove % e espaços, substitui vírgula por ponto
    let valorLimpo = string.toString()
        .replace(/%/g, '')
        .replace(/\s/g, '')
        .replace(',', '.');
    
    const numero = parseFloat(valorLimpo);
    return isNaN(numero) ? 0 : numero;
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
 * Calcula os aportes sugeridos seguindo o algoritmo correto
 * Algoritmo: distribuir aporte proporcional ao déficit (somente quem está abaixo do ideal)
 */
function calcularAportes(carteira, aporteMensal, patrimonioTotal) {
    const T = patrimonioTotal;
    const A = aporteMensal;
    const S = T + A; // Patrimônio depois do aporte

    console.log('=== CÁLCULO DE APORTES ===');
    console.log('Patrimônio Total:', T);
    console.log('Aporte Mensal:', A);
    console.log('Patrimônio Futuro:', S);

    // 1) Calcular valor atual e déficit de cada classe
    const dadosCalculados = carteira.map(item => {
        const ideal_percent = item.ideal / 100;
        const atual_percent = item.atual / 100;
        
        const valorAntes = T * atual_percent;
        const alvo = S * ideal_percent;
        const deficit = Math.max(0, alvo - valorAntes);

        console.log(`${item.tipo}: ideal=${item.ideal}%, atual=${item.atual}%, déficit=R$ ${deficit.toFixed(2)}`);

        return {
            tipo: item.tipo,
            valorAntes: valorAntes,
            alvo: alvo,
            deficit: deficit,
            isFixo: overridesAporte[item.tipo] !== undefined && !isNaN(Number(overridesAporte[item.tipo]))
        };
    });

    // 2) Separar fixos (overrides manuais) e flexíveis
    const fixos = dadosCalculados.filter(d => d.isFixo);
    const flexiveis = dadosCalculados.filter(d => !d.isFixo);

    // 3) Processar fixos (aportes manuais)
    let totalFixo = 0;
    const aportes = [];

    fixos.forEach(item => {
        const aporteFixo = Math.max(0, Number(overridesAporte[item.tipo]));
        totalFixo += aporteFixo;
        aportes.push({ tipo: item.tipo, aporteSugerido: aporteFixo });
    });

    // 4) Calcular restante para distribuir entre flexíveis
    let aporteRestante = A - totalFixo;

    if (aporteRestante < 0) {
        aporteRestante = 0;
        if (typeof mostrarToast === 'function') {
            mostrarToast('Soma dos aportes fixos excede o total disponível!', 'warning');
        }
    }

    // 5) Somar déficits dos flexíveis
    const somaDeficits = flexiveis.reduce((sum, item) => sum + item.deficit, 0);
    console.log('Soma Déficits:', somaDeficits);

    // 6) Ratear aporte proporcional ao déficit (somente quem está abaixo do ideal)
    if (somaDeficits === 0) {
        // Nenhum flexível tem déficit -> aporte zero para todos
        flexiveis.forEach(item => {
            aportes.push({ tipo: item.tipo, aporteSugerido: 0 });
        });
    } else {
        // Distribuir proporcional ao déficit
        flexiveis.forEach(item => {
            const aporte = (aporteRestante * item.deficit) / somaDeficits;
            console.log(`${item.tipo}: aporte = ${aporte.toFixed(2)}`);
            aportes.push({ tipo: item.tipo, aporteSugerido: aporte });
        });
    }

    // 7) Arredondamento e ajuste residual
    // Arredondar cada aporte para 2 casas decimais
    aportes.forEach(a => {
        a.aporteSugerido = Math.round(a.aporteSugerido * 100) / 100;
    });

    // Calcular diferença residual
    const somaAportes = aportes.reduce((sum, a) => sum + a.aporteSugerido, 0);
    const diff = Math.round((A - somaAportes) * 100) / 100;

    // Adicionar diferença ao item com maior déficit (entre os flexíveis)
    if (Math.abs(diff) > 0.001 && flexiveis.length > 0) {
        // Encontrar flexível com maior déficit
        const flexiveisOrdenados = [...flexiveis].sort((a, b) => b.deficit - a.deficit);
        const tipoMaiorDeficit = flexiveisOrdenados[0].tipo;
        
        const itemAjuste = aportes.find(a => a.tipo === tipoMaiorDeficit);
        if (itemAjuste) {
            itemAjuste.aporteSugerido = Math.round((itemAjuste.aporteSugerido + diff) * 100) / 100;
        }
    }

    console.log('=== APORTES FINAIS ===');
    aportes.forEach(a => console.log(`${a.tipo}: R$ ${a.aporteSugerido.toFixed(2)}`));

    return aportes;
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

        const isOverride = overridesAporte[item.tipo] !== undefined;
        if (isOverride) tr.classList.add('override-ativo');

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
        console.warn('Dados insuficientes para processar');
        return;
    }

    console.log('=== PROCESSANDO DADOS ===');
    console.log('Carteira:', dadosCarteira);
    console.log('Patrimônio:', dadosAporte.patrimonio);
    console.log('Aporte Mensal:', dadosAporte.aporteMensal);

    const aportes = calcularAportes(dadosCarteira, dadosAporte.aporteMensal, dadosAporte.patrimonio);

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
        console.log('CSV Carteira carregado:', dadosCarteiraCSV);
        
        dadosCarteira = dadosCarteiraCSV.map(item => {
            const tipo = item.Tipo.trim();
            const ideal = parsePercent(item['% Ideal']);
            const atual = parsePercent(item['% Atual']);
            
            console.log(`Parseando: ${tipo} - ideal: ${ideal}%, atual: ${atual}%`);
            
            return {
                tipo: tipo,
                ideal: ideal,
                atual: atual
            };
        });

        // Carregar aporte
        const dadosAporteCSV = await carregarCSVviaFetch(NOME_ARQUIVO_APORTE);
        console.log('CSV Aporte carregado:', dadosAporteCSV);
        
        dadosAporteCSV.forEach(item => {
            if (item.Tipo.includes('Patrimônio')) {
                dadosAporte.patrimonio = parseValorBR(item['Valor R$']);
                console.log('Patrimônio parseado:', dadosAporte.patrimonio);
            } else if (item.Tipo.includes('aportar')) {
                dadosAporte.aporteMensal = parseValorBR(item['Valor R$']);
                console.log('Aporte Mensal parseado:', dadosAporte.aporteMensal);
            }
        });

        // Carregar overrides do localStorage
        const overridesSalvos = localStorage.getItem('aportes_overrides');
        if (overridesSalvos) {
            overridesAporte = JSON.parse(overridesSalvos);
            console.log('Overrides carregados:', overridesAporte);
        }

        processarDados();

        mostrarToast('Dados carregados com sucesso!', 'success');
    } catch (erro) {
        mostrarToast(`Erro ao carregar dados: ${erro.message}`, 'error');
        console.error('Erro detalhado:', erro);
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
            <td>--</td>
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

    const btnLimpar = document.getElementById('btnLimparAjustes');
    if (btnLimpar) {
        btnLimpar.addEventListener('click', () => {
            overridesAporte = {};
            localStorage.removeItem('aportes_overrides');
            processarDados();
            mostrarToast('Ajustes manuais limpos!', 'success');
        });
    }

    // Carregar automaticamente
    carregarCSVs();
}

// Anexar ao evento window.onload
window.onload = iniciarApp;