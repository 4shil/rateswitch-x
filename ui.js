// UI Module — Redesigned dashboard renderer
const UI = {
  currentBase: 'USD',
  currentTarget: 'EUR',
  currentAmount: 1,
  currentTimeframe: 7,
  historicalData: null,

  init() {
    this.render();
    this.attachEventListeners();
    this.updateConversion();
    this.updateGraph();
    this.updateFavorites();
  },

  // ── Render ──────────────────────────────────────────────────────────────
  render() {
    const content = document.getElementById('main-content');
    content.innerHTML = `
      <!-- Converter Card -->
      <section class="card" id="section-convert" aria-label="Currency converter">
        <div class="card-header">
          <span class="card-title">Currency Converter</span>
          <button class="favorite-btn" id="favorite-btn" aria-label="Toggle favorite pair" title="Toggle favorite">☆</button>
        </div>

        <!-- Hero Rate -->
        <div class="hero-rate" id="hero-rate">
          <div class="hero-rate-from" id="hero-from">1 USD</div>
          <div class="skeleton skeleton-large" style="width:220px;margin:8px auto"></div>
          <div class="hero-rate-meta">Loading rates...</div>
        </div>

        <!-- Inputs -->
        <div class="converter-grid">
          <div class="input-group">
            <label class="input-label" for="amount-input">Amount</label>
            <div class="input-row">
              <input
                type="number"
                id="amount-input"
                class="input-field"
                value="1"
                step="0.01"
                min="0"
                aria-label="Amount to convert"
                autocomplete="off"
              >
              <select id="from-currency" class="select-field" aria-label="From currency">
                ${this.renderCurrencyOptions('USD')}
              </select>
            </div>
            <div class="error-message" id="amount-error" role="alert">Please enter a valid amount</div>
          </div>

          <button class="swap-button" id="swap-btn" aria-label="Swap currencies" title="Swap (S)">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true">
              <polyline points="17 1 21 5 17 9"/>
              <path d="M3 11V9a4 4 0 014-4h14"/>
              <polyline points="7 23 3 19 7 15"/>
              <path d="M21 13v2a4 4 0 01-4 4H3"/>
            </svg>
          </button>

          <div class="input-group">
            <label class="input-label" for="result-output">Result</label>
            <div class="input-row">
              <input
                type="text"
                id="result-output"
                class="input-field output-field"
                value="0.00"
                readonly
                aria-label="Conversion result"
              >
              <select id="to-currency" class="select-field" aria-label="To currency">
                ${this.renderCurrencyOptions('EUR')}
              </select>
            </div>
          </div>
        </div>
      </section>

      <!-- Favorites -->
      <section class="card" id="section-favorites" aria-label="Favorite currency pairs">
        <div class="card-header">
          <span class="card-title">Favorites</span>
        </div>
        <div id="favorites-chips" class="favorites-scroll"></div>
      </section>

      <!-- Chart -->
      <section class="card" id="section-chart" aria-label="Rate history chart">
        <div class="card-header">
          <span class="card-title">Rate History</span>
          <div class="timeframe-tabs" role="tablist" aria-label="Chart timeframe">
            <button class="tab-btn active" data-days="7"  role="tab" aria-selected="true"  aria-controls="chart-area">7D</button>
            <button class="tab-btn"        data-days="30" role="tab" aria-selected="false" aria-controls="chart-area">30D</button>
            <button class="tab-btn"        data-days="90" role="tab" aria-selected="false" aria-controls="chart-area">90D</button>
            <button class="tab-btn"        data-days="365" role="tab" aria-selected="false" aria-controls="chart-area">1Y</button>
          </div>
        </div>
        <div class="chart-wrapper" id="chart-area" role="tabpanel">
          <svg id="rate-chart" aria-label="Exchange rate chart" role="img"></svg>
          <div class="chart-tooltip" id="chart-tooltip">
            <div class="chart-tooltip-date" id="tt-date"></div>
            <div class="chart-tooltip-rate" id="tt-rate"></div>
          </div>
        </div>
        <!-- Stats row -->
        <div id="stats-row" style="display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:10px;margin-top:16px"></div>
      </section>

      <!-- Multi-currency -->
      <section class="card" aria-label="Multi-currency converter">
        <div class="card-header">
          <span class="card-title">Multi-Currency</span>
          <button class="collapse-btn" id="multi-toggle" aria-expanded="false" aria-controls="multi-body">Show ▾</button>
        </div>
        <div class="collapsible" id="multi-body">
          <div class="multi-controls">
            <input type="number" id="multi-amount" class="input-field" value="1000" step="1" min="0" aria-label="Multi-currency amount">
            <select id="multi-base" class="select-field" aria-label="Base currency for multi-conversion">
              ${this.renderCurrencyOptions('USD')}
            </select>
          </div>
          <div class="multi-results-grid" id="multi-results"></div>
        </div>
      </section>
    `;
  },

  renderCurrencyOptions(selected) {
    return Exchange.currencies.map(c =>
      `<option value="${c}" ${c === selected ? 'selected' : ''}>${c}</option>`
    ).join('');
  },

  // ── Events ──────────────────────────────────────────────────────────────
  attachEventListeners() {
    // Converter inputs
    document.getElementById('amount-input')?.addEventListener('input', () => this.updateConversion());
    document.getElementById('from-currency')?.addEventListener('change', () => this.onPairChange());
    document.getElementById('to-currency')?.addEventListener('change', () => this.onPairChange());
    document.getElementById('swap-btn')?.addEventListener('click', () => this.swapCurrencies());
    document.getElementById('favorite-btn')?.addEventListener('click', () => this.toggleFavorite());

    // Timeframe tabs
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-btn').forEach(b => {
          b.classList.remove('active');
          b.setAttribute('aria-selected', 'false');
        });
        e.target.classList.add('active');
        e.target.setAttribute('aria-selected', 'true');
        this.currentTimeframe = parseInt(e.target.dataset.days);
        this.updateGraph();
      });
    });

    // Multi-currency toggle
    document.getElementById('multi-toggle')?.addEventListener('click', () => this.toggleMulti());
    document.getElementById('multi-amount')?.addEventListener('input', () => this.updateMultiCurrency());
    document.getElementById('multi-base')?.addEventListener('change', () => this.updateMultiCurrency());

    // Shortcuts overlay
    document.getElementById('shortcuts-hint-btn')?.addEventListener('click', () => this.openShortcuts());
    document.getElementById('shortcuts-overlay')?.addEventListener('click', (e) => {
      if (e.target === document.getElementById('shortcuts-overlay')) this.closeShortcuts();
    });

    this.updateFavoriteButton();
  },

  onPairChange() {
    this.currentBase   = document.getElementById('from-currency').value;
    this.currentTarget = document.getElementById('to-currency').value;
    this.updateConversion();
    this.updateGraph();
    this.updateFavoriteButton();
  },

  showSection(id) {
    document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
    document.getElementById(`nav-${id}`)?.classList.add('active');
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  },

  // ── Conversion ──────────────────────────────────────────────────────────
  async updateConversion() {
    const amountInput = document.getElementById('amount-input');
    const amount = parseFloat(amountInput?.value);
    const from = document.getElementById('from-currency')?.value || this.currentBase;
    const to   = document.getElementById('to-currency')?.value   || this.currentTarget;

    this.currentAmount = amount;
    this.currentBase   = from;
    this.currentTarget = to;

    // Validate
    const errorEl = document.getElementById('amount-error');
    if (!amount || amount <= 0 || isNaN(amount)) {
      amountInput?.classList.add('error');
      if (errorEl) errorEl.classList.add('visible');
      return;
    }
    amountInput?.classList.remove('error');
    if (errorEl) errorEl.classList.remove('visible');

    const data = await Exchange.getLatestRates(from);
    if (!data?.rates) { this.showToast('Failed to load rates', 'error'); return; }

    const rate   = data.rates[to] || 1;
    const result = amount * rate;

    // Update result
    const out = document.getElementById('result-output');
    if (out) out.value = result.toLocaleString('en-US', { maximumFractionDigits: 4 });

    // Update hero
    const hero = document.getElementById('hero-rate');
    if (hero) {
      hero.innerHTML = `
        <div class="hero-rate-from">1 ${from} =</div>
        <div class="hero-rate-value">${rate.toLocaleString('en-US', { maximumFractionDigits: 4 })}</div>
        <div class="hero-rate-to">${to}</div>
        <div class="hero-rate-meta">Last updated ${data.date || 'recently'}</div>
      `;
    }
  },

  // ── Graph ───────────────────────────────────────────────────────────────
  async updateGraph() {
    const chartEl = document.getElementById('rate-chart');
    const statsRow = document.getElementById('stats-row');
    if (!chartEl) return;

    // Show skeleton
    chartEl.innerHTML = '';
    if (statsRow) statsRow.innerHTML = '';

    const data = await Exchange.getHistoricalRates(this.currentBase, this.currentTimeframe);
    if (!data?.rates) { return; }

    this.historicalData = data;

    const chartData = Object.entries(data.rates)
      .map(([date, rates]) => ({ date, value: rates[this.currentTarget] || 0 }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    Charts.renderLineChart('rate-chart', chartData);
    this.renderStats(chartData);
  },

  renderStats(chartData) {
    const statsRow = document.getElementById('stats-row');
    if (!statsRow || !chartData.length) return;

    const vals = chartData.map(d => d.value);
    const cur  = vals[vals.length - 1];
    const prev = vals[vals.length - 2] || cur;
    const high = Math.max(...vals);
    const low  = Math.min(...vals);
    const chg  = ((cur - prev) / prev) * 100;
    const vol  = ((high - low) / low) * 100;

    const stat = (label, value, color = 'var(--text-primary)') =>
      `<div class="multi-item">
        <div class="multi-item-code">${label}</div>
        <div class="multi-item-value" style="font-size:16px;color:${color}">${value}</div>
      </div>`;

    statsRow.innerHTML =
      stat('Current',    cur.toFixed(4)) +
      stat('Change',     `${chg >= 0 ? '+' : ''}${chg.toFixed(2)}%`, chg >= 0 ? '#4ade80' : '#f87171') +
      stat(`${this.currentTimeframe}D High`, high.toFixed(4), '#4ade80') +
      stat(`${this.currentTimeframe}D Low`,  low.toFixed(4),  '#f87171') +
      stat('Volatility', `${vol.toFixed(2)}%`);
  },

  // ── Favorites ───────────────────────────────────────────────────────────
  toggleFavorite() {
    const isFav = Favorites.has(this.currentBase, this.currentTarget);
    if (isFav) {
      Favorites.remove(this.currentBase, this.currentTarget);
      this.showToast('Removed from favorites', 'info');
    } else {
      Favorites.add(this.currentBase, this.currentTarget);
      this.showToast('⭐ Added to favorites', 'success');
    }
    this.updateFavoriteButton();
    this.updateFavorites();
  },

  updateFavoriteButton() {
    const btn = document.getElementById('favorite-btn');
    if (!btn) return;
    const isFav = Favorites.has(this.currentBase, this.currentTarget);
    btn.classList.toggle('active', isFav);
    btn.textContent = isFav ? '★' : '☆';
    btn.setAttribute('aria-pressed', String(isFav));
  },

  updateFavorites() {
    const container = document.getElementById('favorites-chips');
    if (!container) return;

    const favs = Favorites.getAll();
    if (!favs.length) {
      container.innerHTML = '<div class="empty-favorites">No favorites yet — star a pair to save it here ✨</div>';
      return;
    }

    container.innerHTML = favs.map(pair => `
      <div class="fav-chip" tabindex="0" role="button" aria-label="Load ${pair.from} to ${pair.to}"
           data-from="${pair.from}" data-to="${pair.to}">
        <span class="fav-chip-pair">${pair.from} / ${pair.to}</span>
        <button class="fav-chip-remove" data-from="${pair.from}" data-to="${pair.to}"
                aria-label="Remove ${pair.from}/${pair.to} from favorites" title="Remove">✕</button>
      </div>
    `).join('');

    container.querySelectorAll('.fav-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        if (e.target.classList.contains('fav-chip-remove')) return;
        document.getElementById('from-currency').value = chip.dataset.from;
        document.getElementById('to-currency').value   = chip.dataset.to;
        this.onPairChange();
      });
      chip.addEventListener('keydown', e => { if (e.key === 'Enter') chip.click(); });
    });

    container.querySelectorAll('.fav-chip-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        Favorites.remove(btn.dataset.from, btn.dataset.to);
        this.updateFavorites();
        this.updateFavoriteButton();
        this.showToast('Removed from favorites', 'info');
      });
    });
  },

  // ── Multi-currency ───────────────────────────────────────────────────────
  toggleMulti() {
    const body   = document.getElementById('multi-body');
    const toggle = document.getElementById('multi-toggle');
    if (!body) return;
    const isOpen = body.classList.toggle('expanded');
    toggle.textContent = isOpen ? 'Hide ▴' : 'Show ▾';
    toggle.setAttribute('aria-expanded', String(isOpen));
    if (isOpen) this.updateMultiCurrency();
  },

  async updateMultiCurrency() {
    const amount = parseFloat(document.getElementById('multi-amount')?.value) || 0;
    const base   = document.getElementById('multi-base')?.value || 'USD';
    const grid   = document.getElementById('multi-results');
    if (!grid) return;

    grid.innerHTML = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','SGD','HKD','NOK']
      .filter(c => c !== base)
      .map(() => `<div class="multi-item skeleton" style="height:68px"></div>`)
      .join('');

    const data = await Exchange.getLatestRates(base);
    if (!data?.rates) { grid.innerHTML = '<div style="color:var(--text-muted);font-size:13px">Failed to load rates</div>'; return; }

    const targets = ['USD','EUR','GBP','JPY','AUD','CAD','CHF','CNY','INR','SGD','HKD','NOK'].filter(c => c !== base);
    grid.innerHTML = targets.map(c => {
      const rate = data.rates[c] || 0;
      const val  = (amount * rate).toLocaleString('en-US', { maximumFractionDigits: 2 });
      return `<div class="multi-item">
        <div class="multi-item-code">${c}</div>
        <div class="multi-item-value">${val}</div>
      </div>`;
    }).join('');
  },

  // ── Swap ─────────────────────────────────────────────────────────────────
  swapCurrencies() {
    const from = document.getElementById('from-currency');
    const to   = document.getElementById('to-currency');
    if (!from || !to) return;
    const tmp = from.value;
    from.value = to.value;
    to.value   = tmp;
    this.onPairChange();
    this.showToast('Currencies swapped', 'info');
  },

  // ── Shortcuts ────────────────────────────────────────────────────────────
  openShortcuts() {
    document.getElementById('shortcuts-overlay')?.classList.add('open');
  },

  closeShortcuts() {
    document.getElementById('shortcuts-overlay')?.classList.remove('open');
  },

  // ── Toast ────────────────────────────────────────────────────────────────
  showToast(message, type = 'info') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span>${message}`;
    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 250);
    }, 3000);
  },
};
