// index.js - Lógica de cálculo de aportes

// Função para carregar dados do CSV
async function carregarDadosCSV(caminho) {
    try {
        const resposta = await fetch(caminho);
        const texto = await resposta.text();
        const linhas = texto.split('\n');
        const dados = [];
        for (let i = 1; i < linhas.length; i++) {
            const [tipo, valor] = linhas[i].split('',);
            dados.push({ tipo, valor: parseFloat(valor.replace('R$ ', '')) });
        }
        return dados;
    } catch (erro) {
        console.error('Erro ao carregar CSV:', erro);
        return [];
    }
}

// Função para calcular aporte ideal vs real
function calcularAportesIdeais(dadosIdeais, dadosReais) {
    const resultados = {};
    dadosIdeais.forEach(itemIdeal => {
        const itemReal = dadosReais.find(item => item.tipo === itemIdeal.tipo);
        if (itemReal) {
            const percentualIdeal = itemIdeal['% Ideal'] || 0;
            const percentualReal = (itemReal.valor / aporteTotal) * 100;
            resultados[itemIdeal.tipo] = {
                ideal: percentualIdeal,
                real: percentualReal,
                diferenca: percentualReal - percentualIdeal
            };
        }
    });
    return resultados;
}

// Função principal
async function main() {
    const dadosIdeais = await carregarDadosCSV('carteira.csv');
    const dadosReais = await carregarDadosCSV('aporte.csv');

    // Calcular total de aporte
    const aporteTotal = dadosReais.reduce((total, item) => total + item.valor, 0);

    // Calcular resultados
    const resultados = calcularAportesIdeais(dadosIdeais, dadosReais);

    // Exibir resultados na tela
    const tabela = document.getElementById('csv-table');
    tabela.innerHTML = '<table border="1">\n    <thead><tr><th>Tipo</th><th>Ideal (%)</th><th>Real (%)</th><th>Diferença (%)</th></tr></thead>\n    <tbody>';

    Object.entries(resultados).forEach(([tipo, dados]) => {
        tabela.innerHTML += `<tr><td>${tipo}</td><td>${dados.ideal.toFixed(2)}%</td><td>${dados.real.toFixed(2)}%</td><td>${dados.diferenca.toFixed(2)}%</td></tr>`;
    });

    tabela.innerHTML += '</tbody></table>';
}

// Iniciar aplicativo
document.addEventListener('DOMContentLoaded', main);