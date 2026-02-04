// UI Module - Interface Components
const UI = {
  currentBase: 'USD',
  currentTarget: 'EUR',
  currentAmount: 1,
  currentTimeframe: 7,
  historicalData: null,
  
  init() {
    this.render();
    this.attachEventListeners();
  },
  
  render() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
      <div class="converter-panel">
        <div class="panel-header">
          <h2 class="panel-title">CURRENCY CONVERTER</h2>
        </div>
        
        <div class="converter-grid">
          <div class="input-group">
            <label class="input-label">FROM</label>
            <div class="input-row">
              <input 
                type="number" 
                id="amount-input" 
                class="input-field" 
                value="1" 
                step="0.01"
                min="0"
              >
              <select id="from-currency" class="select-field">
                ${this.renderCurrencyOptions('USD')}
              </select>
            </div>
          </div>
          
          <button class="swap-button" id="swap-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <polyline points="19 12 12 19 5 12"></polyline>
            </svg>
          </button>
          
          <div class="input-group">
            <label class="input-label">TO</label>
            <div class="input-row">
              <input 
                type="text" 
                id="result-output" 
                class="input-field output-field" 
                value="0.00" 
                readonly
              >
              <select id="to-currency" class="select-field">
                ${this.renderCurrencyOptions('EUR')}
              </select>
            </div>
          </div>
        </div>
        
        <div class="rate-display" id="rate-display">
          <span class="rate-text">Loading rates...</span>
          <button class="favorite-btn" id="favorite-btn" title="Add to favorites">
            ★
          </button>
        </div>
      </div>
      
      <!-- Favorites Panel -->
      <div class="favorites-panel" id="favorites-panel">
        <!-- Rendered by updateFavorites() -->
      </div>
      
      <div class="dashboard-grid">
        <div class="graph-panel">
          <div class="panel-header">
            <h2 class="panel-title">EXCHANGE RATE HISTORY</h2>
            <div class="timeframe-selector">
              <button class="timeframe-btn active" data-days="7">7D</button>
              <button class="timeframe-btn" data-days="30">30D</button>
              <button class="timeframe-btn" data-days="90">90D</button>
              <button class="timeframe-btn" data-days="365">1Y</button>
            </div>
          </div>
          <div class="graph-container" id="graph-container">
            <div class="graph-loading">Loading chart data...</div>
          </div>
        </div>
        
        <div class="widgets-container" id="widgets-container">
          <!-- Widgets render here -->
        </div>
      </div>
    `;
  },
  
  renderCurrencyOptions(selected) {
    return Exchange.currencies.map(curr => 
      `<option value="${curr}" ${curr === selected ? 'selected' : ''}>
        ${curr}
      </option>`
    ).join('');
  },
  
  attachEventListeners() {
    const amountInput = document.getElementById('amount-input');
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    const swapBtn = document.getElementById('swap-btn');
    const favBtn = document.getElementById('favorite-btn');
    
    amountInput?.addEventListener('input', () => this.updateConversion());
    fromSelect?.addEventListener('change', () => {
      this.updateConversion();
      this.updateGraph();
      this.updateWidgets();
      this.updateFavoriteButton();
    });
    toSelect?.addEventListener('change', () => {
      this.updateConversion();
      this.updateGraph();
      this.updateWidgets();
      this.updateFavoriteButton();
    });
    swapBtn?.addEventListener('click', () => this.swapCurrencies());
    favBtn?.addEventListener('click', () => this.toggleFavorite());
    
    // Timeframe buttons
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTimeframe = parseInt(e.target.dataset.days);
        this.updateGraph();
        this.updateWidgets();
      });
    });
    
    this.updateFavoriteButton();
    this.updateFavorites();
  },
  
  async updateConversion() {
    const amount = parseFloat(document.getElementById('amount-input').value) || 0;
    const from = document.getElementById('from-currency').value;
    const to = document.getElementById('to-currency').value;
    
    this.currentAmount = amount;
    this.currentBase = from;
    this.currentTarget = to;
    
    const data = await Exchange.getLatestRates(from);
    if (!data || !data.rates) {
      this.showError('Failed to load exchange rates');
      return;
    }
    
    const rate = data.rates[to] || 1;
    const result = amount * rate;
    
    const resultOutput = document.getElementById('result-output');
    const rateDisplay = document.getElementById('rate-display');
    
    if (resultOutput) {
      resultOutput.value = result.toFixed(4);
    }
    
    if (rateDisplay) {
      rateDisplay.innerHTML = `
        <span class="rate-text">
          1 ${from} = ${rate.toFixed(4)} ${to}
        </span>
        <span class="rate-date">Updated: ${data.date || 'Unknown'}</span>
      `;
    }
  },
  
  async updateGraph() {
    const container = document.getElementById('graph-container');
    if (!container) return;
    
    container.innerHTML = '<div class="graph-loading">Loading chart data...</div>';
    
    const data = await Exchange.getHistoricalRates(this.currentBase, this.currentTimeframe);
    if (!data || !data.rates) {
      container.innerHTML = '<div class="graph-error">Failed to load historical data</div>';
      return;
    }
    
    this.historicalData = data;
    
    const chartData = Object.entries(data.rates).map(([date, rates]) => ({
      date: date,
      value: rates[this.currentTarget] || 0
    }));
    
    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    const chartSVG = Charts.createLineChart(chartData);
    container.innerHTML = chartSVG;
  },
  
  updateWidgets() {
    const container = document.getElementById('widgets-container');
    if (!container || !this.historicalData) return;
    
    const rates = Object.values(this.historicalData.rates).map(r => r[this.currentTarget] || 0);
    const currentRate = rates[rates.length - 1];
    const previousRate = rates[rates.length - 2];
    const change24h = ((currentRate - previousRate) / previousRate) * 100;
    
    const high = Math.max(...rates);
    const low = Math.min(...rates);
    const volatility = ((high - low) / low) * 100;
    
    container.innerHTML = `
      <!-- Current Rate Widget -->
      <div class="widget">
        <div class="widget-header">CURRENT RATE</div>
        <div class="widget-body">
          <div class="widget-value">${currentRate.toFixed(4)}</div>
          <div class="widget-label">${this.currentBase}/${this.currentTarget}</div>
        </div>
      </div>
      
      <!-- Trend Widget -->
      <div class="widget ${change24h >= 0 ? 'widget-up' : 'widget-down'}">
        <div class="widget-header">24H CHANGE</div>
        <div class="widget-body">
          <div class="widget-value">
            ${change24h >= 0 ? '▲' : '▼'} ${Math.abs(change24h).toFixed(2)}%
          </div>
          <div class="widget-label">${change24h >= 0 ? 'INCREASE' : 'DECREASE'}</div>
        </div>
      </div>
      
      <!-- High/Low Widget -->
      <div class="widget">
        <div class="widget-header">${this.currentTimeframe}D RANGE</div>
        <div class="widget-body">
          <div class="widget-row">
            <span class="widget-label">HIGH</span>
            <span class="widget-value-sm">${high.toFixed(4)}</span>
          </div>
          <div class="widget-row">
            <span class="widget-label">LOW</span>
            <span class="widget-value-sm">${low.toFixed(4)}</span>
          </div>
        </div>
      </div>
      
      <!-- Volatility Widget -->
      <div class="widget">
        <div class="widget-header">VOLATILITY</div>
        <div class="widget-body">
          <div class="volatility-bar">
            <div class="volatility-fill" style="width: ${Math.min(volatility * 10, 100)}%"></div>
          </div>
          <div class="widget-value-sm">${volatility.toFixed(2)}%</div>
        </div>
      </div>
    `;
  },
  
  toggleFavorite() {
    const isFavorite = Favorites.has(this.currentBase, this.currentTarget);
    if (isFavorite) {
      Favorites.remove(this.currentBase, this.currentTarget);
    } else {
      Favorites.add(this.currentBase, this.currentTarget);
    }
    this.updateFavoriteButton();
    this.updateFavorites();
  },
  
  updateFavoriteButton() {
    const btn = document.getElementById('favorite-btn');
    if (!btn) return;
    
    const isFavorite = Favorites.has(this.currentBase, this.currentTarget);
    btn.classList.toggle('active', isFavorite);
    btn.textContent = isFavorite ? '★' : '☆';
  },
  
  async updateFavorites() {
    const container = document.getElementById('favorites-panel');
    if (!container) return;
    
    const favorites = Favorites.getAll();
    if (favorites.length === 0) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    
    // Fetch rates for favorites
    const data = await Exchange.getLatestRates('USD');
    if (!data || !data.rates) return;
    
    const items = favorites.map(pair => {
      const rate = data.rates[pair.to] / data.rates[pair.from];
      return `
        <div class="favorite-item" data-from="${pair.from}" data-to="${pair.to}">
          <div class="favorite-pair">
            <span class="favorite-from">${pair.from}</span>
            <span class="favorite-arrow">→</span>
            <span class="favorite-to">${pair.to}</span>
          </div>
          <div class="favorite-rate">${rate.toFixed(4)}</div>
          <button class="favorite-remove" data-from="${pair.from}" data-to="${pair.to}">✕</button>
        </div>
      `;
    }).join('');
    
    container.innerHTML = `
      <div class="panel-header">
        <h2 class="panel-title">FAVORITES</h2>
      </div>
      <div class="favorites-list">
        ${items}
      </div>
    `;
    
    // Attach remove listeners
    container.querySelectorAll('.favorite-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const from = btn.dataset.from;
        const to = btn.dataset.to;
        Favorites.remove(from, to);
        this.updateFavorites();
      });
    });
    
    // Attach click listeners to load pair
    container.querySelectorAll('.favorite-item').forEach(item => {
      item.addEventListener('click', () => {
        const from = item.dataset.from;
        const to = item.dataset.to;
        document.getElementById('from-currency').value = from;
        document.getElementById('to-currency').value = to;
        this.updateConversion();
        this.updateGraph();
        this.updateWidgets();
        this.updateFavoriteButton();
      });
    });
  },
  
  swapCurrencies() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    if (fromSelect && toSelect) {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      this.updateConversion();
      this.updateGraph();
      this.updateWidgets();
    }
  },
  
  showError(message) {
    console.error(message);
  }
};
