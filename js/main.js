document.addEventListener('DOMContentLoaded', () => {
  // Domyślna data dzisiejsza
  const today = new Date().toISOString().split('T')[0];
  const serviceDateInput = document.getElementById('service-date');
  if (serviceDateInput) serviceDateInput.value = today;

  // Obsługa dynamicznych jednostek
  setupUnitButtons();

  // Obsługa podpisów Canvas
  initCanvas('installer-signature');
  initCanvas('client-signature');

  // Obsługa formularza i generowania PDF
  const form = document.getElementById('protocol-form');
  if (form) {
    form.addEventListener('submit', handleFormSubmit);
  }

  // Wczytaj katalog
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

// Rysowanie na Canvas
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

// Przepisanie wartości z kontrolek HTML (w tym <select> i <textarea>) do właściwości domyślnych dla HTML2PDF
function syncFormInputsForPDF() {
  const inputs = document.querySelectorAll('input, select, textarea');
  inputs.forEach(input => {
    if (input.tagName === 'SELECT') {
      const selectedOption = input.options[input.selectedIndex];
      if (selectedOption) {
        Array.from(input.options).forEach(opt => opt.removeAttribute('selected'));
        selectedOption.setAttribute('selected', 'selected');
      }
    } else if (input.tagName === 'TEXTAREA') {
      input.textContent = input.value;
    } else {
      input.setAttribute('value', input.value);
    }
  });

  // Przekształcenie podpisów z Canvas na obrazy IMG
  ['installer-signature', 'client-signature'].forEach(id => {
    const canvas = document.getElementById(id);
    const imgId = id === 'installer-signature' ? 'pdf-sig-tech-img' : 'pdf-sig-client-img';
    const img = document.getElementById(imgId);
    if (canvas && img) {
      img.src = canvas.toDataURL('image/png');
      img.classList.remove('hidden');
    }
  });
}

async function handleFormSubmit(e) {
  e.preventDefault();

  // Synchronizacja wartości przed generowaniem PDF
  syncFormInputsForPDF();

  const clientName = document.getElementById('client-name').value || 'Klient';
  const serviceDate = document.getElementById('service-date').value || new Date().toISOString().split('T')[0];
  const fileName = `Protokol_${clientName.replace(/\s+/g, '_')}_${serviceDate}.pdf`;

  document.body.classList.add('pdf-mode');

  const element = document.getElementById('protocol-form');
  const opt = {
    margin: [8, 8, 8, 8],
    filename: fileName,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  try {
    await html2pdf().set(opt).from(element).save();
    saveProtocolToStorage(clientName, serviceDate, fileName);
  } catch (err) {
    console.error('Błąd generowania PDF:', err);
  } finally {
    document.body.classList.remove('pdf-mode');
    
    // Ukryj obrazki podpisów po wygenerowaniu PDF
    document.getElementById('pdf-sig-tech-img')?.classList.add('hidden');
    document.getElementById('pdf-sig-client-img')?.classList.add('hidden');
  }
}

function saveProtocolToStorage(clientName, date, fileName) {
  const protocols = JSON.parse(localStorage.getItem('ac_protocols') || '[]');
  protocols.push({ id: Date.now(), clientName, date, fileName });
  localStorage.setItem('ac_protocols', JSON.stringify(protocols));
  renderCatalog();
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
