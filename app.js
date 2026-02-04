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
    
    // Network status listeners
    window.addEventListener('online', () => {
      this.online = true;
      this.updateStatus();
    });
    
    window.addEventListener('offline', () => {
      this.online = false;
      this.updateStatus();
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
