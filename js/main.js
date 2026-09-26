document.addEventListener('DOMContentLoaded', () => {
  // Domyślna dzisiejsza data
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

  // --- GENEROWANIE CZYSTEGO DOKUMENTU PDF (NIE ZRZUTU APLIKACJI) ---
  const form = document.getElementById('protocol-form');
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // Pobieranie danych z formularza
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

      // Pobieranie jednostek wewnętrznych i zewnętrznych
      let indoorHtml = '';
      document.querySelectorAll('#indoor-units-container .card-box').forEach((card, idx) => {
        const model = card.querySelector('.indoor-model')?.value || '-';
        const serial = card.querySelector('.indoor-serial')?.value || '-';
        indoorHtml += `<tr><td>JW #${idx + 1}</td><td>${model}</td><td>${serial}</td></tr>`;
      });

      let outdoorHtml = '';
      document.querySelectorAll('#outdoor-units-container .card-box').forEach((card, idx) => {
        const model = card.querySelector('.outdoor-model')?.value || '-';
        const serial = card.querySelector('.outdoor-serial')?.value || '-';
        outdoorHtml += `<tr><td>JZ #${idx + 1}</td><td>${model}</td><td>${serial}</td></tr>`;
      });

      // Pobranie podpisów z Canvas jako obrazy DataURL
      const clientCanvas = document.getElementById('client-signature');
      const installerCanvas = document.getElementById('installer-signature');
      const clientSigImg = clientCanvas ? clientCanvas.toDataURL() : '';
      const installerSigImg = installerCanvas ? installerCanvas.toDataURL() : '';

      // TWORZENIE CZYSTEGO SZABLONU A4 DLA DRUKU
      const printTemplate = document.createElement('div');
      printTemplate.style.width = '750px';
      printTemplate.style.padding = '25px';
      printTemplate.style.fontFamily = 'Arial, sans-serif';
      printTemplate.style.fontSize = '12px';
      printTemplate.style.color = '#000';
      printTemplate.style.backgroundColor = '#fff';

      printTemplate.innerHTML = `
        <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px;">
          <h2 style="margin:0; font-size: 20px;">PROTOKÓŁ MONTAŻU / SERWISU URZĄDZEŃ KLIMATYZACYJNYCH</h2>
          <p style="margin:5px 0 0 0; font-size: 11px; color: #555;">Data wykonania usługi: <strong>${serviceDate}</strong></p>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
          <tr>
            <td style="width: 50%; vertical-align: top; padding-right: 10px;">
              <div style="border: 1px solid #000; padding: 8px; min-height: 110px;">
                <strong style="font-size: 13px; text-decoration: underline;">WYKONAWCA / SERWIS:</strong><br>
                <strong>${companyName}</strong><br>
                NIP: ${companyNip}<br>
                Adres: ${companyAddress}<br>
                Tel: ${companyPhone} | Email: ${companyEmail}
              </div>
            </td>
            <td style="width: 50%; vertical-align: top; padding-left: 10px;">
              <div style="border: 1px solid #000; padding: 8px; min-height: 110px;">
                <strong style="font-size: 13px; text-decoration: underline;">ZLECENIODAWCA / KLIENT:</strong><br>
                <strong>${clientName}</strong><br>
                Adres montażu: ${clientAddress}<br>
                Tel: ${clientPhone}
              </div>
            </td>
          </tr>
        </table>

        <div style="border: 1px solid #000; padding: 8px; margin-bottom: 15px;">
          <strong style="font-size: 12px; text-decoration: underline;">CERTYFIKATY INSTALATORA:</strong><br>
          Imię i nazwisko: <strong>${installerName}</strong> | Certyfikat F-Gaz indywidualny: <strong>${fgazCert}</strong><br>
          Certyfikat F-Gaz przedsiębiorcy: <strong>${companyFgazCert}</strong>
        </div>

        <div style="margin-bottom: 15px;">
          <strong style="font-size: 13px;">SPECYFIKACJA ZAINSTALOWANYCH URZĄDZEŃ:</strong>
          <table style="width: 100%; border-collapse: collapse; margin-top: 5px; border: 1px solid #000;" border="1" cellpadding="5">
            <thead>
              <tr style="background-color: #f2f2f2;">
                <th style="width: 25%; text-align: left;">Typ</th>
                <th style="width: 45%; text-align: left;">Model urządzenia</th>
                <th style="width: 30%; text-align: left;">Numer seryjny</th>
              </tr>
            </thead>
            <tbody>
              ${indoorHtml}
              ${outdoorHtml}
            </tbody>
          </table>
        </div>

        <div style="border: 1px solid #000; padding: 8px; margin-bottom: 15px;">
          <strong style="font-size: 12px;">PARAMETRY CZYNNIKA CHŁODNICZEGO:</strong><br>
          Rodzaj czynnika: <strong>${refrigerantType}</strong> | Ilość w układzie: <strong>${refrigerantAmount} kg</strong>
        </div>

        <div style="border: 1px solid #000; padding: 8px; margin-bottom: 20px; background-color: #fcfcfc;">
          <strong style="font-size: 11px;">INFORMACJA / OŚWIADCZENIE CRO:</strong><br>
          <span style="font-size: 10px;">${croText} Zleceniodawca oświadcza, że został poinformowany o obowiązkach wynikających z ustawy F-Gazowej.</span>
        </div>

        <table style="width: 100%; margin-top: 20px;">
          <tr>
            <td style="width: 50%; text-align: center; vertical-align: bottom;">
              ${clientSigImg ? `<img src="${clientSigImg}" style="max-height: 60px; max-width: 200px;"><br>` : ''}
              _____________________________________<br>
              <strong style="font-size: 11px;">Podpis Zleceniodawcy (Klienta)</strong>
            </td>
            <td style="width: 50%; text-align: center; vertical-align: bottom;">
              ${installerSigImg ? `<img src="${installerSigImg}" style="max-height: 60px; max-width: 200px;"><br>` : ''}
              _____________________________________<br>
              <strong style="font-size: 11px;">Podpis Serwisanta / Instalatora</strong>
            </td>
          </tr>
        </table>
      `;

      const fileName = `Protokol_${clientName.replace(/[^a-zA-Z0-9]/g, '_')}_${serviceDate}.pdf`;

      const opt = {
        margin:       [8, 8, 8, 8],
        filename:     fileName,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      // Generowanie PDF z czystego szablonu
      html2pdf().set(opt).from(printTemplate).save().catch(err => {
        console.error('Błąd generowania PDF:', err);
        alert('Wystąpił błąd podczas generowania pliku PDF.');
      });
    });
  }
});
