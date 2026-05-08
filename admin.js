// admin.js - Painel de administração para edição de docas, pátio e previsões
// Responsável por gerenciar o estado local e sincronizar com Firestore

// Estado padrão para inicialização
const estadoPadrao = {
  out: { docas: [1,2,3,4,5,6].map(i => ({id: 'OUT-0' + i, status: 'livre', pct: 0, dt: '', comp: '', hora: ''})), patio: [], previsao: [] },
  in: { docas: [1,2,3,4,5,6].map(i => ({id: 'IN-0' + i, status: 'livre', pct: 0, dt: '', comp: '', hora: ''})), patio: [], previsao: [] }
};

// Estado atual
let estado = JSON.parse(JSON.stringify(estadoPadrao));

// Carrega estado do Firestore
async function carregarEstado() {
  try {
    const docRef = doc(window.db, 'states', 'cgs');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dados = docSnap.data();
      if (!dados.out.previsao) dados.out.previsao = [];
      if (!dados.in.previsao) dados.in.previsao = [];
      estado = dados;
    }
  } catch (erro) {
    console.error(erro);
  }
  renderizarTudo();
}

// Renderiza grid de docas para um lado
function renderizarGrid(lado) {
  document.getElementById('grid-' + lado).innerHTML = estado[lado].docas.map((doca, indice) => `
    <div class="doca-card">
      <div class="doca-label">${doca.id}</div>
      <div class="field"><label>Status</label>
        <select onchange="estado['${lado}'].docas[${indice}].status = this.value">
          <option value="livre" ${doca.status === 'livre' ? 'selected' : ''}>Livre</option>
          <option value="oper" ${doca.status === 'oper' ? 'selected' : ''}>Operando</option>
          <option value="stage" ${doca.status === 'stage' ? 'selected' : ''}>Aguardando Stage</option>
          <option value="bloq" ${doca.status === 'bloq' ? 'selected' : ''}>Bloqueada</option>
        </select>
      </div>
      <div class="field"><label>DT</label>
        <input value="${doca.dt}" oninput="estado['${lado}'].docas[${indice}].dt = this.value"/>
      </div>
      <div class="field"><label>Composição</label>
        <div class="comp-pills">
          <div class="comp-pill ${doca.comp === 'simples' ? 'sel-simples' : ''}" onclick="estado['${lado}'].docas[${indice}].comp = 'simples'; renderizarGrid('${lado}')">🚛 Simples</div>
          <div class="comp-pill ${doca.comp === 'bitrem' ? 'sel-bitrem' : ''}" onclick="estado['${lado}'].docas[${indice}].comp = 'bitrem'; renderizarGrid('${lado}')">🚛🚛 Bitrem</div>
        </div>
      </div>
      <div class="field"><label>Entrada</label><input type="time" value="${doca.hora}" oninput="estado['${lado}'].docas[${indice}].hora = this.value"/></div>
      <div class="field"><label>Carga: ${doca.pct}%</label><input type="range" value="${doca.pct}" oninput="estado['${lado}'].docas[${indice}].pct = +this.value; renderizarGrid('${lado}')"/></div>
    </div>
  `).join('');
}

// Renderiza lista do pátio para um lado
function renderizarPatio(lado) {
  document.getElementById('patio-' + lado + '-edit').innerHTML = estado[lado].patio.map((veiculo, indice) => `
    <div class="row-edit patio-row-edit">
      <div class="field"><label>DT</label><input value="${veiculo.dt}" oninput="estado['${lado}'].patio[${indice}].dt = this.value"/></div>
      <div class="field"><label>Comp.</label><select onchange="estado['${lado}'].patio[${indice}].comp = this.value"><option value="simples" ${veiculo.comp === 'simples' ? 'selected' : ''}>Simples</option><option value="bitrem" ${veiculo.comp === 'bitrem' ? 'selected' : ''}>Bitrem</option></select></div>
      <div class="field"><label>Chegada</label><input type="time" value="${veiculo.chegada}" oninput="estado['${lado}'].patio[${indice}].chegada = this.value"/></div>
      <div class="field"><label>Urg.</label><select onchange="estado['${lado}'].patio[${indice}].urg = this.value"><option value="green" ${veiculo.urg === 'green' ? 'selected' : ''}>Normal</option><option value="amber" ${veiculo.urg === 'amber' ? 'selected' : ''}>Atenção</option><option value="red" ${veiculo.urg === 'red' ? 'selected' : ''}>Urgente</option></select></div>
      <button class="remove-btn" onclick="estado['${lado}'].patio.splice(${indice}, 1); renderizarPatio('${lado}')">X</button>
    </div>
  `).join('');
}

// Renderiza lista de previsões para um lado
function renderizarPrevisao(lado) {
  document.getElementById('previsao-' + lado + '-edit').innerHTML = estado[lado].previsao.map((previsao, indice) => `
    <div class="row-edit previsao-row-edit">
      <div class="field"><label>Nome / Motorista</label><input value="${previsao.nome || ''}" oninput="estado['${lado}'].previsao[${indice}].nome = this.value"/></div>
      <div class="field"><label>DT</label><input value="${previsao.dt || ''}" oninput="estado['${lado}'].previsao[${indice}].dt = this.value"/></div>
      <div class="field"><label>Tons</label><input type="number" value="${previsao.tons || ''}" oninput="estado['${lado}'].previsao[${indice}].tons = this.value"/></div>
      <div class="field"><label>Placa</label><input value="${previsao.placa || ''}" oninput="estado['${lado}'].previsao[${indice}].placa = this.value"/></div>
      <button class="action-btn" onclick="moverParaPatio('${lado}', ${indice})">Pátio ⬇</button>
      <button class="remove-btn" onclick="estado['${lado}'].previsao.splice(${indice}, 1); renderizarPrevisao('${lado}')">X</button>
    </div>
  `).join('');
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
async function salvarTudo() {
  // Validações básicas
  for (const lado of ['out', 'in']) {
    for (const doca of estado[lado].docas) {
      if (doca.dt && !/^\d{4}-\d{2}-\d{2}$/.test(doca.dt)) {
        alert(`DT inválida para ${doca.id}. Use formato YYYY-MM-DD.`);
        return;
      }
      if (doca.hora && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(doca.hora)) {
        alert(`Hora inválida para ${doca.id}. Use formato HH:MM.`);
        return;
      }
    }
    for (const veiculo of estado[lado].patio) {
      if (veiculo.chegada && !/^([01]\d|2[0-3]):([0-5]\d)$/.test(veiculo.chegada)) {
        alert(`Hora de chegada inválida no pátio. Use formato HH:MM.`);
        return;
      }
    }
  }

  try {
    const docRef = doc(window.db, 'states', 'cgs');
    await setDoc(docRef, estado);
    const msg = document.getElementById('save-msg');
    msg.classList.add('show');
    setTimeout(() => msg.classList.remove('show'), 3000);
  } catch (erro) {
    alert('Erro ao salvar: ' + erro.message);
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

// Inicializa quando DOM estiver carregado
window.addEventListener('DOMContentLoaded', carregarEstado);