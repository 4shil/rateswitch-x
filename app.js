// RateSwitch X - Main Application
console.log('RateSwitch X initializing...');

// App state
const App = {
  version: '1.0.0',
  online: navigator.onLine,
  
  init() {
    console.log('App v' + this.version + ' started');
    this.updateStatus();
    this.registerServiceWorker();
    this.setupKeyboardShortcuts();
    
    // Initialize UI
    UI.init();
    UI.updateConversion();
    
    // Network status listeners
    window.addEventListener('online', () => {
      this.online = true;
      this.updateStatus();
      UI.updateConversion();
    });
    
    window.addEventListener('offline', () => {
      this.online = false;
      this.updateStatus();
    });
  },
  
  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ignore if typing in input
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      // S - Swap currencies
      if (e.key === 's' || e.key === 'S') {
        e.preventDefault();
        UI.swapCurrencies();
      }
      
      // F - Toggle favorites
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        UI.toggleFavorite();
      }
      
      // M - Toggle multi-currency
      if (e.key === 'm' || e.key === 'M') {
        e.preventDefault();
        UI.toggleMultiMode();
      }
      
      // 1-4 - Timeframe shortcuts
      if (e.key >= '1' && e.key <= '4') {
        e.preventDefault();
        const days = [7, 30, 90, 365][parseInt(e.key) - 1];
        document.querySelectorAll('.timeframe-btn').forEach(btn => {
          btn.classList.remove('active');
          if (parseInt(btn.dataset.days) === days) {
            btn.classList.add('active');
            UI.currentTimeframe = days;
            UI.updateGraph();
            UI.updateWidgets();
          }
        });
      }
    });
  },
  
  updateStatus() {
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = this.online ? 'ONLINE' : 'OFFLINE';
      statusEl.style.background = this.online ? '#22C55E' : '#EAB308';
    }
  },
  
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js')
        .then(reg => console.log('Service Worker registered'))
        .catch(err => console.warn('Service Worker failed:', err));
    }
  }
};

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => App.init());
} else {
  App.init();
}
