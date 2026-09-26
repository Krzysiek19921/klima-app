document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('protocol-form');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Aktywuj tryb PDF (dodaje specjalne style i ukrywa przyciski)
      document.body.classList.add('pdf-mode');

      const element = document.querySelector('.container');
      const clientName = document.getElementById('client-name')?.value.trim() || 'Klient';
      const serviceDate = document.getElementById('service-date')?.value || new Date().toISOString().slice(0, 10);
      const safeClientName = clientName.replace(/[^a-zA-Z0-9ąĆęŁńÓśŹŻĄĆĘŁŃÓŚŹŻ_-]/g, '_');
      const fileName = `Protokol_${safeClientName}_${serviceDate}.pdf`;

      // 2. Konfiguracja wygenerowania PDF z zachowaniem kolorów i skali
      const opt = {
        margin: [10, 10, 10, 10],
        filename: fileName,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      // 3. Generowanie PDF
      html2pdf()
        .set(opt)
        .from(element)
        .save()
        .then(() => {
          // Przywróć normalny wygląd aplikacji po zakończeniu pobierania
          document.body.classList.remove('pdf-mode');
        })
        .catch((err) => {
          console.error('Błąd podczas generowania PDF:', err);
          document.body.classList.remove('pdf-mode');
        });
    });
  }
});