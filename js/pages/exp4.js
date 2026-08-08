import { el, clear } from '../lib/dom.js';
import { pageHeader } from '../lib/pagechrome.js';
import { StepPlayer } from '../lib/stepplayer.js';
import { renderGraph } from '../lib/graphviz.js';
import { dijkstra, buildDirectedAdjacency, reconstructPath, DEFAULT_GRAPH } from '../algorithms/exp4.js';

export function render(mount, { navigate }) {
  let graph = { n: DEFAULT_GRAPH.n, edges: DEFAULT_GRAPH.edges.map((e) => ({ ...e })) };
  let source = 0, target = graph.n - 1;
  let player = null;

  const graphViz = el('div');
  const distTable = el('div', { class: 'viz-scroll' });
  const playerHost = el('div');
  const edgeTable = el('textarea', { rows: 6 }, graph.edges.map((e) => `${e.u}->${e.v}:${e.w}`).join('\n'));
  const sourceField = el('input', { type: 'number', value: source, min: 0, max: graph.n - 1 });
  const targetField = el('input', { type: 'number', value: target, min: 0, max: graph.n - 1 });
  const statPath = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Shortest distance'), el('div', { class: 'value copper' }, '\u2013')]);
  const statHops = el('div', { class: 'stat-box' }, [el('span', { class: 'label' }, 'Path'), el('div', { class: 'value', style: { fontSize: '13px' } }, '\u2013')]);

  const nodes = () => Array.from({ length: graph.n }, (_, i) => ({ id: i, label: i }));

  function renderDistTable(dist) {
    clear(distTable);
    const rows = dist.map((d, i) => `<tr><td>${i}</td><td>${d === Infinity ? '\u221e' : d}</td></tr>`).join('');
    distTable.innerHTML = `<table class="dtable"><thead><tr><th>Vertex</th><th>Distance from ${source}</th></tr></thead><tbody>${rows}</tbody></table>`;
  }

  function run() {
    const adj = buildDirectedAdjacency(graph.n, graph.edges);
    const result = dijkstra(adj, source);
    const path = reconstructPath(result.prev, source, target);
    statPath.querySelector('.value').textContent = result.dist[target] === Infinity ? 'unreachable' : result.dist[target];
    statHops.querySelector('.value').textContent = path.length ? path.join(' \u2192 ') : 'no path';

    if (player) player.destroy();
    playerHost.innerHTML = '';
    const settled = new Set();
    player = new StepPlayer({
      steps: result.steps,
      onRender: (step) => {
        if (step.type === 'visit') settled.add(step.node);
        const activeEdgeKey = step.type === 'relax' ? `${step.edge.u}-${step.edge.v}` : null;
        const edgesWithState = graph.edges.map((e) => {
          const key = `${e.u}-${e.v}`;
          let state = 'idle';
          if (activeEdgeKey === key) state = 'active';
          else if (settled.has(e.u) && settled.has(e.v)) state = 'included';
          return { ...e, state };
        });
        clear(graphViz);
        graphViz.appendChild(renderGraph({
          nodes: nodes(), edges: edgesWithState, directed: true,
          nodeState: (id) => id === source ? 'source' : (id === target ? 'target' : (settled.has(id) ? 'visited' : 'idle'))
        }));
        renderDistTable(step.dist);
      },
      logFn: (step, i, total) => `<b>Step ${i + 1}/${total}</b> \u2014 ${step.note}`
    });
    playerHost.appendChild(player.node);
  }

  function applyEdges() {
    const lines = edgeTable.value.split('\n').map((l) => l.trim()).filter(Boolean);
    const parsed = [];
    let maxNode = 0;
    for (const line of lines) {
      const m = line.match(/(\d+)\s*->\s*(\d+)\s*:\s*(\d+)/);
      if (m) { const u = +m[1], v = +m[2], w = +m[3]; parsed.push({ u, v, w }); maxNode = Math.max(maxNode, u, v); }
    }
    if (parsed.length) {
      graph = { n: maxNode + 1, edges: parsed };
      source = Math.min(source, graph.n - 1); target = Math.min(target, graph.n - 1);
      sourceField.max = graph.n - 1; targetField.max = graph.n - 1;
      run();
    }
  }

  function applyNodes() {
    source = Math.max(0, Math.min(graph.n - 1, parseInt(sourceField.value, 10) || 0));
    target = Math.max(0, Math.min(graph.n - 1, parseInt(targetField.value, 10) || 0));
    run();
  }

  const controls = el('div', { class: 'panel' }, [
    el('h4', {}, 'Graph'),
    el('div', { class: 'field' }, [el('label', {}, 'Directed edges: u->v:weight'), edgeTable]),
    el('button', { class: 'btn primary', onclick: applyEdges }, 'Apply graph')
  ]);
  const nodesPanel = el('div', { class: 'panel' }, [
    el('h4', {}, 'Query'),
    el('div', { class: 'field-row' }, [
      el('div', { class: 'field' }, [el('label', {}, 'Source'), sourceField]),
      el('div', { class: 'field' }, [el('label', {}, 'Target'), targetField])
    ]),
    el('button', { class: 'btn', onclick: applyNodes }, 'Recompute')
  ]);
  const statsPanel = el('div', { class: 'panel' }, [el('h4', {}, 'Result'), el('div', { class: 'stat-grid' }, [statPath, statHops])]);
  const legend = el('div', { class: 'legend' }, [
    el('span', {}, [el('i', { style: { background: '#E8A33D' } }), 'Source']),
    el('span', {}, [el('i', { style: { background: '#E8697F' } }), 'Target']),
    el('span', {}, [el('i', { style: { background: '#4FD1C5' } }), 'Settled'])
  ]);

  const viz = el('div', { class: 'viz-area' }, [graphViz, legend, playerHost, distTable]);

  mount.appendChild(pageHeader('exp4', navigate));
  mount.appendChild(el('div', { class: 'workbench' }, [el('div', {}, [controls, nodesPanel, statsPanel]), viz]));

  run();
  return { destroy: () => player && player.destroy() };
}
