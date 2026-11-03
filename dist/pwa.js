(() => {
  const status = document.getElementById('offline-status');
  const button = document.getElementById('install-app');
  const help = document.getElementById('install-help');
  let prompt;
  const installed = () => window.matchMedia('(display-mode: standalone)').matches;
  const ready = () => {
    status.textContent = navigator.onLine ? 'Ready offline — you can play in airplane mode.' : 'Offline — your game and new puzzles still work.';
    if (installed()) { button.hidden = true; help.hidden = true; }
  };
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault(); prompt = event; button.hidden = installed();
  });
  button.addEventListener('click', async () => {
    if (!prompt) return;
    await prompt.prompt();
    const result = await prompt.userChoice;
    prompt = null; button.hidden = true;
    if (result.outcome === 'accepted' && navigator.storage?.persist) navigator.storage.persist().catch(() => {});
  });
  window.addEventListener('appinstalled', () => { button.hidden = true; help.hidden = true; });
  if (!('serviceWorker' in navigator) || !window.isSecureContext) {
    status.textContent = 'Open the hosted HTTPS link to save this app for offline play.';
    return;
  }
  navigator.serviceWorker.register('./sw.js').then(() => navigator.serviceWorker.ready).then(() => {
    ready(); window.addEventListener('online', ready); window.addEventListener('offline', ready);
  }).catch(() => { status.textContent = 'Offline setup failed. Reconnect and reload before your flight.'; });
})();
