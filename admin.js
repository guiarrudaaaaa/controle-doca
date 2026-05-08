// admin.js - Painel de administração para edição de docas, pátio e previsões
// Responsável por gerenciar o estado local e sincronizar com Firestore

// Estado padrão para inicialização
const estadoPadrao = {
  out: { docas: [1,2,3,4,5,6].map(i => ({id: 'OUT-0' + i, status: 'livre', pct: 0, dt: '', comp: '', hora: ''})), patio: [], previsao: [] },
  in: { docas: [1,2,3,4,5,6].map(i => ({id: 'IN-0' + i, status: 'livre', pct: 0, dt: '', comp: '', hora: ''})), patio: [], previsao: [] }
};

// Estado atual e cache
let estado = JSON.parse(JSON.stringify(estadoPadrao));
let ultimoCarregamento = 0;
const CACHE_DURATION = 30000; // 30 segundos

// Carrega estado do Firestore com cache inteligente
async function carregarEstado() {
  const agora = Date.now();

  // Se temos dados recentes (menos de 30 segundos), não recarrega
  if (ultimoCarregamento > 0 && (agora - ultimoCarregamento) < CACHE_DURATION) {
    renderizarTudo();
    return;
  }

  try {
    const docRef = doc(window.db, 'states', 'cgs');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dados = docSnap.data();
      if (!dados.out.previsao) dados.out.previsao = [];
      if (!dados.in.previsao) dados.in.previsao = [];
      estado = dados;
      ultimoCarregamento = agora;
    }
  } catch (erro) {
    console.error('Erro ao carregar estado:', erro);
    // Em caso de erro, usa dados em cache se disponíveis
    if (ultimoCarregamento > 0) {
    }
  }
  renderizarTudo();
}

// Renderiza grid de docas para um lado (otimizado - updates seletivos)
function renderizarGrid(lado) {
  const container = document.getElementById('grid-' + lado);

  // Garante que temos o número correto de cards
  const docas = estado[lado].docas;
  while (container.children.length < docas.length) {
    const card = document.createElement('div');
    card.className = 'doca-card';
    card.innerHTML = `
      <div class="doca-label"></div>
      <div class="field"><label>Status</label>
        <select onchange="estado['${lado}'].docas[${container.children.length}].status = this.value">
          <option value="livre">Livre</option>
          <option value="oper">Operando</option>
          <option value="stage">Aguardando Stage</option>
          <option value="bloq">Bloqueada</option>
        </select>
      </div>
      <div class="field"><label>DT</label>
        <input oninput="estado['${lado}'].docas[${container.children.length}].dt = this.value"/>
      </div>
      <div class="field"><label>Composição</label>
        <div class="comp-pills">
          <div class="comp-pill" onclick="estado['${lado}'].docas[${container.children.length}].comp = 'simples'; renderizarGrid('${lado}')">🚛 Simples</div>
          <div class="comp-pill" onclick="estado['${lado}'].docas[${container.children.length}].comp = 'bitrem'; renderizarGrid('${lado}')">🚛🚛 Bitrem</div>
        </div>
      </div>
      <div class="field"><label>Entrada</label><input type="time" oninput="estado['${lado}'].docas[${container.children.length}].hora = this.value"/></div>
      <div class="field"><label>Carga: 0%</label><input type="range" oninput="estado['${lado}'].docas[${container.children.length}].pct = +this.value; renderizarGrid('${lado}')"/></div>
    `;
    container.appendChild(card);
  }

  // Remove cards extras se necessário
  while (container.children.length > docas.length) {
    container.removeChild(container.lastChild);
  }

  // Atualiza apenas os valores dos campos existentes
  docas.forEach((doca, indice) => {
    const card = container.children[indice];
    if (!card) return;

    // Atualiza label da doca
    const label = card.querySelector('.doca-label');
    if (label && label.textContent !== doca.id) {
      label.textContent = doca.id;
    }

    // Atualiza select de status
    const statusSelect = card.querySelector('select');
    if (statusSelect && statusSelect.value !== doca.status) {
      statusSelect.value = doca.status;
    }

    // Atualiza input DT
    const dtInput = card.querySelector('input[type="text"]');
    if (dtInput && dtInput.value !== doca.dt) {
      dtInput.value = doca.dt;
    }

    // Atualiza pills de composição
    const pills = card.querySelectorAll('.comp-pill');
    if (pills.length >= 2) {
      pills[0].classList.toggle('sel-simples', doca.comp === 'simples');
      pills[1].classList.toggle('sel-bitrem', doca.comp === 'bitrem');
    }

    // Atualiza input de hora
    const timeInput = card.querySelector('input[type="time"]');
    if (timeInput && timeInput.value !== doca.hora) {
      timeInput.value = doca.hora;
    }

    // Atualiza range e label de carga
    const rangeInput = card.querySelector('input[type="range"]');
    const cargaLabel = card.querySelector('label');
    if (rangeInput && rangeInput.value != doca.pct) {
      rangeInput.value = doca.pct;
    }
    if (cargaLabel && cargaLabel.textContent !== `Carga: ${doca.pct}%`) {
      cargaLabel.textContent = `Carga: ${doca.pct}%`;
    }
  });
}

// Renderiza lista do pátio para um lado (otimizado - updates seletivos)
function renderizarPatio(lado) {
  const container = document.getElementById('patio-' + lado + '-edit');

  // Garante que temos o número correto de rows
  const patio = estado[lado].patio;
  while (container.children.length < patio.length) {
    const row = document.createElement('div');
    row.className = 'row-edit patio-row-edit';
    row.innerHTML = `
      <div class="field"><label>DT</label><input oninput="estado['${lado}'].patio[${container.children.length}].dt = this.value"/></div>
      <div class="field"><label>Comp.</label><select onchange="estado['${lado}'].patio[${container.children.length}].comp = this.value"><option value="simples">Simples</option><option value="bitrem">Bitrem</option></select></div>
      <div class="field"><label>Chegada</label><input type="time" oninput="estado['${lado}'].patio[${container.children.length}].chegada = this.value"/></div>
      <div class="field"><label>Urg.</label><select onchange="estado['${lado}'].patio[${container.children.length}].urg = this.value"><option value="green">Normal</option><option value="amber">Atenção</option><option value="red">Urgente</option></select></div>
      <button class="remove-btn" onclick="estado['${lado}'].patio.splice(${container.children.length}, 1); renderizarPatio('${lado}')">X</button>
    `;
    container.appendChild(row);
  }

  // Remove rows extras se necessário
  while (container.children.length > patio.length) {
    container.removeChild(container.lastChild);
  }

  // Atualiza apenas os valores dos campos existentes
  patio.forEach((veiculo, indice) => {
    const row = container.children[indice];
    if (!row) return;

    // Atualiza inputs
    const inputs = row.querySelectorAll('input');
    const selects = row.querySelectorAll('select');

    // DT input
    if (inputs[0] && inputs[0].value !== veiculo.dt) {
      inputs[0].value = veiculo.dt || '';
    }

    // Comp select
    if (selects[0] && selects[0].value !== veiculo.comp) {
      selects[0].value = veiculo.comp || 'simples';
    }

    // Chegada time input
    if (inputs[1] && inputs[1].value !== veiculo.chegada) {
      inputs[1].value = veiculo.chegada || '';
    }

    // Urg select
    if (selects[1] && selects[1].value !== veiculo.urg) {
      selects[1].value = veiculo.urg || 'green';
    }
  });
}

// Renderiza lista de previsões para um lado (otimizado - updates seletivos)
function renderizarPrevisao(lado) {
  const container = document.getElementById('previsao-' + lado + '-edit');

  // Garante que temos o número correto de rows
  const previsoes = estado[lado].previsao;
  while (container.children.length < previsoes.length) {
    const row = document.createElement('div');
    row.className = 'row-edit previsao-row-edit';
    row.innerHTML = `
      <div class="field"><label>Nome / Motorista</label><input oninput="estado['${lado}'].previsao[${container.children.length}].nome = this.value"/></div>
      <div class="field"><label>DT</label><input oninput="estado['${lado}'].previsao[${container.children.length}].dt = this.value"/></div>
      <div class="field"><label>Tons</label><input type="number" oninput="estado['${lado}'].previsao[${container.children.length}].tons = this.value"/></div>
      <div class="field"><label>Placa</label><input oninput="estado['${lado}'].previsao[${container.children.length}].placa = this.value"/></div>
      <button class="action-btn" onclick="moverParaPatio('${lado}', ${container.children.length})">Pátio ⬇</button>
      <button class="remove-btn" onclick="estado['${lado}'].previsao.splice(${container.children.length}, 1); renderizarPrevisao('${lado}')">X</button>
    `;
    container.appendChild(row);
  }

  // Remove rows extras se necessário
  while (container.children.length > previsoes.length) {
    container.removeChild(container.lastChild);
  }

  // Atualiza apenas os valores dos campos existentes
  previsoes.forEach((previsao, indice) => {
    const row = container.children[indice];
    if (!row) return;

    // Atualiza inputs
    const inputs = row.querySelectorAll('input');

    // Nome input
    if (inputs[0] && inputs[0].value !== (previsao.nome || '')) {
      inputs[0].value = previsao.nome || '';
    }

    // DT input
    if (inputs[1] && inputs[1].value !== (previsao.dt || '')) {
      inputs[1].value = previsao.dt || '';
    }

    // Tons number input
    if (inputs[2] && inputs[2].value != (previsao.tons || '')) {
      inputs[2].value = previsao.tons || '';
    }

    // Placa input
    if (inputs[3] && inputs[3].value !== (previsao.placa || '')) {
      inputs[3].value = previsao.placa || '';
    }
  });
}

// Adiciona novo veículo ao pátio
function adicionarPatio(lado) {
  estado[lado].patio.push({ dt: '', comp: 'simples', chegada: '', urg: 'green' });
  renderizarPatio(lado);
}

// Adiciona nova previsão
function adicionarPrevisao(lado) {
  estado[lado].previsao.push({ nome: '', dt: '', tons: '', placa: '' });
  renderizarPrevisao(lado);
}

// Move previsão para pátio
function moverParaPatio(lado, indice) {
  const previsao = estado[lado].previsao[indice];
  const agora = new Date();
  const hora = agora.getHours().toString().padStart(2, '0') + ':' + agora.getMinutes().toString().padStart(2, '0');

  estado[lado].patio.push({
    dt: previsao.dt || '',
    comp: 'simples',
    chegada: hora,
    urg: 'green'
  });

  estado[lado].previsao.splice(indice, 1);
  renderizarTudo();
  salvarTudo();
}

// Salva estado no Firestore com validações
// Salva estado no Firestore com validações robustas
async function salvarTudo() {
  // Validações robustas
  for (const lado of ['out', 'in']) {
    // Validações das docas
    for (const doca of estado[lado].docas) {
      if (doca.dt && !/^\d{8}$/.test(doca.dt.trim())) {
        alert(`DT inválida para ${doca.id}. Use 8 dígitos numéricos.`);
        return;
      }
      if (doca.hora && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(doca.hora)) {
        alert(`Hora inválida para ${doca.id}. Use formato HH:MM.`);
        return;
      }
      if (doca.pct < 0 || doca.pct > 100) {
        alert(`Percentual de carga inválido para ${doca.id}. Deve ser entre 0 e 100.`);
        return;
      }
    }

    // Validações do pátio
    for (const veiculo of estado[lado].patio) {
      if (veiculo.dt && !/^\d{8}$/.test(veiculo.dt.trim())) {
        alert(`DT inválida no pátio. Use 8 dígitos numéricos.`);
        return;
      }
      if (veiculo.chegada && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(veiculo.chegada)) {
        alert(`Hora de chegada inválida no pátio. Use formato HH:MM.`);
        return;
      }
      if (!['green', 'amber', 'red'].includes(veiculo.urg)) {
        alert(`Urgência inválida no pátio. Use Normal, Atenção ou Urgente.`);
        return;
      }
      if (!['simples', 'bitrem'].includes(veiculo.comp)) {
        alert(`Composição inválida no pátio. Use Simples ou Bitrem.`);
        return;
      }
    }

    // Validações das previsões
    for (const previsao of estado[lado].previsao) {
      if (previsao.dt && !/^\d{8}$/.test(previsao.dt.trim())) {
        alert(`DT inválida na previsão. Use 8 dígitos numéricos.`);
        return;
      }
      if (previsao.nome && previsao.nome.length > 100) {
        alert(`Nome muito longo na previsão. Máximo 100 caracteres.`);
        return;
      }
      if (previsao.placa && previsao.placa.length > 50) {
        alert(`Placa inválida na previsão. Máximo 50 caracteres.`);
        return;
      }
      if (previsao.tons && (previsao.tons < 0 || previsao.tons > 50)) {
        alert(`Toneladas inválidas na previsão. Deve ser entre 0 e 50.`);
        return;
      }
    }
  }

  // Feedback visual de salvamento em andamento
  const saveBtn = document.querySelector('.save-btn');
  const originalText = saveBtn.textContent;
  saveBtn.textContent = '💾 Salvando...';
  saveBtn.disabled = true;

  try {
    const docRef = doc(window.db, 'states', 'cgs');
    await setDoc(docRef, estado);

    // Feedback de sucesso
    const msg = document.getElementById('save-msg');
    msg.textContent = '✓ Dados salvos e publicados com sucesso!';
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 3000);

  } catch (erro) {
    console.error('Erro ao salvar:', erro);

    // Feedback de erro mais específico
    let errorMessage = 'Erro ao salvar: ';
    if (erro.code === 'permission-denied') {
      errorMessage += 'Sem permissão para salvar. Verifique suas credenciais.';
    } else if (erro.code === 'unavailable') {
      errorMessage += 'Serviço indisponível. Verifique sua conexão com a internet.';
    } else {
      errorMessage += erro.message;
    }

    alert(errorMessage);

    // Feedback visual de erro
    const msg = document.getElementById('save-msg');
    msg.textContent = '❌ Erro ao salvar!';
    msg.classList.add('show');
    msg.style.color = '#D40511';
    setTimeout(() => {
      msg.classList.remove('show');
      msg.style.color = '';
    }, 3000);

  } finally {
    // Restaura botão
    saveBtn.textContent = originalText;
    saveBtn.disabled = false;
  }
}

// Renderiza tudo
function renderizarTudo() {
  renderizarGrid('out');
  renderizarGrid('in');
  renderizarPatio('out');
  renderizarPatio('in');
  renderizarPrevisao('out');
  renderizarPrevisao('in');
}

// Alterna entre abas outbound e inbound
function switchTab(aba) {
  ['out', 'in'].forEach(tab => {
    document.getElementById('screen-' + tab).classList.toggle('act', tab === aba);
    document.getElementById('tab-' + tab).classList.toggle('act', tab === aba);
  });
}

// Funções de validação em tempo real
function validarCampo(campo, valor, tipo) {
  const elemento = campo.closest('.field');
  elemento.classList.remove('field-error', 'field-valid');

  if (!valor) return; // Campo vazio é válido

  let valido = true;
  let mensagem = '';

  switch (tipo) {
    case 'dt':
      valido = /^\d{8}$/.test(valor.trim());
      mensagem = valido ? '' : 'Use 8 dígitos numéricos';
      campo.value = valor.trim();
      break;
    case 'hora':
      valido = /^([01]\d|2[0-3]):([0-5]\d)$/.test(valor);
      mensagem = valido ? '' : 'Formato: HH:MM';
      break;
    case 'placa':
      valido = valor.length <= 50;
      mensagem = valido ? '' : 'Máx. 50 caracteres';
      campo.value = valor.trim();
      break;
    case 'tons':
      const num = parseFloat(valor);
      valido = !isNaN(num) && num >= 0 && num <= 50;
      mensagem = valido ? '' : '0-50 toneladas';
      break;
    case 'nome':
      valido = valor.length <= 100;
      mensagem = valido ? '' : 'Máx. 100 caracteres';
      break;
  }

  if (valido) {
    elemento.classList.add('field-valid');
  } else {
    elemento.classList.add('field-error');
    // Mostra tooltip com erro
    campo.title = mensagem;
  }
}

// Adiciona validação em tempo real aos campos
function adicionarValidacaoTempoReal() {
  // Validação de DT
  document.querySelectorAll('input[oninput*="dt"]').forEach(input => {
    input.addEventListener('blur', (e) => validarCampo(e.target, e.target.value, 'dt'));
  });

  // Validação de hora
  document.querySelectorAll('input[type="time"]').forEach(input => {
    input.addEventListener('blur', (e) => validarCampo(e.target, e.target.value, 'hora'));
  });

  // Validação de placa
  document.querySelectorAll('input[oninput*="placa"]').forEach(input => {
    input.addEventListener('blur', (e) => validarCampo(e.target, e.target.value, 'placa'));
  });

  // Validação de tons
  document.querySelectorAll('input[oninput*="tons"]').forEach(input => {
    input.addEventListener('blur', (e) => validarCampo(e.target, e.target.value, 'tons'));
  });

  // Validação de nome
  document.querySelectorAll('input[oninput*="nome"]').forEach(input => {
    input.addEventListener('blur', (e) => validarCampo(e.target, e.target.value, 'nome'));
  });
}

// Inicializa quando DOM estiver carregado
window.addEventListener('DOMContentLoaded', () => {
  carregarEstado();
  adicionarValidacaoTempoReal();
});