// Cache Module - Memory and persistence layer
const Cache = {
  // Memory cache
  memory: {
    rates: null,
    historical: {},
    timestamp: null
  },
  
  // Cache duration (15 minutes)
  CACHE_DURATION: 15 * 60 * 1000,
  
  // Initialize cache from localStorage
  init() {
    const stored = Storage.loadRates();
    if (stored) {
      this.memory.rates = stored;
      this.memory.timestamp = parseInt(localStorage.getItem(Storage.CACHE_TIME_KEY) || '0');
    }
    console.log('Cache initialized');
  },
  
  // Check if cache is valid
  isValid() {
    if (!this.memory.timestamp) return false;
    return (Date.now() - this.memory.timestamp) < this.CACHE_DURATION;
  },
  
  // Get cached rates
  getRates() {
    if (this.isValid() && this.memory.rates) {
      console.log('Using cached rates');
      return this.memory.rates;
    }
    return null;
  },
  
  // Set rates in cache
  setRates(data) {
    this.memory.rates = data;
    this.memory.timestamp = Date.now();
    Storage.saveRates(data);
    console.log('Rates cached');
  },
  
  // Get historical data from cache
  getHistorical(base, days) {
    const key = `${base}_${days}`;
    const cached = this.memory.historical[key];
    
    if (cached && (Date.now() - cached.timestamp) < this.CACHE_DURATION) {
      console.log('Using cached historical data');
      return cached.data;
    }
    return null;
  },
  
  // Set historical data in cache
  setHistorical(base, days, data) {
    const key = `${base}_${days}`;
    this.memory.historical[key] = {
      data: data,
      timestamp: Date.now()
    };
    console.log('Historical data cached');
  },
  
  // Clear all cache
  clear() {
    this.memory = {
      rates: null,
      historical: {},
      timestamp: null
    };
    localStorage.removeItem(Storage.RATES_KEY);
    localStorage.removeItem(Storage.CACHE_TIME_KEY);
    console.log('Cache cleared');
  },
  
  // Get cache info
  getInfo() {
    const age = this.memory.timestamp 
      ? Math.floor((Date.now() - this.memory.timestamp) / 60000)
      : null;
      
    return {
      hasRates: !!this.memory.rates,
      isValid: this.isValid(),
      ageMinutes: age,
      historicalCount: Object.keys(this.memory.historical).length
    };
  }
};

// Initialize cache on load
Cache.init();
