// Draws a complexity "fingerprint" sparkline onto a canvas already sized via CSS.
export function drawSparkline(canvas, fn, { color = '#E8A33D', points = 40 } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 240, h = canvas.clientHeight || 46;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  const xs = Array.from({ length: points }, (_, i) => 1 + (i / (points - 1)) * 99);
  const ys = xs.map(fn);
  const maxY = Math.max(...ys), minY = Math.min(...ys);
  const pad = 4;
  const px = (x) => pad + (x / 100) * (w - pad * 2);
  const py = (y) => h - pad - ((y - minY) / (maxY - minY || 1)) * (h - pad * 2);

  // faint fill
  ctx.beginPath();
  ctx.moveTo(px(xs[0]), h);
  xs.forEach((x, i) => ctx.lineTo(px(x), py(ys[i])));
  ctx.lineTo(px(xs[xs.length - 1]), h);
  ctx.closePath();
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, color + '33');
  grad.addColorStop(1, color + '00');
  ctx.fillStyle = grad;
  ctx.fill();

  // line
  ctx.beginPath();
  xs.forEach((x, i) => i === 0 ? ctx.moveTo(px(x), py(ys[i])) : ctx.lineTo(px(x), py(ys[i])));
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.75;
  ctx.stroke();
}

// Simple grouped bar chart. series: [{label, values:[{name,value}], color}]
export function drawGroupedBars(canvas, groups, seriesKeys, colors, { yLabel = '' } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const w = canvas.clientWidth || 500, h = canvas.clientHeight || 220;
  canvas.width = w * dpr; canvas.height = h * dpr;
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  ctx.clearRect(0, 0, w, h);
  ctx.font = '11px JetBrains Mono, monospace';

  const padL = 46, padB = 34, padT = 14, padR = 14;
  const plotW = w - padL - padR, plotH = h - padT - padB;
  const maxVal = Math.max(1, ...groups.flatMap(g => seriesKeys.map(k => g[k] || 0)));
  const groupW = plotW / groups.length;
  const barW = Math.min(26, (groupW * 0.66) / seriesKeys.length);

  // axes
  ctx.strokeStyle = '#2A3348';
  ctx.beginPath();
  ctx.moveTo(padL, padT); ctx.lineTo(padL, padT + plotH); ctx.lineTo(padL + plotW, padT + plotH);
  ctx.stroke();

  // gridlines + y labels
  ctx.fillStyle = '#5C6480';
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const val = (maxVal / ticks) * t;
    const y = padT + plotH - (val / maxVal) * plotH;
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.beginPath(); ctx.moveTo(padL, y); ctx.lineTo(padL + plotW, y); ctx.stroke();
    ctx.fillText(Math.round(val), 4, y + 3);
  }

  groups.forEach((g, gi) => {
    const gx = padL + gi * groupW + groupW / 2 - (barW * seriesKeys.length) / 2;
    seriesKeys.forEach((k, si) => {
      const val = g[k] || 0;
      const bh = (val / maxVal) * plotH;
      const x = gx + si * barW;
      const y = padT + plotH - bh;
      ctx.fillStyle = colors[si % colors.length];
      ctx.fillRect(x, y, barW - 4, bh);
    });
    ctx.fillStyle = '#8A93AC';
    ctx.textAlign = 'center';
    ctx.fillText(g.label, padL + gi * groupW + groupW / 2, padT + plotH + 16);
    ctx.textAlign = 'left';
  });
}
