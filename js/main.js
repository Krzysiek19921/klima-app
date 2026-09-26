document.addEventListener('DOMContentLoaded', () => {
  const dateInput = document.getElementById('service-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  // Zapamiętywanie danych firmy i instalatora w localStorage
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

  // Dodawanie jednostek wewnętrznych
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
      card.querySelector('.btn-remove').addEventListener('click', () => card.remove());
    });
  }

  // Dodawanie jednostek zewnętrznych
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
      card.querySelector('.btn-remove').addEventListener('click', () => card.remove());
    });
  }

  // --- NATYWNE GENEROWANIE DOKUMENTU DO WYDRUKU / ZAPISU DO PDF ---
  const form = document.getElementById('protocol-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const companyName = document.getElementById('company-name')?.value || '-';
      const companyNip = document.getElementById('company-nip')?.value || '-';
      const companyAddress = document.getElementById('company-address')?.value || '-';
      const companyPhone = document.getElementById('company-phone')?.value || '-';
      const companyEmail = document.getElementById('company-email')?.value || '-';

      const installerName = document.getElementById('installer-name')?.value || '-';
      const fgazCert = document.getElementById('fgaz-cert')?.value || '-';
      const companyFgazCert = document.getElementById('company-fgaz-cert')?.value || '-';

      const clientName = document.getElementById('client-name')?.value || '-';
      const clientAddress = document.getElementById('client-address')?.value || '-';
      const clientPhone = document.getElementById('client-phone')?.value || '-';
      const serviceDate = document.getElementById('service-date')?.value || '-';

      const refrigerantType = document.getElementById('refrigerant-type')?.value || '-';
      const refrigerantAmount = document.getElementById('refrigerant-amount')?.value || '-';

      const croOption = document.querySelector('input[name="cro_option"]:checked')?.value;
      const croText = croOption === 'required'
        ? 'Urządzenie PODLEGA obowiązkowi wpisu do Centralnego Rejestru Operatorów (CRO).'
        : 'Urządzenie NIE PODLEGA obowiązkowi wpisu do Centralnego Rejestru Operatorów (CRO).';

      let indoorHtml = '';
      document.querySelectorAll('#indoor-units-container .card-box').forEach((card, idx) => {
        const model = card.querySelector('.indoor-model')?.value || '-';
        const serial = card.querySelector('.indoor-serial')?.value || '-';
        indoorHtml += `<tr><td style="border: 1px solid #000; padding: 5px;">JW #${idx + 1}</td><td style="border: 1px solid #000; padding: 5px;">${model}</td><td style="border: 1px solid #000; padding: 5px;">${serial}</td></tr>`;
      });

      let outdoorHtml = '';
      document.querySelectorAll('#outdoor-units-container .card-box').forEach((card, idx) => {
        const model = card.querySelector('.outdoor-model')?.value || '-';
        const serial = card.querySelector('.outdoor-serial')?.value || '-';
        outdoorHtml += `<tr><td style="border: 1px solid #000; padding: 5px;">JZ #${idx + 1}</td><td style="border: 1px solid #000; padding: 5px;">${model}</td><td style="border: 1px solid #000; padding: 5px;">${serial}</td></tr>`;
      });

      const clientCanvas = document.getElementById('client-signature');
      const installerCanvas = document.getElementById('installer-signature');
      const clientSigImg = clientCanvas ? clientCanvas.toDataURL() : '';
      const installerSigImg = installerCanvas ? installerCanvas.toDataURL() : '';

      // Pobieramy lub tworzymy element wydruku
      let printDoc = document.getElementById('print-document');
      if (!printDoc) {
        printDoc = document.createElement('div');
        printDoc.id = 'print-document';
        document.body.appendChild(printDoc);
      }

      printDoc.innerHTML = `
        <div style="font-family: Arial, sans-serif; font-size: 11pt; color: #000; line-height: 1.4;">
          <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 12px;">
            <h2 style="margin: 0; font-size: 16pt; text-transform: uppercase;">PROTOKÓŁ MONTAŻU / SERWISU KLIMATYZACJI</h2>
            <p style="margin: 4px 0 0 0; font-size: 10pt; color: #333;">Data wykonania usługi: <strong>${serviceDate}</strong></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin-bottom: 12px;">
            <tr>
              <td style="width: 50%; vertical-align: top; padding-right: 8px;">
                <div style="border: 1px solid #000; padding: 8px; min-height: 90px;">
                  <strong style="font-size: 11pt; text-decoration: underline;">WYKONAWCA / SERWIS:</strong><br>
                  <strong style="font-size: 11pt;">${companyName}</strong><br>
                  NIP: ${companyNip}<br>
                  Adres: ${companyAddress}<br>
                  Tel: ${companyPhone} | Email: ${companyEmail}
                </div>
              </td>
              <td style="width: 50%; vertical-align: top; padding-left: 8px;">
                <div style="border: 1px solid #000; padding: 8px; min-height: 90px;">
                  <strong style="font-size: 11pt; text-decoration: underline;">ZLECENIODAWCA / KLIENT:</strong><br>
                  <strong style="font-size: 11pt;">${clientName}</strong><br>
                  Adres montażu: ${clientAddress}<br>
                  Tel: ${clientPhone}
                </div>
              </td>
            </tr>
          </table>

          <div style="border: 1px solid #000; padding: 8px; margin-bottom: 12px; background-color: #fafafa;">
            <strong style="font-size: 10pt; text-decoration: underline;">CERTYFIKATY INSTALATORA:</strong><br>
            Serwisant: <strong>${installerName}</strong> | F-Gaz indywidualny: <strong>${fgazCert}</strong> | F-Gaz przedsiębiorcy: <strong>${companyFgazCert}</strong>
          </div>

          <div style="margin-bottom: 12px;">
            <strong style="font-size: 11pt;">SPECYFIKACJA URZĄDZEŃ:</strong>
            <table style="width: 100%; border-collapse: collapse; margin-top: 4px;" border="1">
              <thead>
                <tr style="background-color: #eee;">
                  <th style="width: 20%; padding: 5px; text-align: left; border: 1px solid #000;">Typ</th>
                  <th style="width: 50%; padding: 5px; text-align: left; border: 1px solid #000;">Model urządzenia</th>
                  <th style="width: 30%; padding: 5px; text-align: left; border: 1px solid #000;">Numer seryjny</th>
                </tr>
              </thead>
              <tbody>
                ${indoorHtml}
                ${outdoorHtml}
              </tbody>
            </table>
          </div>

          <div style="border: 1px solid #000; padding: 8px; margin-bottom: 12px;">
            <strong style="font-size: 10pt;">PARAMETRY CZYNNIKA CHŁODNICZEGO:</strong><br>
            Rodzaj czynnika: <strong>${refrigerantType}</strong> | Ilość w układzie: <strong>${refrigerantAmount} kg</strong>
          </div>

          <div style="border: 1px solid #000; padding: 8px; margin-bottom: 30px; background-color: #fafafa;">
            <strong style="font-size: 10pt;">OŚWIADCZENIE CRO:</strong><br>
            <span style="font-size: 9pt; color: #222;">${croText} Zleceniodawca oświadcza, że został poinformowany o wymogach prawnych i obowiązku / braku obowiązku rejestracji w CRO.</span>
          </div>

          <table style="width: 100%; margin-top: 40px;">
            <tr>
              <td style="width: 50%; text-align: center; vertical-align: bottom;">
                ${clientSigImg ? `<img src="${clientSigImg}" style="max-height: 50px; max-width: 180px;"><br>` : ''}
                _____________________________________<br>
                <strong style="font-size: 9pt;">Podpis Zleceniodawcy (Klienta)</strong>
              </td>
              <td style="width: 50%; text-align: center; vertical-align: bottom;">
                ${installerSigImg ? `<img src="${installerSigImg}" style="max-height: 50px; max-width: 180px;"><br>` : ''}
                _____________________________________<br>
                <strong style="font-size: 9pt;">Podpis Serwisanta / Instalatora</strong>
              </td>
            </tr>
          </table>
        </div>
      `;

      // Wywołanie systemowego okna drukowania / zapisu do PDF
      window.print();
    });
  }
});
