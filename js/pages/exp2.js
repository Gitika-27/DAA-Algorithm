import { el, clear } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { StepPlayer } from '../lib/stepplayer.js';
import { drawGroupedBars } from '../lib/charts.js';
import { naiveSearch, kmpSearch, rabinKarpSearch } from '../algorithms/exp2.js';

const ALGOS = {
  naive: { label: 'Naive', run: naiveSearch, color: '#E8697F' },
  kmp: { label: 'KMP', run: kmpSearch, color: '#E8A33D' },
  rk: { label: 'Rabin\u2013Karp', run: rabinKarpSearch, color: '#4FD1C5' }
};

export function render(mount, { navigate }) {
  let text = 'AABAACAADAABAABA';
  let pattern = 'AABA';
  let algoKey = 'kmp';
  let player = null;

  const textField = el('input', { type: 'text', value: text });
  const patternField = el('input', { type: 'text', value: pattern });
  const textRow = el('div', { class: 'viz-scroll' });
  const statMatches = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Matches'), el('div', { class: 'value' }, '0')]);
  const statComparisons = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Comparisons'), el('div', { class: 'value copper' }, '0')]);
  const playerHost = el('div');
  const pillHost = el('div', { class: 'pill-row' });
  const benchCanvas = el('canvas', { width: 560, height: 220, style: { width: '100%', height: '220px' } });

  function charBox(ch, state) {
    const stateColors = { idle: null, window: '#8A93AC', ok: '#7FCE9A', bad: '#E8697F', match: '#4FD1C5' };
    const c = stateColors[state];
    return el('div', {
      style: {
        width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center',
        borderRadius: '5px', fontFamily: 'var(--font-mono)', fontSize: '12px', fontWeight: '700',
        background: c ? c + '22' : 'var(--bg-panel-2)', border: `1.5px solid ${c || 'var(--border)'}`,
        color: c || 'var(--text-muted)'
      }
    }, ch);
  }

  function renderStep(step, matchedSoFar) {
    clear(textRow);
    const line = el('div', { style: { display: 'flex', flexDirection: 'column', gap: '10px' } });
    const textLine = el('div', { style: { display: 'flex', gap: '3px', flexWrap: 'wrap' } });
    const patLine = el('div', { style: { display: 'flex', gap: '3px', paddingLeft: (step.i * 29) + 'px' } });

    for (let idx = 0; idx < text.length; idx++) {
      let state = 'idle';
      const withinWindow = idx >= step.i && idx < step.i + pattern.length;
      if (withinWindow) state = 'window';
      if (matchedSoFar.some((m) => idx >= m && idx < m + pattern.length)) state = 'match';
      if (step.j >= 0 && idx === step.i + step.j) state = step.ok ? 'ok' : 'bad';
      textLine.appendChild(charBox(text[idx], state));
    }
    for (let j = 0; j < pattern.length; j++) {
      let state = 'window';
      if (step.j >= 0 && j === step.j) state = step.ok ? 'ok' : 'bad';
      else if (step.j >= 0 && j < step.j) state = 'ok';
      patLine.appendChild(charBox(pattern[j], state));
    }
    line.appendChild(el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)' } }, 'TEXT'));
    line.appendChild(textLine);
    line.appendChild(el('div', { style: { fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-dim)', marginTop: '4px' } }, 'PATTERN (aligned at window)'));
    line.appendChild(patLine);
    textRow.appendChild(line);
  }

  function run() {
    const algo = ALGOS[algoKey];
    const res = algo.run(text, pattern);
    statMatches.querySelector('.value').textContent = res.matches.length;
    statComparisons.querySelector('.value').textContent = res.comparisons;

    if (player) player.destroy();
    playerHost.innerHTML = '';
    const matchedSoFar = [];
    player = new StepPlayer({
      steps: res.steps,
      onRender: (step) => {
        if (step.matched && !matchedSoFar.includes(step.i)) matchedSoFar.push(step.i);
        renderStep(step, step.matched ? matchedSoFar : matchedSoFar.filter((m) => m < step.i || m !== step.i));
      },
      logFn: (step, i, total) => {
        if (step.matched) return `<b>Step ${i + 1}/${total}</b> \u2014 full match at index ${step.i}!`;
        if (step.hashHit === false) return `<b>Step ${i + 1}/${total}</b> \u2014 hash mismatch at shift ${step.i}, skip without char comparisons`;
        return `<b>Step ${i + 1}/${total}</b> \u2014 comparing text[${step.i + step.j}] vs pattern[${step.j}]: ${step.ok ? 'match' : 'mismatch'}`;
      }
    });
    playerHost.appendChild(player.node);
  }

  Object.entries(ALGOS).forEach(([key, a]) => {
    const pill = el('button', { class: 'pill' + (key === algoKey ? ' active' : ''), onclick: () => { algoKey = key; refreshPills(); run(); } }, a.label);
    pill.dataset.key = key;
    pillHost.appendChild(pill);
  });
  function refreshPills() {
    [...pillHost.children].forEach((p) => p.classList.toggle('active', p.dataset.key === algoKey));
  }

  function applyInputs() {
    text = textField.value || text;
    pattern = patternField.value || pattern;
    run();
  }

  function runBenchmark() {
    const large = Array.from({ length: 4000 }, () => 'ABCD'[Math.floor(Math.random() * 4)]).join('');
    const testPatterns = ['AB', 'ABCD', 'ABCDAB', 'ABCDABCD'];
    const rows = testPatterns.map((p) => ({
      label: p,
      naive: naiveSearch(large, p).comparisons,
      kmp: kmpSearch(large, p).comparisons,
      rk: rabinKarpSearch(large, p).comparisons
    }));
    drawGroupedBars(benchCanvas, rows, ['naive', 'kmp', 'rk'], ['#E8697F', '#E8A33D', '#4FD1C5']);
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Input'),
    el('div', { class: 'field' }, [el('label', {}, 'Text'), textField]),
    el('div', { class: 'field' }, [el('label', {}, 'Pattern'), patternField]),
    el('div', { class: 'field' }, [el('label', {}, 'Algorithm'), pillHost]),
    el('div', { class: 'btn-row' }, [el('button', { class: 'btn primary', onclick: applyInputs }, 'Run match')])
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statMatches, statComparisons])]);
  const benchPanel = el('div', { class: 'panel' }, [
    el('h4', {}, 'Benchmark on 4,000-char text'),
    el('p', { class: 'field-hint', style: { marginTop: 0 } }, 'Same random text, four pattern lengths, one comparison count per algorithm.'),
    el('button', { class: 'btn', onclick: runBenchmark }, 'Run benchmark'),
    benchCanvas,
    el('div', { class: 'legend' }, [
      el('span', {}, [el('i', { style: { background: '#E8697F' } }), 'Naive']),
      el('span', {}, [el('i', { style: { background: '#E8A33D' } }), 'KMP']),
      el('span', {}, [el('i', { style: { background: '#4FD1C5' } }), 'Rabin\u2013Karp'])
    ])
  ]);

  const viz = el('div', { class: 'viz-area' }, [textRow, playerHost]);

  mount.appendChild(pageHeader('exp2', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel, benchPanel]), viz]));

  run();
  return { destroy: () => player && player.destroy() };
}
