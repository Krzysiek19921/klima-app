document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('protocol-form');

  // Ustawienie domyślnej dzisiejszej daty w polu daty wykonania usługi
  const serviceDateInput = document.getElementById('service-date');
  if (serviceDateInput && !serviceDateInput.value) {
    serviceDateInput.value = new Date().toISOString().slice(0, 10);
  }

  // --- 1. DYNAMICZNE DODAWANIE / USUWANIE JEDNOSTEK ---
  const indoorContainer = document.getElementById('indoor-units-container');
  const outdoorContainer = document.getElementById('outdoor-units-container');
  const addIndoorBtn = document.getElementById('add-indoor-btn');
  const addOutdoorBtn = document.getElementById('add-outdoor-btn');

  // Funkcja aktualizująca numerację na kafelkach po usunięciu
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

  // Dodawanie nowej jednostki wewnętrznej
  if (addIndoorBtn && indoorContainer) {
    addIndoorBtn.addEventListener('click', () => {
      const count = indoorContainer.children.length + 1;
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
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Dodawanie nowej jednostki zewnętrznej
  if (addOutdoorBtn && outdoorContainer) {
    addOutdoorBtn.addEventListener('click', () => {
      const count = outdoorContainer.children.length + 1;
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
      if (window.lucide) window.lucide.createIcons();
    });
  }

  // Obsługa usuwania kafelków i odświeżania numeracji
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

  // --- 2. GENEROWANIE DOKUMENTU PDF ---
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Przygotowanie podpisów: Przeniesienie z Canvas do IMG przed wygenerowaniem PDF
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

      // Aktywacja trybu PDF
      document.body.classList.add('pdf-mode');

      const element = document.querySelector('.container');
      const clientName = document.getElementById('client-name')?.value.trim() || 'Klient';
      const serviceDate = document.getElementById('service-date')?.value || new Date().toISOString().slice(0, 10);
      const safeClientName = clientName.replace(/[^a-zA-Z0-9ąĆęŁńÓśŹŻĄĆĘŁŃÓŚŹŻ_-]/g, '_');
      const fileName = `Protokol_${safeClientName}_${serviceDate}.pdf`;

      // Konfiguracja PDF
      const opt = {
        margin: [8, 8, 8, 8],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // Wygenerowanie pliku PDF i przywrócenie domyślnego widoku
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          cleanupPdfMode();
        })
        .catch((err) => {
          console.error('Błąd podczas generowania PDF:', err);
          cleanupPdfMode();
        });

      // Funkcja czyszcząca widok po wygenerowaniu pliku
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