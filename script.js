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
const emailClienteInput = document.getElementById('email-cliente'); 

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

// Atualização leve para não travar o teclado ou toque no celular
formOrcamento.addEventListener('input', () => { if (inputHiddenPreco) inputHiddenPreco.value = calcularPreco(); });
formOrcamento.addEventListener('change', () => { if (inputHiddenPreco) inputHiddenPreco.value = calcularPreco(); });

// Envio direto adaptado para Mobile
formOrcamento.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const keyWeb3 = document.getElementById('web3forms-key').value;
    const precoFinal = calcularPreco();
    
    // Força a limpeza de atributos obrigatórios ocultos que travam o Android
    if (inputHiddenPreco) {
        inputHiddenPreco.removeAttribute('required');
        inputHiddenPreco.value = precoFinal;
    }
    
    const templateHTMLCliente = `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; border: 1px solid #eee; padding: 20px; border-radius: 8px;">
            <h2 style="color: #0f172a; text-align: center;">EXATA STORE</h2>
            <p>Olá, <strong>${nomeClienteInput.value}</strong>!</p>
            <p>Aqui está a estimativa de investimento para o seu projeto:</p>
            <div style="background: #f8fafc; padding: 15px; text-align: center; font-size: 22px; font-weight: bold; color: #0f172a; border-radius: 6px; margin: 15px 0;">
                ${precoFinal}
            </div>
            <p><strong>Resumo do Show:</strong></p>
            <ul>
                <li>Músicas: ${qtdFaixasInput.value}</li>
                <li>Gênero: ${resumoGenero ? resumoGenero.innerText : ''}</li>
                <li>Setup: ${resumoPorte ? resumoPorte.innerText : ''}</li>
                <li>Urgente: ${resumoPrazo ? resumoPrazo.innerText : ''}</li>
            </ul>
            <p style="font-size: 11px; color: #94a3b8; margin-top: 20px;">* Válido por 15 dias. Entraremos em contato via WhatsApp (${whatsClienteInput.value}).</p>
        </div>
    `;

    const dadosBriefing = {
        access_key: keyWeb3,
        email: emailClienteInput.value,
        subject: "⚡ ORÇAMENTO EXATA STORE: " + nomeClienteInput.value.toUpperCase(),
        from_name: "Exata Store",
        
        "Artista": nomeClienteInput.value,
        "WhatsApp": whatsClienteInput.value,
        "Preço": precoFinal,

        _replyto: emailClienteInput.value,
        _autoresponse: templateHTMLCliente
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
    .catch(() => alert("Erro de conexão no celular."));
});

// Inicializa o valor oculto
if (inputHiddenPreco) {
    inputHiddenPreco.removeAttribute('required');
    inputHiddenPreco.value = calcularPreco();
}