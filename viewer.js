// Função simples para escapar HTML e prevenir XSS básico
function escaparHtml(texto) {
  const mapa = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return texto.replace(/[&<>"']/g, m => mapa[m]);
}

// Gera SVG dinâmico do caminhão baseado na porcentagem e composição
function truckSVG(pct, comp) {
  const col = pct >= 100 ? '#2ecc71' : pct > 60 ? '#2ecc71' : pct > 30 ? '#FFCC00' : '#5a6070';
  const isBitrem = comp === 'bitrem';
  const uid = 'u' + Math.random().toString(36).slice(2, 8);
  if (isBitrem) {
    const fw1 = Math.round((pct / 100) * 56);
    const fw2 = Math.round((pct / 100) * 48);
    return `<svg viewBox="0 0 148 58" style="width:100%;height:64px" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <clipPath id="${uid}a"><rect x="2" y="14" width="${fw1}" height="30" rx="3"/></clipPath>
        <clipPath id="${uid}b"><rect x="68" y="12" width="${fw2}" height="34" rx="3"/></clipPath>
      </defs>
      <rect x="2" y="14" width="56" height="30" rx="3" fill="#161920" stroke="#2a2d38" stroke-width="1"/>
      ${pct > 0 ? `<rect x="2" y="14" width="56" height="30" rx="3" fill="${col}" opacity="0.28" clip-path="url(#${uid}a)"/>` : ''}
      <line x1="58" y1="29" x2="68" y2="29" stroke="#2a2d38" stroke-width="2.5"/>
      <rect x="68" y="12" width="48" height="34" rx="3" fill="#161920" stroke="#2a2d38" stroke-width="1"/>
      ${pct > 0 ? `<rect x="68" y="12" width="48" height="34" rx="3" fill="${col}" opacity="0.3" clip-path="url(#${uid}b)"/>` : ''}
      <rect x="116" y="17" width="30" height="24" rx="3" fill="#161920" stroke="#2a2d38" stroke-width="1"/>
      <rect x="118" y="19" width="25" height="13" rx="2" fill="#0c0d10"/>
      <line x1="146" y1="21" x2="146" y2="30" stroke="#FFCC00" stroke-width="1.5"/>
      <circle cx="14" cy="50" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="14" cy="50" r="2" fill="#1a1d24"/>
      <circle cx="44" cy="50" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="44" cy="50" r="2" fill="#1a1d24"/>
      <circle cx="82" cy="50" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="82" cy="50" r="2" fill="#1a1d24"/>
      <circle cx="112" cy="50" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="112" cy="50" r="2" fill="#1a1d24"/>
      <circle cx="130" cy="50" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="130" cy="50" r="2" fill="#1a1d24"/>
      ${pct > 0
        ? `<text x="92" y="32" font-family="Barlow Condensed,Arial,sans-serif" font-size="12" font-weight="700" fill="${col}" text-anchor="middle" dominant-baseline="middle">${pct}%</text>`
        : `<text x="92" y="32" font-family="Barlow Condensed,Arial,sans-serif" font-size="9" fill="#383d4a" text-anchor="middle" dominant-baseline="middle">VAZIA</text>`}
    </svg>`;
  } else {
    const fw = Math.round((pct / 100) * 74);
    return `<svg viewBox="0 0 114 58" style="width:100%;height:64px" xmlns="http://www.w3.org/2000/svg">
      <defs><clipPath id="${uid}"><rect x="2" y="12" width="${fw}" height="36" rx="4"/></clipPath></defs>
      <rect x="2" y="12" width="74" height="36" rx="4" fill="#161920" stroke="#2a2d38" stroke-width="1"/>
      ${pct > 0 ? `<rect x="2" y="12" width="74" height="36" rx="4" fill="${col}" opacity="0.28" clip-path="url(#${uid})"/>` : ''}
      <rect x="76" y="17" width="36" height="26" rx="3" fill="#161920" stroke="#2a2d38" stroke-width="1"/>
      <rect x="78" y="19" width="29" height="14" rx="2" fill="#0c0d10"/>
      <line x1="111" y1="21" x2="111" y2="31" stroke="#FFCC00" stroke-width="1.5"/>
      <circle cx="16" cy="52" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="16" cy="52" r="2" fill="#1a1d24"/>
      <circle cx="56" cy="52" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="56" cy="52" r="2" fill="#1a1d24"/>
      <circle cx="96" cy="52" r="5" fill="#0c0d10" stroke="#2a2d38" stroke-width="1.5"/><circle cx="96" cy="52" r="2" fill="#1a1d24"/>
      ${pct > 0
        ? `<text x="39" y="33" font-family="Barlow Condensed,Arial,sans-serif" font-size="13" font-weight="700" fill="${col}" text-anchor="middle" dominant-baseline="middle">${pct}%</text>`
        : `<text x="39" y="33" font-family="Barlow Condensed,Arial,sans-serif" font-size="9" fill="#383d4a" text-anchor="middle" dominant-baseline="middle">VAZIA</text>`}
    </svg>`;
  }
}

// Calcula o tempo de espera baseado na hora de chegada
function calcEspera(chegada) {
  if (!chegada) return '';
  const [hora, minuto] = chegada.split(':').map(Number);
  const agora = new Date();
  const diff = agora.getHours() * 60 + agora.getMinutes() - hora * 60 - minuto;
  if (diff <= 0) return 'chegou agora';
  if (diff < 60) return diff + 'min';
  return Math.floor(diff / 60) + 'h ' + (diff % 60) + 'min';
}

// Renderiza o lado (outbound ou inbound) com dados atualizados
function renderSide(lado, dados) {
  // Renderiza docas
  document.getElementById('docas-' + lado).innerHTML = dados.docas.map(doca => `
    <div class="doca s-${doca.status}">
      <div class="doca-hdr">
        <span class="doca-id">${doca.id}</span>
        <span class="badge ${doca.status === 'livre' ? 'b-livre' : doca.status === 'oper' ? 'b-oper' : doca.status === 'stage' ? 'b-stage' : 'b-bloq'}">${doca.status === 'livre' ? 'Livre' : doca.status === 'oper' ? 'Operando' : doca.status === 'stage' ? 'Aguardando' : 'Bloqueada'}</span>
      </div>
      <div class="truck-wrap">
        ${truckSVG(doca.pct, doca.comp)}
        ${doca.comp ? `<div class="comp-chip ${doca.comp === 'bitrem' ? 'chip-bitrem' : 'chip-simples'}">${doca.comp === 'bitrem' ? 'Bitrem' : 'Simples'}</div>` : ''}
      </div>
      <div class="doca-info">
        <span class="doca-dt">${doca.dt || '—'}</span>
        ${doca.hora ? `<span class="doca-hora">⏱ ${doca.hora}</span>` : ''}
      </div>
    </div>
  `).join('');

  // Renderiza pátio
  const patioElement = document.getElementById('patio-' + lado);
  document.getElementById('cnt-' + lado).textContent = dados.patio.length;
  patioElement.innerHTML = dados.patio.length === 0
    ? '<div class="patio-empty">Nenhum veículo aguardando</div>'
    : dados.patio.map(veiculo => `
      <div class="pitem ug-${veiculo.urg}">
        <div class="pitem-dt">${veiculo.dt || '—'}</div>
        <div class="pitem-comp c-${veiculo.comp}">${veiculo.comp === 'bitrem' ? '🚛🚛 Bitrem' : '🚛 Simples'}</div>
        <div class="pitem-row">
          <div class="pitem-hora">${veiculo.chegada ? '⏱ ' + veiculo.chegada : ''}</div>
          <div class="pitem-wait w-${veiculo.urg}">${calcEspera(veiculo.chegada)}</div>
        </div>
      </div>
    `).join('');

  // Renderiza previsões
  const previsaoElement = document.getElementById('previsao-' + lado + '-list');
  const previsoes = dados.previsao || [];
  const totalTons = previsoes.reduce((soma, previsao) => soma + (parseFloat(previsao.tons) || 0), 0);

  previsaoElement.innerHTML = previsoes.length === 0
    ? '<tr><td colspan="5" style="text-align:center; color:var(--dim); padding:20px;">Nenhuma previsão</td></tr>'
    : previsoes.map(previsao => `
      <tr>
        <td>${escaparHtml(previsao.nome || '—')}</td>
        <td>${escaparHtml(previsao.dt || '—')}</td>
        <td class="td-tons">${previsao.tons ? previsao.tons + ' t' : '—'}</td>
        <td class="td-placa">${escaparHtml(previsao.placa || '—')}</td>
        <td><span class="status-tag">Em Trânsito</span></td>
      </tr>
    `).join('');

  document.getElementById('cnt-prev-' + lado).textContent = previsoes.length;
  document.getElementById('tons-prev-' + lado).textContent = totalTons.toFixed(1);

  // Atualiza estatísticas
  const prefixo = lado === 'out' ? 'o' : 'i';
  document.getElementById(prefixo + '-op').textContent = dados.docas.filter(doca => doca.status === 'oper').length;
  document.getElementById(prefixo + '-st').textContent = dados.docas.filter(doca => doca.status === 'stage').length;
  document.getElementById(prefixo + '-lv').textContent = dados.docas.filter(doca => doca.status === 'livre').length;
  document.getElementById(prefixo + '-bl').textContent = dados.docas.filter(doca => doca.status === 'bloq').length;

  // Atualiza timestamp de sincronização
  const agora = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  document.getElementById('sync-' + lado).textContent = 'Atualizado ' + agora;
}

// Carrega e renderiza dados do Firestore
function loadAndRender() {
  const docRef = doc(window.db, 'states', 'cgs');
  onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const estado = docSnap.data();
      renderSide('out', estado.out);
      renderSide('in', estado.in);
    }
  });
}

// Atualiza o relógio em tempo real
function updateClock() {
  const agora = new Date();
  document.getElementById('clk').textContent = agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  document.getElementById('clkd').textContent = agora.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}

// Alterna entre abas outbound e inbound
function switchTab(aba) {
  ['out', 'in'].forEach(tab => {
    document.getElementById('screen-' + tab).classList.toggle('act', tab === aba);
    document.getElementById('tab-' + tab).classList.toggle('act', tab === aba);
  });
}

// Inicializa quando DOM estiver carregado
window.addEventListener('DOMContentLoaded', () => {
  loadAndRender();
  updateClock();
  setInterval(updateClock, 1000);
});