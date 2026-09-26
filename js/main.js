document.addEventListener('DOMContentLoaded', () => {
  // Domyślna data dzisiejsza w polu daty
  const dateInput = document.getElementById('service-date');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  const form = document.getElementById('protocol-form');
  
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    // Przygotowanie danych z formularza
    const formData = {
      companyName: document.getElementById('company-name').value,
      companyNip: document.getElementById('company-nip').value,
      companyAddress: document.getElementById('company-address').value,
      companyPhone: document.getElementById('company-phone').value,
      companyEmail: document.getElementById('company-email').value,

      installerName: document.getElementById('installer-name').value,
      fgazCert: document.getElementById('fgaz-cert').value,
      companyFgazCert: document.getElementById('company-fgaz-cert').value,

      clientName: document.getElementById('client-name').value,
      clientAddress: document.getElementById('client-address').value,
      clientPhone: document.getElementById('client-phone').value,
      serviceDate: document.getElementById('service-date').value,

      deviceModelIn: document.getElementById('device-model-in').value,
      serialNumberIn: document.getElementById('serial-number-in').value,
      deviceModelOut: document.getElementById('device-model-out').value,
      serialNumberOut: document.getElementById('serial-number-out').value,

      refrigerantType: document.getElementById('refrigerant-type').value,
      refrigerantAmount: document.getElementById('refrigerant-amount').value,

      croOption: document.querySelector('input[name="cro_option"]:checked')?.value,
      croAcknowledged: document.getElementById('cro-acknowledged').checked
    };

    console.log('Zapisane dane protokołu:', formData);
    alert('Protokół został pomyślnie przetworzony!');
  });
});