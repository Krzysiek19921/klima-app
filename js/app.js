let indoorUnitCounter = 0;

// Pomocnicza funkcja zabezpieczająca przed XSS (bezpieczne kodowanie znaków HTML)
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lucide icons
  try {
    if (window.lucide) lucide.createIcons();
  } catch (e) { console.warn('Lucide err:', e); }

  // 2. Podpisy Canvas
  setTimeout(() => {
    try {
      if (typeof initCanvas === 'function') {
        initCanvas('sig-client');
        initCanvas('sig-tech');
      }
    } catch (e) { console.warn('Canvas init err:', e); }
  }, 100);

  // 3. Ładowanie danych z DB
  try {
    if (typeof loadClientsToSelect === 'function') loadClientsToSelect();
    if (typeof populateSettingsForm === 'function') populateSettingsForm();
  } catch (e) { console.warn('DB init err:', e); }

  // 4. Podpięcie przycisku "Dodaj jednostkę"
  const addBtn = document.getElementById('btn-add-indoor');
  if (addBtn) {
    addBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addIndoorUnit();
    });
  }

  // Dodaj pierwszą jednostkę na start, jeśli pojemnik jest pusty
  const container = document.getElementById('indoor-container');
  if (container && container.children.length === 0) {
    addIndoorUnit();
  }
});

function showSection(sectionId) {
  document.querySelectorAll('.app-section').forEach(sec => sec.classList.add('hidden'));
  const target = document.getElementById(`sec-${sectionId}`);
  if (target) {
    target.classList.remove('hidden');
  }

  if (sectionId === 'history' && typeof loadHistory === 'function') loadHistory();
  if (sectionId === 'clients' && typeof loadClientsList === 'function') loadClientsList();
}

function addIndoorUnit() {
  const container = document.getElementById('indoor-container');
  if (!container) return;

  const currentRows = container.querySelectorAll('.indoor-row');
  if (currentRows.length >= 5) {
    alert('Maksymalnie można dodać 5 jednostek wewnętrznych!');
    return;
  }

  indoorUnitCounter++;
  const div = document.createElement('div');
  div.className = 'indoor-row flex gap-2 items-center bg-slate-50 p-2 rounded-lg border border-slate-200';
  div.id = `indoor-row-${Date.now()}`; // Bezpieczny unikalny ID
  
  div.innerHTML = `
    <span class="font-bold text-xs text-slate-400 w-4 num-label">1.</span>
    <input type="text" placeholder="Lokalizacja (np. Salon)" class="w-1/2 p-2 border border-slate-300 rounded text-xs ind-loc bg-white">
    <input type="text" placeholder="Model / S/N" class="w-1/2 p-2 border border-slate-300 rounded text-xs ind-sn bg-white">
    <button type="button" class="btn-remove-indoor px-2 py-1 text-slate-400 hover:text-red-500 font-bold text-sm cursor-pointer transition-colors" title="Usuń">&#10005;</button>
  `;

  // Obsługa usuwania wiersza
  const removeBtn = div.querySelector('.btn-remove-indoor');
  if (removeBtn) {
    removeBtn.addEventListener('click', () => {
      div.remove();
      reindexIndoorUnits();
    });
  }

  container.appendChild(div);
  reindexIndoorUnits();
}

function reindexIndoorUnits() {
  const container = document.getElementById('indoor-container');
  if (!container) return;

  const rows = container.querySelectorAll('.indoor-row');
  rows.forEach((row, index) => {
    const label = row.querySelector('.num-label');
    if (label) label.innerText = `${index + 1}.`;
  });
}

function populateSettingsForm() {
  if (typeof loadSettings !== 'function') return;
  const s = loadSettings() || {};
  
  const fields = {
    'set-company-name': s.name,
    'set-company-nip': s.nip,
    'set-company-address': s.address,
    'set-company-contact': s.contact,
    'set-ha-url': s.haUrl
  };

  Object.entries(fields).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (el) el.value = val || '';
  });
}

function saveSettings() {
  const getVal = (id) => document.getElementById(id)?.value || '';

  const newSettings = {
    name: getVal('set-company-name'),
    nip: getVal('set-company-nip'),
    address: getVal('set-company-address'),
    contact: getVal('set-company-contact'),
    haUrl: getVal('set-ha-url')
  };

  if (typeof saveData === 'function' && typeof DB_KEYS !== 'undefined') {
    saveData(DB_KEYS.SETTINGS, newSettings);
    alert('Ustawienia zostały pomyślnie zapisane!');
  }
}

function loadClientsToSelect() {
  if (typeof getStoredData !== 'function' || typeof DB_KEYS === 'undefined') return;
  const clients = getStoredData(DB_KEYS.CLIENTS, []);
  const select = document.getElementById('client-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Nowy Klient --</option>';
  clients.forEach((c, idx) => {
    const option = document.createElement('option');
    option.value = idx;
    option.textContent = `${c.name} (${c.address || 'Brak adresu'})`;
    select.appendChild(option);
  });
}

function onClientSelect(idx) {
  if (idx === "" || typeof getStoredData !== 'function' || typeof DB_KEYS === 'undefined') return;
  const clients = getStoredData(DB_KEYS.CLIENTS, []);
  const c = clients[idx];
  if (c) {
    const setVal = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.value = val || '';
    };
    setVal('c-name', c.name);
    setVal('c-address', c.address);
    setVal('c-contact', c.contact);
  }
}

function loadClientsList() {
  if (typeof getStoredData !== 'function' || typeof DB_KEYS === 'undefined') return;
  const clients = getStoredData(DB_KEYS.CLIENTS, []);
  const container = document.getElementById('clients-list');
  if (!container) return;

  if (clients.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500">Brak zapisanych klientów.</p>';
    return;
  }

  container.innerHTML = clients.map(c => `
    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p class="font-bold text-sm text-slate-800">${escapeHtml(c.name)}</p>
      <p class="text-xs text-slate-600">${escapeHtml(c.address || 'Brak adresu')}</p>
      <p class="text-xs text-slate-500">${escapeHtml(c.contact || 'Brak kontaktu')}</p>
    </div>
  `).join('');
}

function generateProtocolId() {
  const year = new Date().getFullYear();
  let count = 1;
  
  if (typeof getStoredData === 'function' && typeof DB_KEYS !== 'undefined') {
    const protocols = getStoredData(DB_KEYS.PROTOCOLS, []);
    count = protocols.length + 1;
  }
  
  // Formatowanie liczby do 3 cyfr, np. PR/2026/001
  const sequenceNumber = String(count).padStart(3, '0');
  return `PR/${year}/${sequenceNumber}`;
}

function generateAndSaveProtocol() {
  const settings = typeof loadSettings === 'function' ? (loadSettings() || {}) : {};
  const cName = document.getElementById('c-name')?.value.trim();
  
  if (!cName) {
    alert('Wpisz nazwę / imię i nazwisko klienta!');
    return;
  }

  const indoorUnits = [];
  document.querySelectorAll('#indoor-container .indoor-row').forEach(row => {
    const loc = row.querySelector('.ind-loc')?.value.trim() || '';
    const sn = row.querySelector('.ind-sn')?.value.trim() || '';
    if (loc || sn) indoorUnits.push({ loc, sn });
  });

  const getVal = (id) => document.getElementById(id)?.value || '';

  const clientData = {
    name: cName,
    address: getVal('c-address'),
    contact: getVal('c-contact')
  };

  const protocolData = {
    id: generateProtocolId(),
    date: new Date().toLocaleDateString('pl-PL'),
    client: clientData,
    equipment: {
      type: getVal('eq-type'),
      brand: getVal('eq-brand'),
      sn: getVal('eq-sn'),
      indoors: indoorUnits
    },
    service: {
      type: getVal('serv-type'),
      fgas: `${getVal('fgas-type')} ${getVal('fgas-amount')}`.trim(),
      notes: getVal('serv-notes')
    },
    signatures: {
      client: typeof getCanvasDataURL === 'function' ? getCanvasDataURL('sig-client') : '',
      tech: typeof getCanvasDataURL === 'function' ? getCanvasDataURL('sig-tech') : ''
    }
  };

  // Zapis do pamięci podręcznej (LocalDB)
  if (typeof getStoredData === 'function' && typeof saveData === 'function' && typeof DB_KEYS !== 'undefined') {
    const protocols = getStoredData(DB_KEYS.PROTOCOLS, []);
    protocols.unshift(protocolData);
    saveData(DB_KEYS.PROTOCOLS, protocols);

    const clients = getStoredData(DB_KEYS.CLIENTS, []);
    if (!clients.some(c => c.name.toLowerCase() === clientData.name.toLowerCase())) {
      clients.unshift(clientData);
      saveData(DB_KEYS.CLIENTS, clients);
      loadClientsToSelect();
    }
  }

  // Wypełnianie sekcji do druku PDF
  const setTxt = (id, txt) => {
    const el = document.getElementById(id);
    if (el) el.textContent = txt || '';
  };

  setTxt('pdf-comp-name', settings.name || 'KLIMA-SERWIS');
  setTxt('pdf-comp-addr', settings.address || '');
  setTxt('pdf-comp-nip', settings.nip ? `NIP: ${settings.nip}` : '');
  setTxt('pdf-comp-contact', settings.contact || '');

  setTxt('pdf-proto-num', protocolData.id);
  setTxt('pdf-proto-date', protocolData.date);
  setTxt('pdf-client-name', protocolData.client.name);
  setTxt('pdf-client-addr', protocolData.client.address);
  setTxt('pdf-client-contact', protocolData.client.contact);

  setTxt('pdf-eq-type', protocolData.equipment.type);
  setTxt('pdf-eq-brand', protocolData.equipment.brand);
  setTxt('pdf-eq-sn', protocolData.equipment.sn);

  // Bezpieczna budowa tabeli urządzeń z zabezpieczeniem XSS
  const indoorContainer = document.getElementById('pdf-indoor-list');
  if (indoorContainer) {
    if (protocolData.equipment.indoors.length > 0) {
      indoorContainer.innerHTML = protocolData.equipment.indoors.map((u, i) => `
        <tr>
          <td class="border border-slate-300 p-1 font-bold">${i + 1}.</td>
          <td class="border border-slate-300 p-1">${escapeHtml(u.loc) || '-'}</td>
          <td class="border border-slate-300 p-1">${escapeHtml(u.sn) || '-'}</td>
        </tr>
      `).join('');
    } else {
      indoorContainer.innerHTML = '<tr><td colspan="3" class="p-1 text-slate-400">Brak jednostek wewnętrznych</td></tr>';
    }
  }

  setTxt('pdf-serv-type', protocolData.service.type);
  setTxt('pdf-fgas', protocolData.service.fgas);
  setTxt('pdf-notes', protocolData.service.notes);

  // Wstawianie podpisów
  const setSigImg = (id, dataUrl) => {
    const img = document.getElementById(id);
    if (img && dataUrl) {
      img.src = dataUrl;
      img.classList.remove('hidden');
    }
  };

  setSigImg('pdf-sig-client-img', protocolData.signatures.client);
  setSigImg('pdf-sig-tech-img', protocolData.signatures.tech);

  // Integracja z Home Assistant
  if (typeof sendProtocolToHA === 'function') sendProtocolToHA(protocolData);

  // Przejście do widoku druku
  showSection('print');
}

function loadHistory() {
  if (typeof getStoredData !== 'function' || typeof DB_KEYS === 'undefined') return;
  const protocols = getStoredData(DB_KEYS.PROTOCOLS, []);
  const container = document.getElementById('history-list');
  if (!container) return;

  if (protocols.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500">Brak zapisanych protokołów w pamięci.</p>';
    return;
  }

  container.innerHTML = protocols.map(p => `
    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
      <div>
        <span class="font-bold text-sm text-blue-600">${escapeHtml(p.id)}</span>
        <p class="font-semibold text-xs text-slate-800">${escapeHtml(p.client.name)}</p>
        <p class="text-[10px] text-slate-500">${escapeHtml(p.date)} • ${escapeHtml(p.service.type)}</p>
      </div>
    </div>
  `).join('');
}