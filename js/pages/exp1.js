import { el, randSortedArray, randInt } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { renderArrayBoxes } from '../lib/arrayviz.js';
import { StepPlayer } from '../lib/stepplayer.js';
import { drawGroupedBars } from '../lib/charts.js';
import { interpolationSearch, binarySearch, performanceTable } from '../algorithms/exp1.js';

export function render(mount, { navigate }) {
  let arr = randSortedArray(18, 200);
  let target = arr[randInt(0, arr.length - 1)];
  let players = [];

  const arrField = el('textarea', { rows: 2 }, arr.join(', '));
  const targetField = el('input', { type: 'number', value: target });

  const interpBoxes = el('div', { class: 'viz-scroll' });
  const interpStatBox = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Comparisons'), el('div', { class: 'value copper' }, '0')]);
  const binBoxes = el('div', { class: 'viz-scroll' });
  const binStatBox = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Comparisons'), el('div', { class: 'value' }, '0')]);

  const interpPlayerHost = el('div');
  const binPlayerHost = el('div');
  const benchHost = el('div', { style: { marginTop: '10px' } });

  function runSearches() {
    const isRes = interpolationSearch(arr, target);
    const bsRes = binarySearch(arr, target);

    interpStatBox.querySelector('.value').textContent = isRes.comparisons;
    binStatBox.querySelector('.value').textContent = bsRes.comparisons;

    players.forEach((p) => p.destroy());
    players = [];

    interpPlayerHost.innerHTML = '';
    const p1 = new StepPlayer({
      steps: isRes.steps,
      onRender: (step) => renderArrayBoxes(interpBoxes, arr, { low: step.low, high: step.high, pos: step.pos, found: step.found ? step.pos : -1 }),
      logFn: (step, i, total) => `<b>Step ${i + 1}/${total}</b> — ${step.note}`
    });
    interpPlayerHost.appendChild(p1.node);
    players.push(p1);

    binPlayerHost.innerHTML = '';
    const p2 = new StepPlayer({
      steps: bsRes.steps,
      onRender: (step) => renderArrayBoxes(binBoxes, arr, { low: step.low, high: step.high, pos: step.pos, found: step.found ? step.pos : -1 }),
      logFn: (step, i, total) => `<b>Step ${i + 1}/${total}</b> — ${step.note}`
    });
    binPlayerHost.appendChild(p2.node);
    players.push(p2);
  }

  function applyInputs() {
    const parsed = arrField.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    if (parsed.length >= 3) {
      arr = [...parsed].sort((a, b) => a - b);
    }
    target = parseInt(targetField.value, 10);
    if (Number.isNaN(target)) target = arr[0];
    runSearches();
  }

  function randomize() {
    arr = randSortedArray(18, 200);
    target = arr[randInt(0, arr.length - 1)];
    arrField.value = arr.join(', ');
    targetField.value = target;
    runSearches();
  }

  const benchCanvas = el('canvas', { width: 560, height: 220, style: { width: '100%', height: '220px' } });
  function runBenchmark() {
    const rows = performanceTable([1000, 5000, 10000, 50000, 100000]);
    drawGroupedBars(benchCanvas, rows.map(r => ({ label: r.label, is: r.isComparisons, bs: r.bsComparisons })), ['is', 'bs'], ['#E8A33D', '#4FD1C5']);
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Input'),
    el('div', { class: 'field' }, [el('label', {}, 'Sorted array (comma separated)'), arrField]),
    el('div', { class: 'field' }, [el('label', {}, 'Target value'), targetField]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: applyInputs }, 'Run search'),
      el('button', { class: 'btn ghost', onclick: randomize }, 'Randomize')
    ]),
    el('div', { class: 'field-hint' }, 'Interpolation search estimates the probe position from the value spread; binary search always splits in half. On large, evenly distributed arrays interpolation search wins.')
  ]);

  const benchPanel = el('div', { class: 'panel' }, [
    el('h4', {}, 'Benchmark (n = 1K \u2192 100K)'),
    el('p', { class: 'field-hint', style: { marginTop: 0 } }, 'Generates a fresh random sorted array at each size and counts comparisons for a random target.'),
    el('button', { class: 'btn', onclick: runBenchmark }, 'Run benchmark'),
    benchCanvas,
    el('div', { class: 'legend' }, [
      el('span', {}, [el('i', { style: { background: '#E8A33D' } }), 'Interpolation search']),
      el('span', {}, [el('i', { style: { background: '#4FD1C5' } }), 'Binary search'])
    ])
  ]);

  const viz = el('div', { class: 'viz-area' }, [
    el('h4', { style: { margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--copper)', textTransform: 'uppercase', letterSpacing: '1px' } }, 'Interpolation Search'),
    interpBoxes, interpStatBox, interpPlayerHost,
    el('hr', { style: { border: 'none', borderTop: '1px solid var(--border-soft)', margin: '4px 0' } }),
    el('h4', { style: { margin: 0, fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '1px' } }, 'Binary Search'),
    binBoxes, binStatBox, binPlayerHost
  ]);

  mount.appendChild(pageHeader('exp1', navigate));
  const workbench = el('div', { class: 'workbench' }, [
    el('div', {}, [controls, benchPanel]),
    viz
  ]);
  mount.appendChild(workbench);

  runSearches();

  return { destroy: () => players.forEach((p) => p.destroy()) };
}
