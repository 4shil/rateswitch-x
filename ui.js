// UI Module - Interface Components
const UI = {
  currentBase: 'USD',
  currentTarget: 'EUR',
  currentAmount: 1,
  
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
        <div id="graphs-container"></div>
        <div id="widgets-container"></div>
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
    fromSelect?.addEventListener('change', () => this.updateConversion());
    toSelect?.addEventListener('change', () => this.updateConversion());
    swapBtn?.addEventListener('click', () => this.swapCurrencies());
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
  
  swapCurrencies() {
    const fromSelect = document.getElementById('from-currency');
    const toSelect = document.getElementById('to-currency');
    
    if (fromSelect && toSelect) {
      const temp = fromSelect.value;
      fromSelect.value = toSelect.value;
      toSelect.value = temp;
      this.updateConversion();
    }
  },
  
  showError(message) {
    console.error(message);
  }
};
