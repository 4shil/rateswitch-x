// Charts Module - Pure SVG chart renderer
const Charts = {
  // Chart configuration
  config: {
    width: 800,
    height: 300,
    padding: { top: 20, right: 20, bottom: 40, left: 60 },
    lineWidth: 3,
    pointRadius: 4,
    gridLines: 5
  },
  
  // Create line chart
  createLineChart(data, options = {}) {
    const { width, height, padding } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    if (!data || data.length === 0) {
      return '<text x="50%" y="50%" text-anchor="middle">No data available</text>';
    }
    
    // Extract values
    const values = data.map(d => d.value);
    const dates = data.map(d => d.date);
    
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    
    // Scale functions
    const scaleX = (index) => {
      return padding.left + (index / (data.length - 1)) * chartWidth;
    };
    
    const scaleY = (value) => {
      return padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    };
    
    // Generate path
    let pathData = '';
    data.forEach((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.value);
      pathData += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });
    
    // Generate grid lines
    let gridLines = '';
    for (let i = 0; i <= this.config.gridLines; i++) {
      const y = padding.top + (chartHeight / this.config.gridLines) * i;
      const value = maxValue - (valueRange / this.config.gridLines) * i;
      
      gridLines += `
        <line 
          x1="${padding.left}" 
          y1="${y}" 
          x2="${width - padding.right}" 
          y2="${y}" 
          stroke="#E5E5E5" 
          stroke-width="1"
        />
        <text 
          x="${padding.left - 10}" 
          y="${y + 5}" 
          text-anchor="end" 
          font-size="12" 
          font-family="monospace"
          fill="#666"
        >
          ${value.toFixed(4)}
        </text>
      `;
    }
    
    // Generate points
    let points = '';
    data.forEach((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.value);
      points += `
        <circle 
          cx="${x}" 
          cy="${y}" 
          r="${this.config.pointRadius}" 
          fill="#000" 
          class="chart-point"
          data-value="${point.value}"
          data-date="${point.date}"
        />
      `;
    });
    
    return `
      <svg 
        width="100%" 
        height="${height}" 
        viewBox="0 0 ${width} ${height}"
        class="line-chart"
      >
        <!-- Grid -->
        ${gridLines}
        
        <!-- Line -->
        <path 
          d="${pathData}" 
          fill="none" 
          stroke="#000" 
          stroke-width="${this.config.lineWidth}"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        
        <!-- Points -->
        ${points}
        
        <!-- X-axis -->
        <line 
          x1="${padding.left}" 
          y1="${height - padding.bottom}" 
          x2="${width - padding.right}" 
          y2="${height - padding.bottom}" 
          stroke="#000" 
          stroke-width="2"
        />
        
        <!-- Y-axis -->
        <line 
          x1="${padding.left}" 
          y1="${padding.top}" 
          x2="${padding.left}" 
          y2="${height - padding.bottom}" 
          stroke="#000" 
          stroke-width="2"
        />
      </svg>
    `;
  },
  
  // Create area chart
  createAreaChart(data, options = {}) {
    const { width, height, padding } = this.config;
    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;
    
    if (!data || data.length === 0) {
      return '<text x="50%" y="50%" text-anchor="middle">No data available</text>';
    }
    
    const values = data.map(d => d.value);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    
    const scaleX = (index) => {
      return padding.left + (index / (data.length - 1)) * chartWidth;
    };
    
    const scaleY = (value) => {
      return padding.top + chartHeight - ((value - minValue) / valueRange) * chartHeight;
    };
    
    // Generate area path
    let pathData = `M ${padding.left},${height - padding.bottom}`;
    data.forEach((point, i) => {
      const x = scaleX(i);
      const y = scaleY(point.value);
      pathData += ` L ${x},${y}`;
    });
    pathData += ` L ${scaleX(data.length - 1)},${height - padding.bottom} Z`;
    
    return `
      <svg 
        width="100%" 
        height="${height}" 
        viewBox="0 0 ${width} ${height}"
        class="area-chart"
      >
        <!-- Area -->
        <path 
          d="${pathData}" 
          fill="#3B82F6" 
          fill-opacity="0.2"
          stroke="#3B82F6" 
          stroke-width="${this.config.lineWidth}"
        />
      </svg>
    `;
  },
  
  // Create sparkline (mini chart)
  createSparkline(data, width = 100, height = 30) {
    if (!data || data.length === 0) return '';
    
    const values = data.map(d => typeof d === 'number' ? d : d.value);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min || 1;
    
    let pathData = '';
    values.forEach((value, i) => {
      const x = (i / (values.length - 1)) * width;
      const y = height - ((value - min) / range) * height;
      pathData += i === 0 ? `M ${x},${y}` : ` L ${x},${y}`;
    });
    
    return `
      <svg width="${width}" height="${height}" class="sparkline">
        <path 
          d="${pathData}" 
          fill="none" 
          stroke="#000" 
          stroke-width="2"
        />
      </svg>
    `;
  }
};
// Step3: chart area tweaks (placeholder for timeframe buttons & improved interactions)
// Added lightweight hook for keyboard readout
window.__rateswitch_chart_hooks = window.__rateswitch_chart_hooks || {};
window.__rateswitch_chart_hooks.timeframeControl = true;
// end step3

// Step3: timeframe controls and keyboard hover readout
(function(){
  function addTimeframeControls(){
    const chartHeader=document.querySelector('.chart-header')||document.getElementById('chart')||document.body;
    const tf=document.createElement('div'); tf.className='chart-timeframes';
    ['7D','30D','90D','1Y'].forEach(t=>{
      const b=document.createElement('button'); b.className='tf-btn'; b.textContent=t;
      b.onclick=()=>{ window.setChartRange && window.setChartRange(t); };
      tf.appendChild(b);
    });
    if(chartHeader && chartHeader.firstChild) chartHeader.insertBefore(tf, chartHeader.firstChild); else chartHeader.appendChild(tf);
  }
  function addKeyboardReadout(){
    document.addEventListener('keydown', e=>{
      if(e.key==='ArrowLeft' || e.key==='ArrowRight'){
        const el=document.querySelector('.chart-readout');
        if(el) el.textContent = 'Use arrows to move — sample value: 1.2345';
      }
    });
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', ()=>{addTimeframeControls();addKeyboardReadout();}); else {addTimeframeControls();addKeyboardReadout();}
})();
