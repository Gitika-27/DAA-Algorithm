import { el, clear } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { svg } from '../lib/dom.js';
import { circleLayout } from '../lib/graphviz.js';
import { tspBruteForce, DEFAULT_CITIES, DEFAULT_COST, randomSymmetricCost } from '../algorithms/exp8.js';

export function render(mount, { navigate }) {
  let cities = [...DEFAULT_CITIES];
  let cost = DEFAULT_COST.map((r) => [...r]);
  const mapHost = el('div');
  const matrixHost = el('div', { class: 'viz-scroll' });
  const statCost = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Minimum cost'), el('div', { class: 'value copper' }, '0')]);
  const statTour = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Optimal tour'), el('div', { class: 'value', style: { fontSize: '13px' } }, '\u2013')]);
  const statPerms = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Permutations tried'), el('div', { class: 'value' }, '0')]);
  const warnBox = el('div', { class: 'field-hint' }, '');

  function drawMatrix(bestPath) {
    const n = cities.length;
    const hotSet = new Set();
    for (let i = 0; i < bestPath.length - 1; i++) hotSet.add(`${bestPath[i]}-${bestPath[i + 1]}`);
    let rows = '<tr><th></th>' + cities.map((c) => `<th>${c}</th>`).join('') + '</tr>';
    for (let i = 0; i < n; i++) {
      rows += `<tr><th>${cities[i]}</th>`;
      for (let j = 0; j < n; j++) {
        const v = cost[i][j];
        const hot = hotSet.has(`${i}-${j}`) || hotSet.has(`${j}-${i}`);
        rows += `<td class="${hot ? 'hot' : ''}">${v === Infinity ? '\u2013' : v}</td>`;
      }
      rows += '</tr>';
    }
    matrixHost.innerHTML = `<table class="dtable">${rows}</table>`;
  }

  function drawMap(bestPath) {
    clear(mapHost);
    const n = cities.length;
    const pts = circleLayout(n, 260, 160, 118);
    const lines = [];
    for (let i = 0; i < bestPath.length - 1; i++) {
      const p1 = pts[bestPath[i]], p2 = pts[bestPath[i + 1]];
      lines.push(svg('line', { x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y, stroke: '#E8A33D', 'stroke-width': 2.4 }));
    }
    const nodeEls = pts.map((p, i) => {
      const g = svg('g', {});
      g.appendChild(svg('circle', { cx: p.x, cy: p.y, r: 18, fill: i === bestPath[0] ? '#E8A33D' : '#1C2438', stroke: '#3A4460', 'stroke-width': 2 }));
      const t = svg('text', { x: p.x, y: p.y + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700, 'font-family': 'JetBrains Mono, monospace', fill: i === bestPath[0] ? '#0E1320' : '#8A93AC' });
      t.textContent = cities[i];
      g.appendChild(t);
      return g;
    });
    mapHost.appendChild(svg('svg', { viewBox: '0 0 520 320', width: '100%', height: 320 }, [...lines, ...nodeEls]));
  }

  function run() {
    const n = cities.length;
    if (n > 9) { warnBox.textContent = 'Brute force checks (n-1)! tours \u2014 keep it at 9 cities or fewer to stay snappy.'; return; }
    warnBox.textContent = '';
    const { bestPath, bestCost, permutationsTried } = tspBruteForce(cost, n);
    statCost.querySelector('.value').textContent = bestCost;
    statTour.querySelector('.value').textContent = bestPath.map((i) => cities[i]).join(' \u2192 ');
    statPerms.querySelector('.value').textContent = permutationsTried;
    drawMap(bestPath);
    drawMatrix(bestPath);
  }

  function randomize(n) {
    cities = Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i));
    cost = randomSymmetricCost(n);
    run();
  }

  const sizeField = el('input', { type: 'range', min: 4, max: 9, value: cities.length });
  const sizeLabel = el('span', { style: { fontFamily: 'var(--font-mono)', color: 'var(--copper)', fontWeight: 700 } }, String(cities.length));
  sizeField.addEventListener('input', () => sizeLabel.textContent = sizeField.value);
  sizeField.addEventListener('change', () => randomize(Number(sizeField.value)));

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Cities'),
    el('div', { class: 'field' }, [el('label', {}, ['Number of cities \u2014 ', sizeLabel]), sizeField]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: () => run() }, 'Solve current'),
      el('button', { class: 'btn ghost', onclick: () => randomize(cities.length) }, 'Randomize costs')
    ]),
    warnBox
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statCost, statPerms]), el('div', { style: { marginTop: '10px' } }, statTour)]);

  const viz = el('div', { class: 'viz-area' }, [mapHost, matrixHost]);

  mount.appendChild(pageHeader('exp8', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel]), viz]));

  run();
  return { destroy: () => {} };
}
