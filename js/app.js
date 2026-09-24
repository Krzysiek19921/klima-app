let indoorUnitCounter = 0;

document.addEventListener('DOMContentLoaded', () => {
  // 1. Lucide icons
  try {
    if (window.lucide) lucide.createIcons();
  } catch (e) { console.warn('Lucide err:', e); }

  // 2. Podpisy Canvas
  setTimeout(() => {
    try {
      initCanvas('sig-client');
      initCanvas('sig-tech');
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

  // Dodaj pierwszą jednostkę na start
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
  div.id = `indoor-row-${indoorUnitCounter}`;
  
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
  const s = loadSettings();
  if (document.getElementById('set-company-name')) document.getElementById('set-company-name').value = s.name || '';
  if (document.getElementById('set-company-nip')) document.getElementById('set-company-nip').value = s.nip || '';
  if (document.getElementById('set-company-address')) document.getElementById('set-company-address').value = s.address || '';
  if (document.getElementById('set-company-contact')) document.getElementById('set-company-contact').value = s.contact || '';
  if (document.getElementById('set-ha-url')) document.getElementById('set-ha-url').value = s.haUrl || '';
}

function saveSettings() {
  const newSettings = {
    name: document.getElementById('set-company-name').value,
    nip: document.getElementById('set-company-nip').value,
    address: document.getElementById('set-company-address').value,
    contact: document.getElementById('set-company-contact').value,
    haUrl: document.getElementById('set-ha-url').value
  };
  if (typeof saveData === 'function') {
    saveData(DB_KEYS.SETTINGS, newSettings);
    alert('Ustawienia zapisane!');
  }
}

function loadClientsToSelect() {
  if (typeof getStoredData !== 'function') return;
  const clients = getStoredData(DB_KEYS.CLIENTS, []);
  const select = document.getElementById('client-select');
  if (!select) return;
  
  select.innerHTML = '<option value="">-- Nowy Klient --</option>';
  clients.forEach((c, idx) => {
    select.innerHTML += `<option value="${idx}">${c.name} (${c.address || ''})</option>`;
  });
}

function onClientSelect(idx) {
  if (idx === "" || typeof getStoredData !== 'function') return;
  const clients = getStoredData(DB_KEYS.CLIENTS, []);
  const c = clients[idx];
  if (c) {
    document.getElementById('c-name').value = c.name || '';
    document.getElementById('c-address').value = c.address || '';
    document.getElementById('c-contact').value = c.contact || '';
  }
}

function loadClientsList() {
  if (typeof getStoredData !== 'function') return;
  const clients = getStoredData(DB_KEYS.CLIENTS, []);
  const container = document.getElementById('clients-list');
  if (!container) return;

  if (clients.length === 0) {
    container.innerHTML = '<p class="text-xs text-slate-500">Brak zapisanych klientów.</p>';
    return;
  }

  container.innerHTML = clients.map(c => `
    <div class="p-3 bg-slate-50 rounded-lg border border-slate-200">
      <p class="font-bold text-sm text-slate-800">${c.name}</p>
      <p class="text-xs text-slate-600">${c.address || 'Brak adresu'}</p>
      <p class="text-xs text-slate-500">${c.contact || 'Brak kontaktu'}</p>
    </div>
  `).join('');
}

function generateAndSaveProtocol() {
  const settings = typeof loadSettings === 'function' ? loadSettings() : {};
  const cName = document.getElementById('c-name').value;
  if (!cName) {
    alert('Wpisz nazwę / imię klienta!');
    return;
  }

  const indoorUnits = [];
  document.querySelectorAll('#indoor-container .indoor-row').forEach(row => {
    const loc = row.querySelector('.ind-loc') ? row.querySelector('.ind-loc').value : '';
    const sn = row.querySelector('.ind-sn') ? row.querySelector('.ind-sn').value : '';
    if (loc || sn) indoorUnits.push({ loc, sn });
  });

  const clientData = {
    name: cName,
    address: document.getElementById('c-address').value,
    contact: document.getElementById('c-contact').value
  };

  const protocolData = {
    id: 'PR/' + new Date().getFullYear() + '/' + String(Date.now()).slice(-4),
    date: new Date().toLocaleDateString('pl-PL'),
    client: clientData,
    equipment: {
      type: document.getElementById('eq-type').value,
      brand: document.getElementById('eq-brand').value,
      sn: document.getElementById('eq-sn').value,
      indoors: indoorUnits
    },
    service: {
      type: document.getElementById('serv-type').value,
      fgas: document.getElementById('fgas-type').value + ' ' + document.getElementById('fgas-amount').value,
      notes: document.getElementById('serv-notes').value
    },
    signatures: {
      client: typeof getCanvasDataURL === 'function' ? getCanvasDataURL('sig-client') : '',
      tech: typeof getCanvasDataURL === 'function' ? getCanvasDataURL('sig-tech') : ''
    }
  };

  if (typeof getStoredData === 'function' && typeof saveData === 'function') {
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

  document.getElementById('pdf-comp-name').innerText = settings.name || 'KLIMA-SERWIS';
  document.getElementById('pdf-comp-addr').innerText = settings.address || '';
  document.getElementById('pdf-comp-nip').innerText = 'NIP: ' + (settings.nip || '');
  document.getElementById('pdf-comp-contact').innerText = settings.contact || '';

  document.getElementById('pdf-proto-num').innerText = protocolData.id;
  document.getElementById('pdf-proto-date').innerText = protocolData.date;
  document.getElementById('pdf-client-name').innerText = protocolData.client.name;
  document.getElementById('pdf-client-addr').innerText = protocolData.client.address;
  document.getElementById('pdf-client-contact').innerText = protocolData.client.contact;

  document.getElementById('pdf-eq-type').innerText = protocolData.equipment.type;
  document.getElementById('pdf-eq-brand').innerText = protocolData.equipment.brand;
  document.getElementById('pdf-eq-sn').innerText = protocolData.equipment.sn;

  const indoorListHtml = protocolData.equipment.indoors.map((u, i) => `
    <tr>
      <td class="border border-slate-300 p-1 font-bold">${i + 1}.</td>
      <td class="border border-slate-300 p-1">${u.loc || '-'}</td>
      <td class="border border-slate-300 p-1">${u.sn || '-'}</td>
    </tr>
  `).join('');
  document.getElementById('pdf-indoor-list').innerHTML = indoorListHtml || '<tr><td colspan="3" class="p-1 text-slate-400">Brak jednostek wewnętrznych</td></tr>';

  document.getElementById('pdf-serv-type').innerText = protocolData.service.type;
  document.getElementById('pdf-fgas').innerText = protocolData.service.fgas;
  document.getElementById('pdf-notes').innerText = protocolData.service.notes;

  const imgC = document.getElementById('pdf-sig-client-img');
  if (protocolData.signatures.client) {
    imgC.src = protocolData.signatures.client;
    imgC.classList.remove('hidden');
  }

  const imgT = document.getElementById('pdf-sig-tech-img');
  if (protocolData.signatures.tech) {
    imgT.src = protocolData.signatures.tech;
    imgT.classList.remove('hidden');
  }

  if (typeof sendProtocolToHA === 'function') sendProtocolToHA(protocolData);

  showSection('print');
}

function loadHistory() {
  if (typeof getStoredData !== 'function') return;
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
        <span class="font-bold text-sm text-blue-600">${p.id}</span>
        <p class="font-semibold text-xs text-slate-800">${p.client.name}</p>
        <p class="text-[10px] text-slate-500">${p.date} • ${p.service.type}</p>
      </div>
    </div>
  `).join('');
}