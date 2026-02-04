// Storage Module - LocalStorage wrapper
const Storage = {
  // Keys
  RATES_KEY: 'rsx_rates',
  FAVORITES_KEY: 'rsx_favorites',
  CACHE_TIME_KEY: 'rsx_cache_time',
  
  // Save exchange rates
  saveRates(rates) {
    try {
      localStorage.setItem(this.RATES_KEY, JSON.stringify(rates));
      localStorage.setItem(this.CACHE_TIME_KEY, Date.now().toString());
      return true;
    } catch (e) {
      console.error('Storage save failed:', e);
      return false;
    }
  },
  
  // Load exchange rates
  loadRates() {
    try {
      const data = localStorage.getItem(this.RATES_KEY);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      console.error('Storage load failed:', e);
      return null;
    }
  },
  
  // Get cache age in minutes
  getCacheAge() {
    const cacheTime = localStorage.getItem(this.CACHE_TIME_KEY);
    if (!cacheTime) return Infinity;
    return Math.floor((Date.now() - parseInt(cacheTime)) / 60000);
  },
  
  // Save favorites
  saveFavorites(favorites) {
    try {
      localStorage.setItem(this.FAVORITES_KEY, JSON.stringify(favorites));
      return true;
    } catch (e) {
      console.error('Favorites save failed:', e);
      return false;
    }
  },
  
  // Load favorites
  loadFavorites() {
    try {
      const data = localStorage.getItem(this.FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.error('Favorites load failed:', e);
      return [];
    }
  }
};
