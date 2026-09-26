document.addEventListener('DOMContentLoaded', () => {
  // Ustawienie domyślnej daty na dziś
  const dateInput = document.getElementById('service-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // --- OBSŁUGA DYNAMICZNEGO DODAWANIA JEDNOSTEK ---
  let indoorCount = 1;
  let outdoorCount = 1;

  const indoorContainer = document.getElementById('indoor-units-container');
  const outdoorContainer = document.getElementById('outdoor-units-container');

  // Dodawanie Jednostki Wewnętrznej
  document.getElementById('add-indoor-btn').addEventListener('click', () => {
    indoorCount++;
    const card = document.createElement('div');
    card.className = 'card-box indoor-card';
    card.innerHTML = `
      <div class="card-header">
        <strong>Jednostka Wewnętrzna #${indoorCount}</strong>
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
    indoorContainer.appendChild(card);
  });

  // Dodawanie Jednostki Zewnętrznej
  document.getElementById('add-outdoor-btn').addEventListener('click', () => {
    outdoorCount++;
    const card = document.createElement('div');
    card.className = 'card-box outdoor-card';
    card.innerHTML = `
      <div class="card-header">
        <strong>Jednostka Zewnętrzna #${outdoorCount}</strong>
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
    outdoorContainer.appendChild(card);
  });

  // Zapis Formularza
  const form = document.getElementById('protocol-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Pobieranie wszystkich jednostek wewnętrznych
    const indoorUnits = Array.from(document.querySelectorAll('.indoor-card')).map(card => ({
      model: card.querySelector('.indoor-model').value,
      serial: card.querySelector('.indoor-serial').value
    }));

    // Pobieranie wszystkich jednostek zewnętrznych
    const outdoorUnits = Array.from(document.querySelectorAll('.outdoor-card')).map(card => ({
      model: card.querySelector('.outdoor-model').value,
      serial: card.querySelector('.outdoor-serial').value
    }));

    const formData = {
      companyName: document.getElementById('company-name').value,
      installerName: document.getElementById('installer-name').value,
      fgazCert: document.getElementById('fgaz-cert').value,
      clientName: document.getElementById('client-name').value,
      indoorUnits: indoorUnits,
      outdoorUnits: outdoorUnits,
      refrigerantType: document.getElementById('refrigerant-type').value,
      refrigerantAmount: document.getElementById('refrigerant-amount').value
    };

    console.log('Dane protokołu:', formData);
    alert('Protokół został zapisany pomyślnie!');
  });
});