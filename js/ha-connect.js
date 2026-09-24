async function sendProtocolToHA(protocolData) {
  const settings = loadSettings();
  if (!settings || !settings.haUrl) return;

  try {
    await fetch(settings.haUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(protocolData)
    });
    console.log('Pomyślnie wysłano dane do Home Assistant');
  } catch (err) {
    console.error('Błąd połączenia z Home Assistant Webhook:', err);
  }
}

async function testHAConnection() {
  const urlInput = document.getElementById('set-ha-url');
  const url = urlInput ? urlInput.value.trim() : '';

  if (!url) {
    alert('Wpisz adres URL Webhooka!');
    return;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ test: true, message: 'Test połączenia z KLIMA-SERWIS' })
    });
    alert('Sygnał testowy został wysłany do Home Assistant!');
  } catch (err) {
    alert('Błąd połączenia z Home Assistant: ' + err.message);
  }
}