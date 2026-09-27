document.addEventListener('DOMContentLoaded', () => {
  const today = new Date().toISOString().split('T')[0];
  const serviceDateInput = document.getElementById('service-date');
  if (serviceDateInput) serviceDateInput.value = today;

  setupUnitButtons();
  initCanvas('installer-signature');
  initCanvas('client-signature');

  const form = document.getElementById('protocol-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  renderCatalog();
});

function setupUnitButtons() {
  const addIndoorBtn = document.getElementById('add-indoor-btn');
  const addOutdoorBtn = document.getElementById('add-outdoor-btn');

  if (addIndoorBtn) {
    addIndoorBtn.addEventListener('click', () => {
      const container = document.getElementById('indoor-units-container');
      const count = container.querySelectorAll('.indoor-card').length + 1;
      const card = document.createElement('div');
      card.className = 'card-box indoor-card';
      card.innerHTML = `
        <div class="card-header">
          <strong>Jednostka Wewnętrzna #${count}</strong>
          <button type="button" class="btn-remove" onclick="this.closest('.card-box').remove()">Usuń</button>
        </div>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Model urządzenia:</label>
            <input type="text" class="indoor-model" placeholder="np. Rotenso Mirai 3.5 kW" required>
          </div>
          <div class="form-group full-width">
            <label>Numer seryjny:</label>
            <input type="text" class="indoor-serial" placeholder="np. SN-IN-987654321">
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }

  if (addOutdoorBtn) {
    addOutdoorBtn.addEventListener('click', () => {
      const container = document.getElementById('outdoor-units-container');
      const count = container.querySelectorAll('.outdoor-card').length + 1;
      const card = document.createElement('div');
      card.className = 'card-box outdoor-card';
      card.innerHTML = `
        <div class="card-header">
          <strong>Jednostka Zewnętrzna #${count}</strong>
          <button type="button" class="btn-remove" onclick="this.closest('.card-box').remove()">Usuń</button>
        </div>
        <div class="form-grid">
          <div class="form-group full-width">
            <label>Model urządzenia:</label>
            <input type="text" class="outdoor-model" placeholder="np. Rotenso Mirai 3.5 kW Outer" required>
          </div>
          <div class="form-group full-width">
            <label>Numer seryjny:</label>
            <input type="text" class="outdoor-serial" placeholder="np. SN-OUT-123456789">
          </div>
        </div>
      `;
      container.appendChild(card);
    });
  }
}

function initCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let isDrawing = false;

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  }

  function startDrawing(e) {
    isDrawing = true;
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();
    const pos = getPos(e);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  function stopDrawing() {
    isDrawing = false;
  }

  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mouseleave', stopDrawing);

  canvas.addEventListener('touchstart', startDrawing, { passive: false });
  canvas.addEventListener('touchmove', draw, { passive: false });
  canvas.addEventListener('touchend', stopDrawing);
}

function clearCanvas(canvasId) {
  const canvas = document.getElementById(canvasId);
  if (canvas) {
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }
}

async function handleFormSubmit(e) {
  e.preventDefault();

  const getValue = (id) => {
    const el = document.getElementById(id);
    return el && el.value && el.value.trim() !== '' ? el.value : '—';
  };

  const getSelectText = (id) => {
    const el = document.getElementById(id);
    return el && el.selectedIndex !== -1 ? el.options[el.selectedIndex].text : '—';
  };

  const installerCanvas = document.getElementById('installer-signature');
  const clientCanvas = document.getElementById('client-signature');
  const installerSigImg = installerCanvas ? installerCanvas.toDataURL('image/png') : '';
  const clientSigImg = clientCanvas ? clientCanvas.toDataURL('image/png') : '';

  const indoorCards = document.querySelectorAll('.indoor-card');
  let indoorHTML = '';
  indoorCards.forEach((card, i) => {
    const model = card.querySelector('.indoor-model')?.value || '—';
    const serial = card.querySelector('.indoor-serial')?.value || '—';
    indoorHTML += `
      <div style="margin-bottom: 2px;">
        <b>Jednostka Wewn. #${i + 1}:</b> ${model} | <b>S/N:</b> ${serial}
      </div>
    `;
  });

  const outdoorCards = document.querySelectorAll('.outdoor-card');
  let outdoorHTML = '';
  outdoorCards.forEach((card, i) => {
    const model = card.querySelector('.outdoor-model')?.value || '—';
    const serial = card.querySelector('.outdoor-serial')?.value || '—';
    outdoorHTML += `
      <div style="margin-bottom: 2px;">
        <b>Jednostka Zewn. #${i + 1}:</b> ${model} | <b>S/N:</b> ${serial}
      </div>
    `;
  });

  const clientName = getValue('client-name');
  const serviceDate = getValue('service-date');
  const fileName = `Protokol_${clientName.replace(/\s+/g, '_')}_${serviceDate}.pdf`;

  const formElement = document.getElementById('protocol-form');
  const originalHTML = formElement.innerHTML;

  formElement.innerHTML = `
    <div id="pdf-render-area" style="padding: 10px; background: #ffffff; color: #000000; font-family: Arial, sans-serif; font-size: 8.5pt; line-height: 1.25;">
      <div style="text-align: center; border-bottom: 2px solid #0284c7; padding-bottom: 4px; margin-bottom: 8px;">
        <h2 style="font-size: 13pt; color: #0284c7; text-transform: uppercase; margin: 0;">${getSelectText('protocol-type')}</h2>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 6px;">
        <tr>
          <td style="width: 50%; vertical-align: top; padding-right: 4px;">
            <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px;">
              <strong style="color: #0284c7; display: block; margin-bottom: 3px; font-size: 9pt;">WYKONAWCA / INSTALATOR</strong>
              <b>Firma:</b> ${getValue('company-name')}<br>
              <b>NIP:</b> ${getValue('company-nip')}<br>
              <b>Adres:</b> ${getValue('company-address')}<br>
              <b>Monter:</b> ${getValue('installer-name')}<br>
              <b>Certyfikat F-Gaz:</b> ${getValue('fgaz-cert')}
            </div>
          </td>
          <td style="width: 50%; vertical-align: top; padding-left: 4px;">
            <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px;">
              <strong style="color: #0284c7; display: block; margin-bottom: 3px; font-size: 9pt;">ZLECENIODAWCA / KLIENT</strong>
              <b>Klient:</b> ${clientName}<br>
              <b>Adres montażu/serwisu:</b> ${getValue('client-address')}<br>
              <b>Data wykonania usługi:</b> ${serviceDate}<br>
              <b>Sugerowany nast. przegląd:</b> ${getValue('next-service-date')}
            </div>
          </td>
        </tr>
      </table>

      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px; margin-bottom: 6px;">
        <strong style="color: #0284c7; display: block; margin-bottom: 3px; font-size: 9pt;">SPECYFIKACJA URZĄDZEŃ</strong>
        ${indoorHTML}
        ${outdoorHTML}
      </div>

      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px; margin-bottom: 6px;">
        <strong style="color: #0284c7; display: block; margin-bottom: 3px; font-size: 9pt;">PARAMETRY CZYNNIKA CHŁODNICZEGO I CRO</strong>
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="width: 50%;"><b>Rodzaj czynnika:</b> ${getSelectText('refrigerant-type')}</td>
            <td style="width: 50%;"><b>Ilość fabryczna:</b> ${getValue('refrigerant-base-amount')} kg</td>
          </tr>
          <tr>
            <td><b>Ilość dodana:</b> ${getValue('refrigerant-added-amount')} kg</td>
            <td><b>Podlega pod CRO:</b> ${getSelectText('cro-status')}</td>
          </tr>
          ${getValue('cro-number') !== '—' ? `<tr><td colspan="2"><b>Nr karty CRO:</b> ${getValue('cro-number')}</td></tr>` : ''}
        </table>
      </div>

      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px; margin-bottom: 6px;">
        <strong style="color: #0284c7; display: block; margin-bottom: 2px; font-size: 9pt;">OPIS PRAC I UWAGI</strong>
        <div>${getValue('service-notes')}</div>
      </div>

      <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 5px; margin-bottom: 6px; font-size: 7.5pt; background: #f8fafc;">
        <strong style="color: #0284c7; display: block; margin-bottom: 2px; font-size: 8pt;">OŚWIADCZENIA I POTWIERDZENIA</strong>
        <div>✔ Potwierdzam prawidłowy montaż urządzenia oraz przeprowadzenie próby szczelności i próżni.</div>
        <div>✔ Urządzenie zostało uruchomione i przetestowane – działa prawidłowo.</div>
        <div>✔ Klient został zapoznany z zasadami obsługi urządzenia, warunkami gwarancji oraz wymogami przeglądów.</div>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-top: 6px;">
        <tr>
          <td style="width: 50%; text-align: center; padding-right: 6px;">
            <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px; min-height: 55px;">
              <div style="font-size: 7.5pt; font-weight: bold; color: #475569; margin-bottom: 2px;">PODPIS SERWISANTA / MONTERA</div>
              ${installerSigImg ? `<img src="${installerSigImg}" style="max-height: 38px; width: auto;">` : ''}
            </div>
          </td>
          <td style="width: 50%; text-align: center; padding-left: 6px;">
            <div style="border: 1px solid #cbd5e1; border-radius: 4px; padding: 4px; min-height: 55px;">
              <div style="font-size: 7.5pt; font-weight: bold; color: #475569; margin-bottom: 2px;">PODPIS KLIENTA</div>
              ${clientSigImg ? `<img src="${clientSigImg}" style="max-height: 38px; width: auto;">` : ''}
            </div>
          </td>
        </tr>
      </table>
    </div>
  `;

  window.scrollTo(0, 0);

  const opt = {
    margin: [4, 4, 4, 4],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, logging: false },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    const targetElement = document.getElementById('pdf-render-area');
    await html2pdf().set(opt).from(targetElement).save();
    saveProtocolToStorage(clientName, serviceDate, fileName);
  } catch (err) {
    alert('Błąd podczas generowania pliku PDF. Spróbuj ponownie.');
    console.error(err);
  } finally {
    formElement.innerHTML = originalHTML;
    setupUnitButtons();
    initCanvas('installer-signature');
    initCanvas('client-signature');
    renderCatalog();
  }
}

function saveProtocolToStorage(clientName, date, fileName) {
  const protocols = JSON.parse(localStorage.getItem('ac_protocols') || '[]');
  protocols.push({ id: Date.now(), clientName, date, fileName });
  localStorage.setItem('ac_protocols', JSON.stringify(protocols));
}

function renderCatalog() {
  const list = document.getElementById('catalog-list');
  if (!list) return;
  const protocols = JSON.parse(localStorage.getItem('ac_protocols') || '[]');
  
  if (protocols.length === 0) {
    list.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Brak zapisanych protokołów w historii przeglądarki.</p>';
    return;
  }

  list.innerHTML = protocols.map(item => `
    <div class="catalog-item">
      <div>
        <strong>${item.clientName}</strong> - <span style="color: #64748b;">${item.date}</span>
      </div>
      <button class="btn-delete-item" onclick="deleteProtocol(${item.id})">Usuń</button>
    </div>
  `).join('');
}

function deleteProtocol(id) {
  let protocols = JSON.parse(localStorage.getItem('ac_protocols') || '[]');
  protocols = protocols.filter(p => p.id !== id);
  localStorage.setItem('ac_protocols', JSON.stringify(protocols));
  renderCatalog();
}