import { el } from '../lib/dom.js';
import { drawSparkline } from '../lib/charts.js';
import { EXPERIMENTS } from '../meta.js';

export function renderHome(mount, { navigate }) {
  const hero = el('div', { class: 'hero' }, [
    el('div', { class: 'hero-eyebrow' }, 'Design & Analysis of Algorithms · Sem 3'),
    el('h1', {}, ['The ', el('span', { class: 'accent' }, 'bench'), ' for all ten experiments.']),
    el('p', {}, 'Every algorithm from the DAA lab file, rebuilt as a live, editable experiment. Change the input, run it, and watch the comparisons, costs and backtracks happen in real time \u2014 nothing here is a static screenshot.'),
    el('div', { class: 'hero-stats' }, [
      el('div', {}, [el('b', {}, '10'), el('span', {}, 'Experiments')]),
      el('div', {}, [el('b', {}, '6'), el('span', {}, 'Topics covered')]),
      el('div', {}, [el('b', {}, '0'), el('span', {}, 'Server round-trips')]),
    ])
  ]);

  const grid = el('div', { class: 'bench-grid' });

  EXPERIMENTS.forEach((exp) => {
    const canvas = el('canvas');
    const card = el('button', {
      class: 'algo-card',
      onclick: () => navigate(exp.id)
    }, [
      el('div', { class: 'algo-card-top' }, [
        el('span', { class: 'algo-num' }, `EXP ${exp.num}`),
        el('span', { class: 'algo-tag' }, exp.tag)
      ]),
      el('h3', {}, exp.title),
      el('p', {}, exp.desc),
      canvas,
      el('div', { class: 'algo-foot' }, [
        el('span', { class: 'algo-complexity' }, exp.complexity),
        el('span', { class: 'algo-go' }, 'Open experiment \u2192')
      ])
    ]);
    grid.appendChild(card);
    requestAnimationFrame(() => drawSparkline(canvas, exp.fn, { color: '#E8A33D' }));
  });

  mount.appendChild(hero);
  mount.appendChild(grid);
}
