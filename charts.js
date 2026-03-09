// Charts Module — dark-themed SVG line chart with gradient fill and hover tooltips
const Charts = {
  config: {
    padding: { top: 16, right: 12, bottom: 36, left: 52 },
    accent: '#6366f1',
    gridLines: 4,
  },

  renderLineChart(svgId, data) {
    const svg = document.getElementById(svgId);
    if (!svg || !data?.length) return;

    const W = svg.parentElement.clientWidth || 700;
    const H = 200;
    const { padding: P } = this.config;
    const cW = W - P.left - P.right;
    const cH = H - P.top - P.bottom;

    const vals  = data.map(d => d.value);
    const min   = Math.min(...vals);
    const max   = Math.max(...vals);
    const range = max - min || 1;

    const sx = i => P.left + (i / (data.length - 1)) * cW;
    const sy = v => P.top  + cH - ((v - min) / range) * cH;

    // Build smooth path using bezier curves
    let linePath = '';
    data.forEach((d, i) => {
      const x = sx(i), y = sy(d.value);
      if (i === 0) { linePath = `M${x},${y}`; return; }
      const px  = sx(i - 1), py = sy(data[i - 1].value);
      const cpx = (px + x) / 2;
      linePath += ` C${cpx},${py} ${cpx},${y} ${x},${y}`;
    });

    // Area fill path
    const first = { x: sx(0),              y: sy(data[0].value) };
    const last  = { x: sx(data.length - 1), y: sy(data[data.length - 1].value) };
    const areaPath = `${linePath} L${last.x},${P.top + cH} L${first.x},${P.top + cH} Z`;

    // Grid lines + Y labels
    let gridHTML = '';
    for (let i = 0; i <= this.config.gridLines; i++) {
      const y = P.top + (cH / this.config.gridLines) * i;
      const v = max - (range / this.config.gridLines) * i;
      gridHTML += `
        <line x1="${P.left}" y1="${y}" x2="${W - P.right}" y2="${y}"
              stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
        <text x="${P.left - 6}" y="${y + 4}" text-anchor="end"
              font-size="10" fill="rgba(240,240,248,0.35)" font-family="monospace">
          ${v.toFixed(3)}
        </text>`;
    }

    // X axis date labels (show 5 evenly spaced)
    let xLabels = '';
    const step = Math.max(1, Math.floor(data.length / 5));
    for (let i = 0; i < data.length; i += step) {
      const d = data[i];
      const x = sx(i);
      const label = new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      xLabels += `<text x="${x}" y="${H - 6}" text-anchor="middle"
                        font-size="10" fill="rgba(240,240,248,0.35)" font-family="sans-serif">
                    ${label}
                  </text>`;
    }

    // Invisible hover hit areas
    let hoverAreas = '';
    const colW = cW / data.length;
    data.forEach((d, i) => {
      hoverAreas += `<rect
        x="${sx(i) - colW / 2}" y="${P.top}" width="${colW}" height="${cH}"
        fill="transparent" class="chart-hover-area"
        data-i="${i}" data-date="${d.date}" data-value="${d.value}"
      />`;
    });

    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', `${H}`);
    svg.innerHTML = `
      <defs>
        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stop-color="${this.config.accent}" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="${this.config.accent}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      ${gridHTML}
      <path d="${areaPath}" fill="url(#chartGrad)"/>
      <path d="${linePath}" fill="none" stroke="${this.config.accent}"
            stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      ${xLabels}
      ${hoverAreas}
      <!-- Current value dot -->
      <circle cx="${last.x}" cy="${last.y}" r="5" fill="${this.config.accent}"
              stroke="rgba(8,8,16,0.9)" stroke-width="2"/>
    `;

    // Tooltip hover
    const tooltip = document.getElementById('chart-tooltip');
    svg.querySelectorAll('.chart-hover-area').forEach(area => {
      area.addEventListener('mouseenter', (e) => {
        if (!tooltip) return;
        const val  = parseFloat(area.dataset.value);
        const date = new Date(area.dataset.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
        document.getElementById('tt-date').textContent = date;
        document.getElementById('tt-rate').textContent = val.toFixed(4);
        tooltip.classList.add('visible');

        const rect    = svg.getBoundingClientRect();
        const areaRect = area.getBoundingClientRect();
        tooltip.style.left = `${areaRect.left - rect.left + 10}px`;
        tooltip.style.top  = `${areaRect.top  - rect.top  - 56}px`;
      });
      area.addEventListener('mouseleave', () => tooltip?.classList.remove('visible'));
    });
  },
};
