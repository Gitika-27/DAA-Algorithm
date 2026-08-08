import { el } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { renderBars } from '../lib/arrayviz.js';
import { StepPlayer } from '../lib/stepplayer.js';
import { drawGroupedBars } from '../lib/charts.js';
import { quicksortTraced, quicksortFast, generateTestCases } from '../algorithms/exp10.js';

export function render(mount, { navigate }) {
  let arr = [5, 2, 9, 1, 7, 3, 8, 4, 6, 0, 10, 12, 11, 9];
  let randomized = false;
  let player = null;

  const arrField = el('textarea', { rows: 2 }, arr.join(', '));
  const barsHost = el('div');
  const playerHost = el('div');
  const pillHost = el('div', { class: 'pill-row' });
  const statComparisons = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Comparisons'), el('div', { class: 'value copper' }, '0')]);
  const statSorted = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Result'), el('div', { class: 'value', style: { fontSize: '12.5px' } }, '\u2013')]);
  const benchCanvas = el('canvas', { width: 560, height: 220, style: { width: '100%', height: '220px' } });

  function run() {
    const res = quicksortTraced(arr, randomized);
    statComparisons.querySelector('.value').textContent = res.comparisons;
    statSorted.querySelector('.value').textContent = res.sorted.join(', ');

    if (player) player.destroy();
    playerHost.innerHTML = '';
    player = new StepPlayer({
      steps: res.steps,
      speedMs: 260,
      onRender: (step) => {
        const markers = { sorted: [] };
        if (step.type === 'compare' || step.type === 'swap') { markers.i = step.i; markers.j = step.j; }
        if (step.pivotIdx !== undefined) markers.pivot = step.pivotIdx;
        renderBars(barsHost, step.array, markers, { height: 190 });
      },
      logFn: (step, i, total) => {
        const labels = {
          'choose-pivot': `pivot chosen at index ${step.pivotIdx}`,
          compare: `comparing arr[${step.j}] with pivot`,
          swap: `swap arr[${step.i}] and arr[${step.j}]`,
          'place-pivot': `place pivot at its sorted position ${step.i}`
        };
        return `<b>Step ${i + 1}/${total}</b> \u2014 ${labels[step.type] || step.type}`;
      }
    });
    playerHost.appendChild(player.node);
  }

  ['deterministic', 'randomized'].forEach((key) => {
    const pill = el('button', {
      class: 'pill' + ((key === 'randomized') === randomized ? ' active' : ''),
      onclick: () => { randomized = key === 'randomized'; [...pillHost.children].forEach((p) => p.classList.toggle('active', p.dataset.key === key)); run(); }
    }, key === 'deterministic' ? 'Deterministic (last element)' : 'Randomized pivot');
    pill.dataset.key = key;
    pillHost.appendChild(pill);
  });

  function applyInputs() {
    const parsed = arrField.value.split(',').map((s) => parseInt(s.trim(), 10)).filter((n) => !Number.isNaN(n));
    if (parsed.length >= 2) arr = parsed.slice(0, 24);
    run();
  }
  function randomize() {
    arr = Array.from({ length: 12 + Math.floor(Math.random() * 8) }, () => Math.floor(Math.random() * 60));
    arrField.value = arr.join(', ');
    run();
  }

  function runBenchmark() {
    const N = 3000;
    const cases = generateTestCases(N);
    const rows = Object.entries(cases).map(([label, testArr]) => {
      const d = quicksortFast(testArr, false);
      const r = quicksortFast(testArr, true);
      return { label, det: d.comparisons, rand: r.comparisons };
    });
    drawGroupedBars(benchCanvas, rows, ['det', 'rand'], ['#E8697F', '#4FD1C5']);
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Input'),
    el('div', { class: 'field' }, [el('label', {}, 'Array (comma separated, \u226424 values)'), arrField]),
    el('div', { class: 'field' }, [el('label', {}, 'Pivot strategy'), pillHost]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: applyInputs }, 'Sort'),
      el('button', { class: 'btn ghost', onclick: randomize }, 'Randomize')
    ])
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statComparisons]), el('div', { style: { marginTop: '10px' } }, statSorted)]);
  const benchPanel = el('div', { class: 'panel' }, [
    el('h4', {}, 'Comparisons on n=3000 by input shape'),
    el('button', { class: 'btn', onclick: runBenchmark }, 'Run benchmark'),
    benchCanvas,
    el('div', { class: 'legend' }, [
      el('span', {}, [el('i', { style: { background: '#E8697F' } }), 'Deterministic']),
      el('span', {}, [el('i', { style: { background: '#4FD1C5' } }), 'Randomized'])
    ]),
    el('div', { class: 'field-hint' }, 'Deterministic quicksort degrades to O(n\u00b2) on already-sorted or reversed input \u2014 watch its comparison count spike there.')
  ]);

  const viz = el('div', { class: 'viz-area' }, [barsHost, playerHost]);

  mount.appendChild(pageHeader('exp10', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel, benchPanel]), viz]));

  run();
  return { destroy: () => player && player.destroy() };
}
