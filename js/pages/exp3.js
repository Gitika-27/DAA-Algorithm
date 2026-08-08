import { el, clear } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { StepPlayer } from '../lib/stepplayer.js';
import { renderGraph } from '../lib/graphviz.js';
import { kruskal, prim, buildAdjacency, DEFAULT_GRAPH } from '../algorithms/exp3.js';

export function render(mount, { navigate }) {
  let graph = { n: DEFAULT_GRAPH.n, edges: DEFAULT_GRAPH.edges.map((e) => ({ ...e })) };
  let algoKey = 'kruskal';
  let player = null;

  const graphViz = el('div');
  const statCost = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'MST cost'), el('div', { class: 'value copper' }, '0')]);
  const statEdges = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Edges used'), el('div', { class: 'value' }, '0')]);
  const playerHost = el('div');
  const pillHost = el('div', { class: 'pill-row' });
  const edgeTable = el('textarea', { rows: 6 }, graph.edges.map((e) => `${e.u}-${e.v}:${e.w}`).join('\n'));

  const nodes = () => Array.from({ length: graph.n }, (_, i) => ({ id: i, label: i }));

  function draw(edgesWithState, nodeStateFn) {
    clear(graphViz);
    graphViz.appendChild(renderGraph({ nodes: nodes(), edges: edgesWithState, nodeState: nodeStateFn }));
  }

  function run() {
    let result, allEdges;
    const included = [];
    if (algoKey === 'kruskal') {
      result = kruskal(graph.n, graph.edges);
    } else {
      const adj = buildAdjacency(graph.n, graph.edges);
      result = prim(graph.n, adj, 0);
    }
    statCost.querySelector('.value').textContent = result.cost;
    statEdges.querySelector('.value').textContent = `${result.mst.length} / ${graph.n - 1}`;

    if (player) player.destroy();
    playerHost.innerHTML = '';
    const touched = new Set();
    player = new StepPlayer({
      steps: result.steps,
      onRender: (step) => {
        if (step.edge) touched.add(`${step.edge.u}-${step.edge.v}`);
        const inMstKeys = new Set(step.mst.map((e) => `${e.u}-${e.v}`));
        const edgesWithState = graph.edges.map((e) => {
          const key = `${e.u}-${e.v}`;
          let state = 'idle';
          if (inMstKeys.has(key)) state = 'included';
          else if (step.edge && key === `${step.edge.u}-${step.edge.v}`) state = step.included === false ? 'rejected' : 'active';
          return { ...e, state };
        });
        const inMstNodes = new Set(step.mst.flatMap((e) => [e.u, e.v]));
        draw(edgesWithState, (id) => inMstNodes.has(id) ? 'visited' : 'idle');
      },
      logFn: (step, i, total) => `<b>Step ${i + 1}/${total}</b> \u2014 ${step.note}`
    });
    playerHost.appendChild(player.node);
  }

  ['kruskal', 'prim'].forEach((key) => {
    const pill = el('button', {
      class: 'pill' + (key === algoKey ? ' active' : ''),
      onclick: () => { algoKey = key; [...pillHost.children].forEach((p) => p.classList.toggle('active', p.dataset.key === key)); run(); }
    }, key === 'kruskal' ? "Kruskal's" : "Prim's");
    pill.dataset.key = key;
    pillHost.appendChild(pill);
  });

  function applyEdges() {
    const lines = edgeTable.value.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = [];
    let maxNode = 0;
    for (const line of lines) {
      const m = line.match(/(\d+)\s*-\s*(\d+)\s*:\s*(\d+)/);
      if (m) { const u = +m[1], v = +m[2], w = +m[3]; parsed.push({ u, v, w }); maxNode = Math.max(maxNode, u, v); }
    }
    if (parsed.length) { graph = { n: maxNode + 1, edges: parsed }; run(); }
  }

  function randomize() {
    const n = 6 + Math.floor(Math.random() * 2);
    const edges = [];
    for (let i = 1; i < n; i++) edges.push({ u: Math.floor(Math.random() * i), v: i, w: 3 + Math.floor(Math.random() * 15) });
    const extra = Math.floor(n * 0.6);
    for (let k = 0; k < extra; k++) {
      const u = Math.floor(Math.random() * n), v = Math.floor(Math.random() * n);
      if (u !== v && !edges.some((e) => (e.u === u && e.v === v) || (e.u === v && e.v === u))) edges.push({ u, v, w: 3 + Math.floor(Math.random() * 15) });
    }
    graph = { n, edges };
    edgeTable.value = edges.map((e) => `${e.u}-${e.v}:${e.w}`).join('\n');
    run();
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Algorithm'),
    pillHost,
    el('div', { class: 'field', style: { marginTop: '14px' } }, [
      el('label', {}, 'Edges: u-v:weight, one per line'), edgeTable
    ]),
    el('div', { class: 'btn-row' }, [
      el('button', { class: 'btn primary', onclick: applyEdges }, 'Apply graph'),
      el('button', { class: 'btn ghost', onclick: randomize }, 'Random graph')
    ])
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statCost, statEdges])]);
  const legend = el('div', { class: 'legend' }, [
    el('span', {}, [el('i', { style: { background: '#4FD1C5' } }), 'In MST']),
    el('span', {}, [el('i', { style: { background: '#E8A33D' } }), 'Under consideration']),
    el('span', {}, [el('i', { style: { background: '#E8697F' } }), 'Rejected (would cycle)'])
  ]);

  const viz = el('div', { class: 'viz-area' }, [graphViz, legend, playerHost]);

  mount.appendChild(pageHeader('exp3', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, statsPanel]), viz]));

  run();
  return { destroy: () => player && player.destroy() };
}
