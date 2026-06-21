// MATRIZ DE PRECIFICAÇÃO INTERNA SECRETA
const CONFIG_PRECO_BASE = 150.00;
const MULTIPLICADORES_GENERO = { leve: 1.0, medio: 1.3, pesado: 1.6 };
const MULTIPLICADORES_PORTE = { pequeno: 1.0, intermediario: 1.5, profesional: 2.2 };
const FATOR_URGENCIA = 1.3;

// NÚMERO DO WHATSAPP DA EXATA STORE PARA O RELATÓRIO
const NUMERO_DESTINO_EXATA = "5512988114462"; 

// CAPTURA DOS ELEMENTOS DA DOM
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

// LOGICA DE ATUALIZAÇÃO DOS DETALHES TÉCNICOS E CÁLCULO OCULTO
function processarFichaTecnica() {
    const faixas = parseInt(qtdFaixasInput.value) || 1;
    const genero = generoSelect.value;
    const elementoPorte = document.querySelector('input[name="porte-projeto"]:checked');
    const porte = elementoPorte ? elementoPorte.value : 'pequeno';
    const prazo = prazoSelect.value;

    // Executa o cálculo silencioso nos bastidores
    let subtotal = faixas * CONFIG_PRECO_BASE;
    subtotal *= MULTIPLICADORES_GENERO[genero];
    subtotal *= MULTIPLICADORES_PORTE[porte] || 1.0;
    if (prazo === 'urgente') subtotal *= FATOR_URGENCIA;

    // Exibe as configurações na barra lateral (Sem mostrar preço na tela)
    resumoFaixas.innerText = faixas;
    resumoGenero.innerText = generoSelect.options[generoSelect.selectedIndex].text.split('(')[0].trim();
    
    const labelsPorte = { pequeno: "Pequeno", intermediario: "Intermediário", profissional: "Profissional" };
    resumoPorte.innerText = labelsPorte[porte];
    resumoPrazo.innerText = prazo === 'urgente' ? "Sim (Urgente)" : "Não (Normal)";

    // Guarda o valor estritamente dentro do campo oculto do formulário
    if (inputHiddenPreco) {
        inputHiddenPreco.value = "R$ " + subtotal.toFixed(2).replace('.', ',');
    }
}

// CONFIGURAÇÃO DOS ESCUTADORES DINÂMICOS
qtdFaixasInput.addEventListener('input', processarFichaTecnica);
generoSelect.addEventListener('change', processarFichaTecnica);
prazoSelect.addEventListener('change', processarFichaTecnica);
formOrcamento.addEventListener('change', function(e) {
    if (e.target.name === 'porte-projeto') processarFichaTecnica();
});

// DISPARO ASSÍNCRONO DIRECT-TO-EMAIL (WEB3FORMS INVISÍVEL)
formOrcamento.addEventListener('submit', function(e) {
    e.preventDefault(); 

    const keyWeb3 = document.getElementById('web3forms-key').value;
    const nomeMaiusculo = nomeClienteInput.value.toUpperCase();
    
    // Organiza a estrutura limpa dos dados estruturados
    const dadosBriefing = {
        access_key: keyWeb3,
        subject: "⚠️ NOVO BRIEFING: " + nomeMaiusculo,
        "1. Destinatário Técnico": NUMERO_DESTINO_EXATA,
        "2. Produtor / Artista": nomeClienteInput.value,
        "3. WhatsApp do Solicitante": whatsClienteInput.value,
        "4. Músicas Cadastradas": qtdFaixasInput.value,
        "5. Gênero Mapeado": resumoGenero.innerText,
        "6. Porte do Setup": resumoPorte.innerText,
        "7. Regime Urgente": resumoPrazo.innerText,
        "8. PREÇO CALCULADO PELO SISTEMA": inputHiddenPreco.value
    };

    // Faz a requisição POST silenciosa
    fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(dadosBriefing)
    })
    .then(response => {
        if (response.ok) {
            alert("✓ Solicitação enviada com sucesso!\nSeus dados técnicos foram inseridos no painel da Exata Store. Nossa equipe entrará em contato via WhatsApp após a conferência do mapa.");
            formOrcamento.reset();
            processarFichaTecnica();
        } else {
            alert("Erro temporário no servidor de dados. Por favor, tente submeter novamente.");
        }
    })
    .catch(() => {
        alert("Falha de conectividade. Verifique sua conexão e tente novamente.");
    });
});

// Start automático da página
processarFichaTecnica();