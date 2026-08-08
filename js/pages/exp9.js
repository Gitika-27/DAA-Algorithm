import { el, clear } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { firstFit, firstFitDecreasing, bestFitDecreasing, DEFAULT_ITEMS } from '../algorithms/exp9.js';

const PALETTE = ['#E8A33D', '#4FD1C5', '#E8697F', '#7FCE9A', '#8A93AC', '#B87F2C', '#2E958B', '#C6799A'];

export function render(mount, { navigate }) {
  let items = [...DEFAULT_ITEMS];
  const itemsField = el('textarea', { rows: 2 }, items.join(', '));
  const binsHost = el('div');
  const statLower = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Lower bound'), el('div', { class: 'value' }, '0')]);
  const statFF = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'First Fit'), el('div', { class: 'value copper' }, '0')]);
  const statFFD = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'First Fit Decreasing'), el('div', { class: 'value copper' }, '0')]);
  const statBFD = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Best Fit Decreasing'), el('div', { class: 'value copper' }, '0')]);

  function binColumn(label, bins) {
    const col = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px', flex: '1', minWidth: '160px' } });
    col.appendChild(el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' } }, `${label} \u2014 ${bins.length} bins`));
    const row = el('div', { style: { display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'flex-end' } });
    bins.forEach((b) => {
      const used = b.reduce((s, x) => s + x, 0);
      const tower = el('div', { style: { width: '38px', height: '150px', border: '1.5px solid var(--border)', borderRadius: '4px', display: 'flex', flexDirection: 'column-reverse', overflow: 'hidden', background: 'var(--bg-well)' } });
      b.forEach((item, idx) => {
        tower.appendChild(el('div', {
          title: `${item}`,
          style: { height: (item * 150) + 'px', background: PALETTE[idx % PALETTE.length], borderTop: '1px solid var(--bg-well)' }
        }));
      });
      const wrap = el('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' } }, [
        tower, el('span', { style: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' } }, `${(used * 100).toFixed(0)}%`)
      ]);
      row.appendChild(wrap);
    });
    col.appendChild(row);
    return col;
  }

  function run() {
    const ff = firstFit(items);
    const ffd = firstFitDecreasing(items);
    const bfd = bestFitDecreasing(items);
    const lowerBound = Math.ceil(items.reduce((s, x) => s + x, 0));
    statLower.querySelector('.value').textContent = lowerBound;
    statFF.querySelector('.value').textContent = ff.length;
    statFFD.querySelector('.value').textContent = ffd.length;
    statBFD.querySelector('.value').textContent = bfd.length;

    clear(binsHost);
    const wrap = el('div', { style: { display: 'flex', gap: '20px', flexWrap: 'wrap' } }, [
      binColumn('First Fit', ff), binColumn('First Fit Decreasing', ffd), binColumn('Best Fit Decreasing', bfd)
    ]);
    binsHost.appendChild(wrap);
  }

  function applyInputs() {
    const parsed = itemsField.value.split(',').map((s) => parseFloat(s.trim())).filter((n) => !Number.isNaN(n) && n > 0 && n <= 1);
    if (parsed.length) { items = parsed; run(); }
  }
  function randomize() {
    items = Array.from({ length: 8 + Math.floor(Math.random() * 8) }, () => Math.round((0.1 + Math.random() * 0.85) * 10) / 10);
    itemsField.value = items.join(', ');
    run();
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Items (capacity = 1.0)'),
    el('div', { class: 'field' }, [el('label', {}, 'Item sizes, 0\u20131 each'), itemsField]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: applyInputs }, 'Pack bins'),
      el('button', { class: 'btn ghost', onclick: randomize }, 'Randomize')
    ]),
    el('div', { class: 'field-hint' }, 'The lower bound is the ceiling of total item size \u2014 no packing can use fewer bins than that.')
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Bins used'), el('div', { class: 'stat-grid' }, [statLower, statFF, statFFD, statBFD])]);

  const viz = el('div', { class: 'viz-area' }, [binsHost]);

  mount.appendChild(pageHeader('exp9', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel]), viz]));

  run();
  return { destroy: () => {} };
}
