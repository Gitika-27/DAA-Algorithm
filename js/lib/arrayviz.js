import { el, clear } from './dom.js';

// Renders array values as a row of boxes. markers: {index: 'low'|'high'|'pos'|'found'|'i'|'j'|'pivot'|'sorted'}
export function renderArrayBoxes(container, arr, markers = {}, opts = {}) {
  clear(container);
  const wrap = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '5px' } });
  const colors = {
    low: '#4FD1C5', high: '#E8697F', pos: '#E8A33D', found: '#7FCE9A',
    i: '#4FD1C5', j: '#E8A33D', pivot: '#E8697F', sorted: '#7FCE9A22'
  };
  arr.forEach((v, idx) => {
    const tags = [];
    for (const [key, val] of Object.entries(markers)) {
      if (Array.isArray(val)) { if (val.includes(idx)) tags.push(key); }
      else if (val === idx) tags.push(key);
    }
    const bg = tags.length ? (colors[tags[tags.length - 1]] || '#1C2438') : '#1C2438';
    const box = el('div', {
      style: {
        minWidth: opts.wide ? '38px' : '30px', height: opts.wide ? '38px' : '30px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '6px', fontFamily: 'JetBrains Mono, monospace', fontSize: '11.5px',
        background: tags.length ? bg + (bg.length === 7 ? '33' : '') : 'var(--bg-panel-2)',
        border: `1.5px solid ${tags.length ? bg : 'var(--border)'}`,
        color: tags.length ? bg : 'var(--text-muted)', fontWeight: tags.length ? '700' : '500',
        position: 'relative', flexDirection: 'column'
      }
    }, [
      el('span', {}, String(v)),
    ]);
    if (tags.length) {
      box.appendChild(el('span', {
        style: { position: 'absolute', bottom: '-16px', fontSize: '8.5px', color: bg, letterSpacing: '.5px' }
      }, tags[tags.length - 1].toUpperCase()));
    }
    box.title = `index ${idx}`;
    wrap.appendChild(box);
  });
  container.appendChild(wrap);
}

// Renders array as vertical bars sized by value (for sort/min-max visualizations)
export function renderBars(container, arr, markers = {}, opts = {}) {
  clear(container);
  const max = Math.max(...arr, 1);
  const wrap = el('div', { style: { display: 'flex', alignItems: 'flex-end', gap: '3px', height: (opts.height || 160) + 'px' } });
  const colors = { i: '#4FD1C5', j: '#E8A33D', pivot: '#E8697F', sorted: '#7FCE9A' };
  arr.forEach((v, idx) => {
    const tags = [];
    for (const [key, val] of Object.entries(markers)) {
      if (Array.isArray(val)) { if (val.includes(idx)) tags.push(key); }
      else if (val === idx) tags.push(key);
    }
    const color = tags.length ? (colors[tags[tags.length - 1]] || '#3A4460') : '#3A4460';
    const h = Math.max(3, (v / max) * (opts.height || 160));
    wrap.appendChild(el('div', {
      title: `${v}`,
      style: {
        width: Math.max(3, Math.floor((opts.width || 480) / arr.length) - 2) + 'px',
        height: h + 'px', background: color, borderRadius: '2px 2px 0 0',
        transition: 'height .12s'
      }
    }));
  });
  container.appendChild(wrap);
}
