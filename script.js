const CONFIG_PRECO_BASE = 150.00;
const MULTIPLICADORES_GENERO = { leve: 1.0, medio: 1.3, pesado: 1.6 };
const MULTIPLICADORES_PORTE = { pequeno: 1.0, intermediario: 1.5, profissional: 2.2 };
const FATOR_URGENCIA = 1.3;

const formOrcamento = document.getElementById('form-orcamento');
const qtdFaixasInput = document.getElementById('quantidade-faixas');
const generoSelect = document.getElementById('genero-musical');
const prazoSelect = document.getElementById('prazo-entrega');
const nomeClienteInput = document.getElementById('nome-cliente');
const whatsClienteInput = document.getElementById('whats-cliente');

const resumoFaixas = document.getElementById('resumo-faixas');
const resumoGenero = document.getElementById('resumo-genero');
const resumoPorte = document.getElementById('resumo-porte');
const resumoPrazo = document.getElementById('resumo-prazo');
const inputHiddenPreco = document.getElementById('input-hidden-preco');

function calcularPreco() {
    const faixas = parseInt(qtdFaixasInput.value) || 1;
    const genero = generoSelect.value;
    const elementoPorte = document.querySelector('input[name="porte-projeto"]:checked');
    const porte = elementoPorte ? elementoPorte.value : 'pequeno';
    const prazo = prazoSelect.value;

    let subtotal = faixas * CONFIG_PRECO_BASE;
    subtotal *= MULTIPLICADORES_GENERO[genero] || 1.0;
    subtotal *= MULTIPLICADORES_PORTE[porte] || 1.0;
    if (prazo === 'urgente') subtotal *= FATOR_URGENCIA;

    if (resumoFaixas) resumoFaixas.innerText = faixas;
    if (resumoGenero) resumoGenero.innerText = generoSelect.options[generoSelect.selectedIndex].text.split('(')[0].trim();
    
    const labelsPorte = { pequeno: "Pequeno", intermediario: "Intermediário", profissional: "Profissional" };
    if (resumoPorte) resumoPorte.innerText = labelsPorte[porte] || "Pequeno";
    if (resumoPrazo) resumoPrazo.innerText = prazo === 'urgente' ? "Sim (Urgente)" : "Não (Normal)";

    return "R$ " + subtotal.toFixed(2).replace('.', ',');
}

formOrcamento.addEventListener('input', () => { if (inputHiddenPreco) inputHiddenPreco.value = calcularPreco(); });
formOrcamento.addEventListener('change', () => { if (inputHiddenPreco) inputHiddenPreco.value = calcularPreco(); });

formOrcamento.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const keyWeb3 = document.getElementById('web3forms-key').value;
    const precoFinal = calcularPreco();
    
    if (inputHiddenPreco) {
        inputHiddenPreco.removeAttribute('required');
        inputHiddenPreco.value = precoFinal;
    }

    // MAPEIA EXATAMENTE O TEXTO QUE O CLIENTE SELECIONOU PARA IR DETALHADO NO E-MAIL
    const generoSelecionado = generoSelect.options[generoSelect.selectedIndex].text;
    const elementoPorte = document.querySelector('input[name="porte-projeto"]:checked');
    const labelsPorte = { pequeno: "Pequeno", intermediario: "Intermediário", profissional: "Profissional" };
    const porteSelecionado = elementoPorte ? labelsPorte[elementoPorte.value] : "Pequeno";
    const urgenciaSelecionada = prazoSelect.options[prazoSelect.selectedIndex].text;

    const dadosBriefing = {
        access_key: keyWeb3,
        subject: "⚡ NOVO BRIEFING: " + nomeClienteInput.value.toUpperCase(),
        from_name: "Exata Store",
        
        "1. Produtor / Artista": nomeClienteInput.value,
        "2. WhatsApp de Contato": whatsClienteInput.value,
        "3. Quantidade de Músicas": qtdFaixasInput.value + " faixa(s)",
        "4. Gênero Escolhido": generoSelecionado,
        "5. Porte do Setup": porteSelecionado,
        "6. Regime de Urgência": urgenciaSelecionada,
        "7. Preço Calculado pelo Sistema": precoFinal
    };

    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dadosBriefing)
    })
    .then(response => {
        if (response.ok) {
            alert("✓ Orçamento enviado com sucesso!");
            formOrcamento.reset();
            if (inputHiddenPreco) inputHiddenPreco.value = calcularPreco();
        } else {
            alert("Erro ao enviar. Verifique os campos.");
        }
    })
    .catch(() => alert("Erro de conexão."));
});

if (inputHiddenPreco) {
    inputHiddenPreco.removeAttribute('required');
    inputHiddenPreco.value = calcularPreco();
}