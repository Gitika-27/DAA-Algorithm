import { el } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { matrixChainOrder, printOptimalParens } from '../algorithms/exp6.js';

export function render(mount, { navigate }) {
  let dims = [10, 30, 5, 60, 10];
  const dimsField = el('textarea', { rows: 2 }, dims.join(', '));
  const dimsList = el('div', { class: 'viz-scroll' });
  const dpTable = el('div', { class: 'viz-scroll' });
  const statCost = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Minimum scalar mults'), el('div', { class: 'value copper' }, '0')]);
  const statParen = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Matrices'), el('div', { class: 'value' }, '0')]);
  const parenBox = el('div', { class: 'notebox' }, '\u2013');

  function run() {
    const n = dims.length - 1;
    if (n < 1) return;
    const { m, s } = matrixChainOrder(dims);
    statCost.querySelector('.value').textContent = m[1][n];
    statParen.querySelector('.value').textContent = n;
    parenBox.innerHTML = `<b style="color:var(--copper)">Optimal parenthesization:</b><br/><span style="font-family:var(--font-mono); font-size:14px;">${printOptimalParens(s, 1, n)}</span>`;

    dimsList.innerHTML = `<table class="dtable"><thead><tr><th>Matrix</th>${Array.from({ length: n }, (_, i) => `<th>A${i + 1}</th>`).join('')}</tr></thead>
      <tbody><tr><td>Dimensions</td>${Array.from({ length: n }, (_, i) => `<td>${dims[i]}\u00d7${dims[i + 1]}</td>`).join('')}</tr></tbody></table>`;

    let rows = '<tr><th></th>' + Array.from({ length: n }, (_, j) => `<th>A${j + 1}</th>`).join('') + '</tr>';
    for (let i = 1; i <= n; i++) {
      rows += `<tr><th>A${i}</th>`;
      for (let j = 1; j <= n; j++) {
        if (j < i) rows += '<td>\u2013</td>';
        else rows += `<td class="${j === n && i === 1 ? 'hot' : ''}">${m[i][j]}</td>`;
      }
      rows += '</tr>';
    }
    dpTable.innerHTML = `<table class="dtable">${rows}</table>`;
  }

  function applyInputs() {
    const parsed = dimsField.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n) && n > 0);
    if (parsed.length >= 2) { dims = parsed; run(); }
  }
  function randomize() {
    const count = 4 + Math.floor(Math.random() * 3);
    dims = Array.from({ length: count }, () => 5 + Math.floor(Math.random() * 55));
    dimsField.value = dims.join(', ');
    run();
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Input'),
    el('div', { class: 'field' }, [el('label', {}, 'Dimensions (matrix i is dims[i]\u00d7dims[i+1])'), dimsField]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: applyInputs }, 'Compute'),
      el('button', { class: 'btn ghost', onclick: randomize }, 'Randomize')
    ]),
    el('div', { class: 'field-hint' }, 'The DP table m[i][j] stores the minimum multiplications to multiply matrices i through j. The bottom-right cell holds the final answer.')
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statCost, statParen]), el('div', { style: { marginTop: '12px' } }, parenBox)]);

  const viz = el('div', { class: 'viz-area' }, [
    el('h4', { style: { margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' } }, 'Chain'),
    dimsList,
    el('h4', { style: { margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' } }, 'DP cost table m[i][j]'),
    dpTable
  ]);

  mount.appendChild(pageHeader('exp6', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel]), viz]));

  run();
  return { destroy: () => {} };
}
