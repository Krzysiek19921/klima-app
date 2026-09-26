const DB_KEYS = {
  SETTINGS: 'klima_settings',
  PROTOCOLS: 'klima_protocols',
  CLIENTS: 'klima_clients'
};

/**
 * Pobiera dane z localStorage dla podanego klucza.
 * @param {string} key - Klucz z obiektu DB_KEYS
 * @param {any} defaultValue - Wartość domyślna w przypadku braku danych lub błędu
 */
function getStoredData(key, defaultValue = []) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (e) {
    console.error(`Błąd odczytu z localStorage [${key}]:`, e);
    return defaultValue;
  }
}

/**
 * Zapisuje dane do localStorage.
 * @param {string} key - Klucz z obiektu DB_KEYS
 * @param {any} data - Dane do zapisania
 * @returns {boolean} Status powodzenia operacji
 */
function saveData(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (e) {
    console.error(`Błąd zapisu do localStorage [${key}]:`, e);
    
    // Obsługa przepełnienia magazynu localStorage (np. przez obrazy podpisów)
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      alert('Błąd: Pamięć podręczna przeglądarki jest pełna! Usuń stare protokoły lub eksportuj je do pliku.');
    }
    return false;
  }
}

/**
 * Pobiera ustawienia firmy. Scalają zapisane dane z domyślnymi, 
 * aby zapobiec brakom kluczy przy aktualizacji aplikacji.
 */
function loadSettings() {
  const defaultSettings = {
    name: 'KLIMA-SERWIS Sp. z o.o.',
    nip: '123-456-78-90',
    address: 'ul. Przykładowa 10, Kraków',
    contact: '+48 123 456 789 | serwis@firma.pl',
    haUrl: ''
  };

  const stored = getStoredData(DB_KEYS.SETTINGS, null);
  if (!stored) {
    return defaultSettings;
  }

  return Object.assign({}, defaultSettings, stored);
}

/**
 * Usuwa protokół po jego identyfikatorze ID
 * @param {string} protocolId 
 */
function deleteProtocolById(protocolId) {
  const protocols = getStoredData(DB_KEYS.PROTOCOLS, []);
  const updatedProtocols = protocols.filter(p => p.id !== protocolId);
  saveData(DB_KEYS.PROTOCOLS, updatedProtocols);
}

/**
 * Eksportuje wszystkie dane z localStorage do pliku .json (Kopia zapasowa)
 */
function exportBackupJSON() {
  const backup = {
    settings: getStoredData(DB_KEYS.SETTINGS, {}),
    protocols: getStoredData(DB_KEYS.PROTOCOLS, []),
    clients: getStoredData(DB_KEYS.CLIENTS, [])
  };

  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(backup, null, 2));
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `klima_backup_${new Date().toISOString().slice(0, 10)}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

/**
 * Pomocnicza funkcja do czyszczenia całej pamięci podręcznej aplikacji
 */
function clearAppData() {
  if (confirm('Czy na pewno chcesz usunąć wszystkie zapisane protokoły, klientów i ustawienia? Warto wcześniej pobrać kopię zapasową.')) {
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
    location.reload();
  }
}