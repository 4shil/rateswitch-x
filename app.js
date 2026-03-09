// RateSwitch X — App Entry
const App = {
  version: '2.0.0',
  online: navigator.onLine,

  init() {
    this.registerServiceWorker();
    this.updateStatus();
    this.setupNetworkListeners();
    this.setupKeyboardShortcuts();
    UI.init();
  },

  setupNetworkListeners() {
    window.addEventListener('online', () => {
      this.online = true;
      this.updateStatus();
      UI.updateConversion();
      UI.updateGraph();
      UI.showToast('Back online! Rates refreshed.', 'success');
    });
    window.addEventListener('offline', () => {
      this.online = false;
      this.updateStatus();
      UI.showToast('You\'re offline — showing cached rates', 'info');
    });
  },

  tryReconnect() {
    if (navigator.onLine) {
      this.online = true;
      this.updateStatus();
      UI.updateConversion();
      UI.updateGraph();
      UI.showToast('Reconnected!', 'success');
    } else {
      UI.showToast('Still offline...', 'error');
    }
  },

  updateStatus() {
    const badge  = document.getElementById('status');
    const text   = document.getElementById('status-text');
    const banner = document.getElementById('offline-banner');

    if (badge) {
      badge.className = `status-badge ${this.online ? 'online' : 'offline'}`;
    }
    if (text) text.textContent = this.online ? 'Online' : 'Offline';
    if (banner) banner.classList.toggle('visible', !this.online);
  },

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

      if (e.key === 's' || e.key === 'S') { e.preventDefault(); UI.swapCurrencies(); }
      if (e.key === 'f' || e.key === 'F') { e.preventDefault(); UI.toggleFavorite(); }
      if (e.key === 'm' || e.key === 'M') { e.preventDefault(); UI.toggleMulti(); }
      if (e.key === '?') { e.preventDefault(); UI.openShortcuts(); }
      if (e.key === 'Escape') { UI.closeShortcuts(); }

      if (['1','2','3','4'].includes(e.key)) {
        e.preventDefault();
        const days = [7, 30, 90, 365][parseInt(e.key) - 1];
        document.querySelectorAll('.tab-btn').forEach(btn => {
          const active = parseInt(btn.dataset.days) === days;
          btn.classList.toggle('active', active);
          btn.setAttribute('aria-selected', String(active));
          if (active) { UI.currentTimeframe = days; UI.updateGraph(); }
        });
      }
    });
  },

  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
  },
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
