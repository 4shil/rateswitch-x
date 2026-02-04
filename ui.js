// UI Module - Interface Components
const UI = {
  currentBase: 'USD',
  currentTarget: 'EUR',
  currentAmount: 1,
  currentTimeframe: 7,
  
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
        </div>
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
        
        <div id="widgets-container">
          <!-- Widgets will be added here -->
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
    
    amountInput?.addEventListener('input', () => this.updateConversion());
    fromSelect?.addEventListener('change', () => {
      this.updateConversion();
      this.updateGraph();
    });
    toSelect?.addEventListener('change', () => {
      this.updateConversion();
      this.updateGraph();
    });
    swapBtn?.addEventListener('click', () => this.swapCurrencies());
    
    // Timeframe buttons
    document.querySelectorAll('.timeframe-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.timeframe-btn').forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.currentTimeframe = parseInt(e.target.dataset.days);
        this.updateGraph();
      });
    });
  },
  
  async updateConversion() {
    const amount = parseFloat(document.getElementById('amount-input').value) || 0;
    const from = document.getElementById('from-currency').value;
    const to = document.getElementById('to-currency').value;
    
    this.currentAmount = amount;
    this.currentBase = from;
    this.currentTarget = to;
    
    // Fetch latest rates
    const data = await Exchange.getLatestRates(from);
    if (!data || !data.rates) {
      this.showError('Failed to load exchange rates');
      return;
    }
    
    // Calculate conversion
    const rate = data.rates[to] || 1;
    const result = amount * rate;
    
    // Update display
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
    
    // Transform data for chart
    const chartData = Object.entries(data.rates).map(([date, rates]) => ({
      date: date,
      value: rates[this.currentTarget] || 0
    }));
    
    // Sort by date
    chartData.sort((a, b) => new Date(a.date) - new Date(b.date));
    
    // Render chart
    const chartSVG = Charts.createLineChart(chartData);
    container.innerHTML = chartSVG;
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
    }
  },
  
  showError(message) {
    console.error(message);
  }
};
