// Exchange Module - Frankfurter API Integration
const Exchange = {
  API_BASE: 'https://api.frankfurter.app',
  
  // Supported currencies
  currencies: [
    'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 
    'INR', 'MXN', 'BRL', 'ZAR', 'SEK', 'NOK', 'DKK', 'PLN',
    'TRY', 'RUB', 'HKD', 'SGD', 'NZD', 'KRW', 'THB', 'MYR'
  ],
  
  // Fetch latest rates
  async getLatestRates(base = 'USD') {
    try {
      const response = await fetch(`${this.API_BASE}/latest?from=${base}`);
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      // Save to cache
      Storage.saveRates({
        base: data.base,
        rates: data.rates,
        date: data.date
      });
      
      return data;
    } catch (error) {
      console.error('Failed to fetch rates:', error);
      // Fallback to cached data
      return Storage.loadRates();
    }
  },
  
  // Fetch historical rates
  async getHistoricalRates(base, days = 7) {
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);
      
      const start = startDate.toISOString().split('T')[0];
      const end = endDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `${this.API_BASE}/${start}..${end}?from=${base}`
      );
      
      if (!response.ok) throw new Error('Historical data fetch failed');
      return await response.json();
    } catch (error) {
      console.error('Failed to fetch historical rates:', error);
      return null;
    }
  },
  
  // Convert amount
  convert(amount, fromRate, toRate) {
    if (!amount || !fromRate || !toRate) return 0;
    return (amount / fromRate) * toRate;
  },
  
  // Format currency
  formatCurrency(amount, currency) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(amount);
  },
  
  // Get currency symbol
  getCurrencySymbol(currency) {
    const symbols = {
      USD: '$', EUR: '€', GBP: '£', JPY: '¥',
      INR: '₹', AUD: 'A$', CAD: 'C$', CHF: 'Fr'
    };
    return symbols[currency] || currency;
  }
};
