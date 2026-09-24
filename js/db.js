const DB_KEYS = {
  SETTINGS: 'klima_settings',
  PROTOCOLS: 'klima_protocols',
  CLIENTS: 'klima_clients'
};

function getStoredData(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error('Błąd odczytu z localStorage:', e);
    return defaultValue;
  }
}

function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error('Błąd zapisu do localStorage:', e);
  }
}

function loadSettings() {
  return getStoredData(DB_KEYS.SETTINGS, {
    name: 'KLIMA-SERWIS Sp. z o.o.',
    nip: '123-456-78-90',
    address: 'ul. Przykładowa 10, Kraków',
    contact: '+48 123 456 789 | serwis@firma.pl',
    haUrl: ''
  });
}