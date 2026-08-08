import { el } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { renderBars } from '../lib/arrayviz.js';
import { drawGroupedBars } from '../lib/charts.js';
import { minMaxDC, minMaxNaive, performanceTable } from '../algorithms/exp5.js';

export function render(mount, { navigate }) {
  let arr = [3, 1, 7, 4, 9, 2, 8, 5, 6, 0];
  const arrField = el('textarea', { rows: 2 }, arr.join(', '));
  const bars = el('div');
  const statMin = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Minimum'), el('div', { class: 'value' }, '\u2013')]);
  const statMax = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Maximum'), el('div', { class: 'value' }, '\u2013')]);
  const statDC = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'D&C comparisons'), el('div', { class: 'value copper' }, '0')]);
  const statNaive = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Naive comparisons'), el('div', { class: 'value rose' }, '0')]);
  const benchCanvas = el('canvas', { width: 560, height: 220, style: { width: '100%', height: '220px' } });
  const tableHost = el('div', { class: 'viz-scroll' });

  function run() {
    const dc = minMaxDC(arr);
    const naive = minMaxNaive(arr);
    statMin.querySelector('.value').textContent = dc.min;
    statMax.querySelector('.value').textContent = dc.max;
    statDC.querySelector('.value').textContent = dc.comparisons;
    statNaive.querySelector('.value').textContent = naive.comparisons;

    const minIdx = arr.indexOf(dc.min), maxIdx = arr.indexOf(dc.max);
    renderBars(bars, arr, { j: [minIdx], pivot: [maxIdx] }, { height: 180 });

    tableHost.innerHTML = `<table class="dtable"><thead><tr><th>Index</th>${arr.map((_, i) => `<th>${i}</th>`).join('')}</tr></thead>
      <tbody><tr><td>Value</td>${arr.map((v, i) => `<td class="${i === minIdx || i === maxIdx ? 'hot' : ''}">${v}</td>`).join('')}</tr></tbody></table>`;
  }

  function applyInputs() {
    const parsed = arrField.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    if (parsed.length >= 2) arr = parsed;
    run();
  }
  function randomize() {
    arr = Array.from({ length: 10 + Math.floor(Math.random() * 8) }, () => Math.floor(Math.random() * 50));
    arrField.value = arr.join(', ');
    run();
  }
  function runBenchmark() {
    const rows = performanceTable([10, 100, 1000, 10000]);
    drawGroupedBars(benchCanvas, rows, ['dc', 'naive'], ['#E8A33D', '#E8697F']);
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Input'),
    el('div', { class: 'field' }, [el('label', {}, 'Array (comma separated)'), arrField]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: applyInputs }, 'Find min/max'),
      el('button', { class: 'btn ghost', onclick: randomize }, 'Randomize')
    ]),
    el('div', { class: 'field-hint' }, 'Pairing elements before comparing lets the algorithm find both extremes in about 3n/2 comparisons instead of the naive 2n.')
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statMin, statMax, statDC, statNaive])]);
  const benchPanel = el('div', { class: 'panel' }, [
    el('h4', {}, 'Comparisons vs array size'),
    el('button', { class: 'btn', onclick: runBenchmark }, 'Run benchmark'),
    benchCanvas,
    el('div', { class: 'legend' }, [
      el('span', {}, [el('i', { style: { background: '#E8A33D' } }), 'Divide & Conquer']),
      el('span', {}, [el('i', { style: { background: '#E8697F' } }), 'Naive scan'])
    ])
  ]);

  const viz = el('div', { class: 'viz-area' }, [bars, tableHost]);

  mount.appendChild(pageHeader('exp5', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel, benchPanel]), viz]));

  run();
  return { destroy: () => {} };
}
