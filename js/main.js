document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('protocol-form');

  // Daty
  const serviceDateInput = document.getElementById('service-date');
  const nextDateInput = document.getElementById('next-service-date');

  if (serviceDateInput) {
    if (!serviceDateInput.value) {
      const today = new Date();
      serviceDateInput.value = today.toISOString().slice(0, 10);
      
      if (nextDateInput && !nextDateInput.value) {
        const nextYear = new Date(today);
        nextYear.setFullYear(today.getFullYear() + 1);
        nextDateInput.value = nextYear.toISOString().slice(0, 10);
      }
    }

    serviceDateInput.addEventListener('change', () => {
      if (serviceDateInput.value && nextDateInput) {
        const selectedDate = new Date(serviceDateInput.value);
        if (!isNaN(selectedDate.getTime())) {
          selectedDate.setFullYear(selectedDate.getFullYear() + 1);
          nextDateInput.value = selectedDate.toISOString().slice(0, 10);
        }
      }
    });
  }

  // Obsługa Podpisów (Canvas)
  const setupSignatureCanvas = (canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;

    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000000';

    const getPos = (e) => {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: clientX - rect.left,
        y: clientY - rect.top
      };
    };

    const startDrawing = (e) => {
      isDrawing = true;
      const pos = getPos(e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e) => {
      if (!isDrawing) return;
      const pos = getPos(e);
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    };

    const stopDrawing = () => {
      isDrawing = false;
    };

    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseleave', stopDrawing);

    canvas.addEventListener('touchstart', (e) => { e.preventDefault(); startDrawing(e); });
    canvas.addEventListener('touchmove', (e) => { e.preventDefault(); draw(e); });
    canvas.addEventListener('touchend', stopDrawing);
  };

  setupSignatureCanvas('installer-signature');
  setupSignatureCanvas('client-signature');

  window.clearCanvas = (canvasId) => {
    const canvas = document.getElementById(canvasId);
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  // Pamięć podręczna firmowa
  const persistentFields = [
    'company-name', 'company-nip', 'company-address', 'installer-name', 'fgaz-cert'
  ];

  persistentFields.forEach(id => {
    const input = document.getElementById(id);
    if (input) {
      const savedValue = localStorage.getItem('klima_' + id);
      if (savedValue !== null) {
        input.value = savedValue;
      }
      input.addEventListener('input', (e) => {
        localStorage.setItem('klima_' + id, e.target.value);
      });
    }
  });

  // Dynamiczne dodawanie/usuwanie urządzeń
  const indoorContainer = document.getElementById('indoor-units-container');
  const outdoorContainer = document.getElementById('outdoor-units-container');
  const addIndoorBtn = document.getElementById('add-indoor-btn');
  const addOutdoorBtn = document.getElementById('add-outdoor-btn');

  function reindexUnits(container, titlePrefix) {
    if (!container) return;
    const cards = container.querySelectorAll('.card-box');
    cards.forEach((card, index) => {
      const headerStrong = card.querySelector('.card-header strong');
      if (headerStrong) {
        headerStrong.textContent = `${titlePrefix} #${index + 1}`;
      }
    });
  }

  if (addIndoorBtn && indoorContainer) {
    addIndoorBtn.addEventListener('click', () => {
      const count = indoorContainer.querySelectorAll('.indoor-card').length + 1;
      const card = document.createElement('div');
      card.className = 'card-box indoor-card';
      card.innerHTML = `
        <div class="card-header">
          <strong>Jednostka Wewnętrzna #${count}</strong>
          <button type="button" class="btn-remove" title="Usuń jednostkę">Usuń</button>
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
      indoorContainer.appendChild(card);
    });
  }

  if (addOutdoorBtn && outdoorContainer) {
    addOutdoorBtn.addEventListener('click', () => {
      const count = outdoorContainer.querySelectorAll('.outdoor-card').length + 1;
      const card = document.createElement('div');
      card.className = 'card-box outdoor-card';
      card.innerHTML = `
        <div class="card-header">
          <strong>Jednostka Zewnętrzna #${count}</strong>
          <button type="button" class="btn-remove" title="Usuń jednostkę">Usuń</button>
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
      outdoorContainer.appendChild(card);
    });
  }

  document.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.btn-remove');
    if (removeBtn) {
      const card = removeBtn.closest('.card-box');
      if (card) {
        const isIndoor = card.classList.contains('indoor-card');
        card.remove();

        if (isIndoor) {
          reindexUnits(indoorContainer, 'Jednostka Wewnętrzna');
        } else {
          reindexUnits(outdoorContainer, 'Jednostka Zewnętrzna');
        }
      }
    }
  });

  // Rejestr protokołów
  const renderCatalog = () => {
    const catalogList = document.getElementById('catalog-list');
    if (!catalogList) return;

    const savedProtocols = JSON.parse(localStorage.getItem('klima_protocols_db') || '[]');

    if (savedProtocols.length === 0) {
      catalogList.innerHTML = '<p style="color: var(--text-muted); font-size: 0.9rem;">Brak zapisanych protokołów w pamięci.</p>';
      return;
    }

    catalogList.innerHTML = savedProtocols.map((item, index) => `
      <div class="catalog-item">
        <div class="catalog-info">
          <h4>${item.type} - ${item.clientName}</h4>
          <p>Data: ${item.date} | Adres: ${item.address}</p>
        </div>
        <div class="catalog-actions">
          <button type="button" class="btn-delete-item" onclick="deleteProtocol(${index})">Usuń</button>
        </div>
      </div>
    `).join('');
  };

  window.deleteProtocol = (index) => {
    let savedProtocols = JSON.parse(localStorage.getItem('klima_protocols_db') || '[]');
    savedProtocols.splice(index, 1);
    localStorage.setItem('klima_protocols_db', JSON.stringify(savedProtocols));
    renderCatalog();
  };

  renderCatalog();

  // Generowanie PDF
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const clientName = document.getElementById('client-name')?.value.trim() || 'Klient';
      const serviceDate = document.getElementById('service-date')?.value || new Date().toISOString().slice(0, 10);
      const protocolType = document.getElementById('protocol-type')?.value || 'Protokół';
      const clientAddress = document.getElementById('client-address')?.value || '';

      // Zapis do bazy
      const newProtocol = {
        id: Date.now(),
        type: protocolType,
        clientName: clientName,
        date: serviceDate,
        address: clientAddress
      };

      const savedProtocols = JSON.parse(localStorage.getItem('klima_protocols_db') || '[]');
      savedProtocols.unshift(newProtocol);
      localStorage.setItem('klima_protocols_db', JSON.stringify(savedProtocols));
      renderCatalog();

      // Przeniesienie podpisów z Canvas do Obrazka
      const clientCanvas = document.getElementById('client-signature');
      const techCanvas = document.getElementById('installer-signature');
      const clientImg = document.getElementById('pdf-sig-client-img');
      const techImg = document.getElementById('pdf-sig-tech-img');

      if (clientCanvas && clientImg) {
        clientImg.src = clientCanvas.toDataURL('image/png');
        clientImg.classList.remove('hidden');
        clientCanvas.classList.add('hidden');
      }

      if (techCanvas && techImg) {
        techImg.src = techCanvas.toDataURL('image/png');
        techImg.classList.remove('hidden');
        techCanvas.classList.add('hidden');
      }

      document.body.classList.add('pdf-mode');

      const element = document.querySelector('.container');
      const safeClientName = clientName.replace(/[^a-zA-Z0-9ąĆęŁńÓśŹŻĄĆĘŁŃÓŚŹŻ_-]/g, '_');
      const safeProtocolType = protocolType.replace(/\s+/g, '_');
      const fileName = `${safeProtocolType}_${safeClientName}_${serviceDate}.pdf`;

      const opt = {
        margin:       [10, 10, 10, 10],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, logging: false },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          cleanupPdfMode();
        })
        .catch((err) => {
          console.error('Błąd generowania PDF:', err);
          cleanupPdfMode();
          alert('Wystąpił błąd podczas generowania pliku PDF.');
        });

      function cleanupPdfMode() {
        document.body.classList.remove('pdf-mode');

        if (clientCanvas && clientImg) {
          clientImg.classList.add('hidden');
          clientCanvas.classList.remove('hidden');
        }
        if (techCanvas && techImg) {
          techImg.classList.add('hidden');
          techCanvas.classList.remove('hidden');
        }
      }
    });
  }
});
