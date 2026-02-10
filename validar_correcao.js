// Script de validação do algoritmo corrigido
// Baseado nos dados fornecidos pelo usuário

// Mock data
const carteira = [
    { tipo: 'Renda Fixa', ideal: 25, atual: 24.91 },
    { tipo: 'FIIs', ideal: 25, atual: 24.03 },
    { tipo: 'Ações', ideal: 22, atual: 22.83 },
    { tipo: 'Stocks', ideal: 23, atual: 22.23 },
    { tipo: 'Cripto', ideal: 5, atual: 5.99 }
];

const dadosAporte = {
    patrimonio: 10042.10,
    aporteMensal: 240.00
};

const overridesAporte = {}; // Sem overrides para este teste

/**
 * Algoritmo CORRETO conforme pseudocódigo fornecido
 */
function calcularAportes(carteira, aporteMensal, patrimonioTotal) {
    const T = patrimonioTotal;
    const A = aporteMensal;
    const S = T + A; // Patrimônio depois do aporte

    console.log(`\n=== ENTRADA ===`);
    console.log(`Patrimônio Total (T): R$ ${T.toFixed(2)}`);
    console.log(`Aporte Mensal (A): R$ ${A.toFixed(2)}`);
    console.log(`Patrimônio Futuro (S = T + A): R$ ${S.toFixed(2)}`);

    // 1) Calcular valor atual e déficit de cada classe
    console.log(`\n=== PASSO 1: Calcular déficits ===`);
    
    const dadosCalculados = carteira.map(item => {
        const ideal_percent = item.ideal / 100;
        const atual_percent = item.atual / 100;
        
        const valorAntes = T * atual_percent;
        const alvo = S * ideal_percent;
        const deficit = Math.max(0, alvo - valorAntes);

        console.log(`\n${item.tipo}:`);
        console.log(`  % Ideal: ${item.ideal}% | % Atual: ${item.atual}%`);
        console.log(`  Valor Antes: R$ ${valorAntes.toFixed(2)}`);
        console.log(`  Alvo: R$ ${alvo.toFixed(2)}`);
        console.log(`  Déficit: R$ ${deficit.toFixed(2)}`);

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

    console.log(`\n=== PASSO 2: Separar fixos e flexíveis ===`);
    console.log(`Fixos: ${fixos.length}`);
    console.log(`Flexíveis: ${flexiveis.length}`);

    // 3) Processar fixos (aportes manuais)
    let totalFixo = 0;
    const aportes = [];

    fixos.forEach(item => {
        const aporteFixo = Math.max(0, Number(overridesAporte[item.tipo]));
        totalFixo += aporteFixo;
        aportes.push({ tipo: item.tipo, aporteSugerido: aporteFixo });
    });

    console.log(`Total Fixo: R$ ${totalFixo.toFixed(2)}`);

    // 4) Calcular restante para distribuir entre flexíveis
    let aporteRestante = A - totalFixo;

    if (aporteRestante < 0) {
        aporteRestante = 0;
        console.log(`AVISO: Soma dos aportes fixos excede o total disponível!`);
    }

    console.log(`Aporte Restante para Flexíveis: R$ ${aporteRestante.toFixed(2)}`);

    // 5) Somar déficits dos flexíveis
    const somaDeficits = flexiveis.reduce((sum, item) => sum + item.deficit, 0);
    
    console.log(`\n=== PASSO 3: Soma dos déficits ===`);
    console.log(`Soma Déficits: R$ ${somaDeficits.toFixed(2)}`);

    // 6) Ratear aporte proporcional ao déficit (somente quem está abaixo do ideal)
    console.log(`\n=== PASSO 4: Distribuição proporcional ===`);
    
    if (somaDeficits === 0) {
        // Nenhum flexível tem déficit -> aporte zero para todos
        console.log(`Nenhum déficit encontrado. Aportes = 0 para todos flexíveis.`);
        flexiveis.forEach(item => {
            aportes.push({ tipo: item.tipo, aporteSugerido: 0 });
        });
    } else {
        // Distribuir proporcional ao déficit
        flexiveis.forEach(item => {
            const aporte = (aporteRestante * item.deficit) / somaDeficits;
            console.log(`${item.tipo}: ${aporteRestante.toFixed(2)} * ${item.deficit.toFixed(2)} / ${somaDeficits.toFixed(2)} = R$ ${aporte.toFixed(2)}`);
            aportes.push({ tipo: item.tipo, aporteSugerido: aporte });
        });
    }

    // 7) Arredondamento e ajuste residual
    console.log(`\n=== PASSO 5: Arredondamento ===`);
    
    // Arredondar cada aporte para 2 casas decimais
    aportes.forEach(a => {
        const antes = a.aporteSugerido;
        a.aporteSugerido = Math.round(a.aporteSugerido * 100) / 100;
        console.log(`${a.tipo}: ${antes.toFixed(4)} → ${a.aporteSugerido.toFixed(2)}`);
    });

    // Calcular diferença residual
    const somaAportes = aportes.reduce((sum, a) => sum + a.aporteSugerido, 0);
    const diff = Math.round((A - somaAportes) * 100) / 100;

    console.log(`\nSoma Aportes: R$ ${somaAportes.toFixed(2)}`);
    console.log(`Diferença Residual: R$ ${diff.toFixed(2)}`);

    // Adicionar diferença ao item com maior déficit (entre os flexíveis)
    if (Math.abs(diff) > 0.001 && flexiveis.length > 0) {
        console.log(`\nAjustando diferença residual...`);
        
        // Encontrar flexível com maior déficit
        const flexiveisOrdenados = flexiveis.sort((a, b) => b.deficit - a.deficit);
        const tipoMaiorDeficit = flexiveisOrdenados[0].tipo;
        
        console.log(`Maior déficit: ${tipoMaiorDeficit}`);
        
        const itemAjuste = aportes.find(a => a.tipo === tipoMaiorDeficit);
        if (itemAjuste) {
            const antes = itemAjuste.aporteSugerido;
            itemAjuste.aporteSugerido = Math.round((itemAjuste.aporteSugerido + diff) * 100) / 100;
            console.log(`${tipoMaiorDeficit}: ${antes.toFixed(2)} + ${diff.toFixed(2)} = ${itemAjuste.aporteSugerido.toFixed(2)}`);
        }
    }

    return aportes;
}

// Executar teste
console.log('==================================================');
console.log('   VALIDAÇÃO DO ALGORITMO CORRIGIDO');
console.log('==================================================');

const resultado = calcularAportes(carteira, dadosAporte.aporteMensal, dadosAporte.patrimonio);

console.log(`\n=== RESULTADO FINAL ===`);
console.log('\nAportes calculados:');
let somaTotal = 0;
resultado.forEach(r => {
    console.log(`  ${r.tipo}: R$ ${r.aporteSugerido.toFixed(2)}`);
    somaTotal += r.aporteSugerido;
});

console.log(`\nSOMA TOTAL: R$ ${somaTotal.toFixed(2)}`);
console.log(`APORTE MENSAL: R$ ${dadosAporte.aporteMensal.toFixed(2)}`);
console.log(`DIFERENÇA: R$ ${Math.abs(somaTotal - dadosAporte.aporteMensal).toFixed(2)}`);

if (Math.abs(somaTotal - dadosAporte.aporteMensal) < 0.01) {
    console.log('\n✅ VALIDAÇÃO PASSOU! Soma bate com aporte mensal.');
} else {
    console.log('\n❌ VALIDAÇÃO FALHOU! Soma não bate com aporte mensal.');
}

console.log('\n==================================================');