import { el } from './dom.js';
import { getExperiment } from '../meta.js';

export function pageHeader(id, navigate) {
  const exp = getExperiment(id);
  return el('div', {}, [
    el('button', { class: 'back-btn', onclick: () => navigate('home') }, '\u2190 Back to bench'),
    el('div', { class: 'page-head' }, [
      el('div', {}, [
        el('div', { class: 'page-title-row' }, [
          el('h1', {}, exp.title),
          el('span', { class: 'badge copper' }, `EXP ${exp.num}`),
          el('span', { class: 'badge' }, exp.tag),
          el('span', { class: 'badge teal' }, exp.complexity)
        ]),
        el('p', { class: 'page-desc' }, exp.desc)
      ])
    ])
  ]);
}
