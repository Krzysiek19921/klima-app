/**
 * Wysyła protokół serwisowy do Home Assistant przez Webhook
 * @param {Object} protocolData 
 */
async function sendProtocolToHA(protocolData) {
  const settings = typeof loadSettings === 'function' ? loadSettings() : null;
  if (!settings || !settings.haUrl) return;

  try {
    await fetch(settings.haUrl, {
      method: 'POST',
      mode: 'no-cors', // Zapobiega błędom CORS przy zapytaniach do zewnętrznych instancji HA
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify(protocolData)
    });
    console.log('Sygnał protokołu wysłany do Home Assistant Webhook');
  } catch (err) {
    console.error('Błąd połączenia z Home Assistant Webhook:', err);
  }
}

/**
 * Wysyła testowy pakiet danych do wskazanego Webhooka Home Assistant
 */
async function testHAConnection() {
  const urlInput = document.getElementById('set-ha-url');
  const url = urlInput ? urlInput.value.trim() : '';

  if (!url) {
    alert('Wpisz adres URL Webhooka!');
    return;
  }

  // Walidacja struktury adresu URL
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    alert('Adres Webhooka musi zaczynać się od http:// lub https://');
    return;
  }

  try {
    await fetch(url, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 
        'Content-Type': 'application/json' 
      },
      body: JSON.stringify({ 
        test: true, 
        message: 'Test połączenia z aplikacji KLIMA-SERWIS',
        timestamp: new Date().toISOString()
      })
    });
    
    alert('Sygnał testowy został wysłany! Sprawdź zdarzenie w Home Assistant (Automatyzacje / Dev Tools).');
  } catch (err) {
    alert('Nie udało się wysłać sygnału testowego: ' + err.message);
  }
}