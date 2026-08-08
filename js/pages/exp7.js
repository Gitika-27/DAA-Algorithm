import { el, clear } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { StepPlayer } from '../lib/stepplayer.js';
import { solveNQueens } from '../algorithms/exp7.js';

export function render(mount, { navigate }) {
  let n = 6;
  let player = null;

  const nField = el('input', { type: 'range', min: 4, max: 10, value: n });
  const nLabel = el('span', { style: { fontFamily: 'var(--font-mono)', color: 'var(--copper)', fontWeight: 700 } }, String(n));
  const boardHost = el('div');
  const playerHost = el('div');
  const statSolutions = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Solutions found'), el('div', { class: 'value copper' }, '0')]);
  const statBacktracks = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Backtracks'), el('div', { class: 'value rose' }, '0')]);
  const solutionGallery = el('div', { class: 'viz-scroll' });

  function drawBoard(board, extra = {}) {
    clear(boardHost);
    const size = Math.min(360, 34 * n);
    const cell = Math.floor(size / n);
    const grid = el('div', {
      style: {
        display: 'grid', gridTemplateColumns: `repeat(${n}, ${cell}px)`, gridTemplateRows: `repeat(${n}, ${cell}px)`,
        border: '2px solid var(--border)', borderRadius: '6px', overflow: 'hidden', width: 'fit-content'
      }
    });
    for (let r = 0; r < n; r++) {
      for (let c = 0; c < n; c++) {
        const dark = (r + c) % 2 === 1;
        const hasQueen = board[r] === c;
        const isActiveRow = extra.activeRow === r;
        grid.appendChild(el('div', {
          style: {
            width: cell + 'px', height: cell + 'px', background: dark ? '#1C2438' : '#232B40',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: Math.floor(cell * 0.55) + 'px',
            outline: isActiveRow && c === extra.activeCol ? `2px solid ${extra.ok === false ? '#E8697F' : '#E8A33D'}` : 'none',
            outlineOffset: '-2px'
          }
        }, hasQueen ? el('span', { style: { color: 'var(--copper)' } }, '\u265B') : ''));
      }
    }
    boardHost.appendChild(grid);
  }

  function drawSolutionGallery(solutions) {
    clear(solutionGallery);
    if (!solutions.length) return;
    const wrap = el('div', { style: { display: 'flex', flexWrap: 'wrap', gap: '10px' } });
    solutions.slice(0, 12).forEach((sol) => {
      const cell = Math.max(10, Math.floor(120 / n));
      const mini = el('div', { style: { display: 'grid', gridTemplateColumns: `repeat(${n}, ${cell}px)`, border: '1px solid var(--border-soft)', borderRadius: '4px', overflow: 'hidden' } });
      for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) {
        mini.appendChild(el('div', { style: { width: cell + 'px', height: cell + 'px', background: (r + c) % 2 ? '#1C2438' : '#232B40', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
          sol[r] === c ? el('span', { style: { color: 'var(--copper)', fontSize: Math.floor(cell * 0.7) + 'px' } }, '\u25CF') : ''));
      }
      wrap.appendChild(mini);
    });
    solutionGallery.appendChild(el('div', { class: 'field-hint', style: { marginBottom: '8px' } }, `Showing up to 12 of ${solutions.length} solution${solutions.length === 1 ? '' : 's'}:`));
    solutionGallery.appendChild(wrap);
  }

  function run() {
    const maxSteps = n <= 8 ? 6000 : 30000;
    const { solutions, backtracks, steps } = solveNQueens(n, { maxSteps });
    statSolutions.querySelector('.value').textContent = solutions.length;
    statBacktracks.querySelector('.value').textContent = backtracks;
    drawSolutionGallery(solutions);

    if (player) player.destroy();
    playerHost.innerHTML = '';
    player = new StepPlayer({
      steps,
      speedMs: 160,
      onRender: (step) => {
        const extra = step.type === 'solution' ? {} : { activeRow: step.row, activeCol: step.col, ok: step.type === 'place' };
        drawBoard(step.board, extra);
      },
      logFn: (step, i, total) => {
        if (step.type === 'solution') return `<b>Step ${i + 1}/${total}</b> \u2014 complete! valid arrangement found.`;
        if (step.type === 'place') return `<b>Step ${i + 1}/${total}</b> \u2014 place queen at row ${step.row}, col ${step.col}`;
        return `<b>Step ${i + 1}/${total}</b> \u2014 backtrack: remove queen from row ${step.row}, col ${step.col}`;
      }
    });
    playerHost.appendChild(player.node);
  }

  nField.addEventListener('input', () => { n = Number(nField.value); nLabel.textContent = String(n); });
  nField.addEventListener('change', run);

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Board size'),
    el('div', { class: 'field' }, [
      el('label', {}, ['N \u00d7 N board \u2014 ', nLabel]),
      nField
    ]),
    el('button', { class: 'btn primary', onclick: run }, 'Solve'),
    el('div', { class: 'field-hint' }, 'Larger boards animate every backtrack, which grows fast \u2014 the step trace is capped so the page stays responsive.')
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statSolutions, statBacktracks])]);
  const galleryPanel = el('div', { class: 'panel' }, [el('h4', {}, 'All solutions'), solutionGallery]);

  const viz = el('div', { class: 'viz-area' }, [boardHost, playerHost]);

  mount.appendChild(pageHeader('exp7', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel, galleryPanel]), viz]));

  run();
  return { destroy: () => player && player.destroy() };
}
