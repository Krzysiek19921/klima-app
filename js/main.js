document.addEventListener('DOMContentLoaded', () => {
  // Domyślna dzisiejsza data
  const dateInput = document.getElementById('service-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // --- Zapamiętywanie danych firmy i instalatora w localStorage ---
  const persistentFields = [
    'company-name', 'company-nip', 'company-address', 'company-phone', 'company-email',
    'installer-name', 'fgaz-cert', 'company-fgaz-cert'
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

  // --- Dynamiczne dodawanie jednostek wewnętrznych ---
  let indoorCount = 1;
  const addIndoorBtn = document.getElementById('add-indoor-btn');
  const indoorContainer = document.getElementById('indoor-units-container');

  if (addIndoorBtn && indoorContainer) {
    addIndoorBtn.addEventListener('click', () => {
      indoorCount++;
      const card = document.createElement('div');
      card.className = 'card-box indoor-card';
      card.innerHTML = `
        <div class="card-header">
          <strong>Jednostka Wewnętrzna #${indoorCount}</strong>
          <button type="button" class="btn-remove">Usuń</button>
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

      card.querySelector('.btn-remove').addEventListener('click', () => {
        card.remove();
      });
    });
  }

  // --- Dynamiczne dodawanie jednostek zewnętrznych ---
  let outdoorCount = 1;
  const addOutdoorBtn = document.getElementById('add-outdoor-btn');
  const outdoorContainer = document.getElementById('outdoor-units-container');

  if (addOutdoorBtn && outdoorContainer) {
    addOutdoorBtn.addEventListener('click', () => {
      outdoorCount++;
      const card = document.createElement('div');
      card.className = 'card-box outdoor-card';
      card.innerHTML = `
        <div class="card-header">
          <strong>Jednostka Zewnętrzna #${outdoorCount}</strong>
          <button type="button" class="btn-remove">Usuń</button>
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

      card.querySelector('.btn-remove').addEventListener('click', () => {
        card.remove();
      });
    });
  }

  // --- Poprawione Generowanie PDF ---
  const form = document.getElementById('protocol-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const clientName = document.getElementById('client-name')?.value || 'Klient';
      const serviceDate = document.getElementById('service-date')?.value || 'data';
      const fileName = `Protokol_Klimatyzacji_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${serviceDate}.pdf`;

      const element = document.getElementById('protocol-content');
      const actionButtons = document.querySelectorAll('.btn-add, .btn-remove, .btn-clear, .form-actions');

      // 1. Ukryj przyciski akcji na czas generowania PDF
      actionButtons.forEach(btn => btn.style.display = 'none');

      // 2. Tymczasowo wymuś szerokość widoku na A4 (800px) niezależnie od ekranu telefonu
      const originalWidth = element.style.width;
      element.style.width = '794px';

      const opt = {
        margin:       [8, 8, 8, 8],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true, windowWidth: 800 },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ['avoid-all', 'css', 'legacy'] }
      };

      html2pdf().set(opt).from(element).save().then(() => {
        // Przywróć oryginalne ustawienia ekranu
        element.style.width = originalWidth;
        actionButtons.forEach(btn => btn.style.display = '');
      }).catch(err => {
        console.error('Błąd generowania PDF:', err);
        element.style.width = originalWidth;
        actionButtons.forEach(btn => btn.style.display = '');
        alert('Wystąpił błąd podczas generowania pliku PDF.');
      });
    });
  }
});
