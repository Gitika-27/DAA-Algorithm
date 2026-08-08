import { svg } from './dom.js';

export function circleLayout(n, cx, cy, r) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (2 * Math.PI * i) / n;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a) });
  }
  return pts;
}

/**
 * Renders an undirected/directed weighted graph.
 * nodes: [{id,label}], edges: [{u,v,w, state}] state: 'idle'|'active'|'included'|'rejected'
 */
export function renderGraph({ width = 560, height = 340, nodes, edges, directed = false, nodeState = () => 'idle' }) {
  const pos = circleLayout(nodes.length, width / 2, height / 2 + 6, Math.min(width, height) / 2 - 46);
  const byId = {}; nodes.forEach((n, i) => byId[n.id] = pos[i]);

  const stateColor = {
    idle: '#2A3348', active: '#E8A33D', included: '#4FD1C5', rejected: '#E8697F55'
  };
  const nodeColor = {
    idle: '#1C2438', current: '#E8A33D', visited: '#4FD1C5', source: '#E8A33D', target: '#E8697F'
  };

  const edgeEls = edges.map((e) => {
    const p1 = byId[e.u], p2 = byId[e.v];
    const st = e.state || 'idle';
    const mx = (p1.x + p2.x) / 2, my = (p1.y + p2.y) / 2;
    const group = svg('g', {});
    group.appendChild(svg('line', {
      x1: p1.x, y1: p1.y, x2: p2.x, y2: p2.y,
      stroke: stateColor[st] || stateColor.idle,
      'stroke-width': st === 'included' || st === 'active' ? 3 : 1.6,
      opacity: st === 'rejected' ? 0.55 : 1,
      'stroke-dasharray': st === 'rejected' ? '4,3' : null
    }));
    const labelBg = svg('rect', { x: mx - 12, y: my - 9, width: 24, height: 16, rx: 4, fill: '#0B0F19', stroke: '#232B40' });
    const label = svg('text', {
      x: mx, y: my + 3, 'text-anchor': 'middle', 'font-size': 10.5, 'font-family': 'JetBrains Mono, monospace',
      fill: st === 'included' ? '#4FD1C5' : (st === 'active' ? '#E8A33D' : '#8A93AC')
    }, []);
    label.textContent = e.w;
    group.appendChild(labelBg);
    group.appendChild(label);
    return group;
  });

  const nodeEls = nodes.map((n) => {
    const p = pos[nodes.indexOf(n)];
    const st = nodeState(n.id) || 'idle';
    const g = svg('g', {});
    g.appendChild(svg('circle', {
      cx: p.x, cy: p.y, r: 17,
      fill: nodeColor[st] || nodeColor.idle,
      stroke: st === 'idle' ? '#3A4460' : '#0B0F19',
      'stroke-width': 2
    }));
    const t = svg('text', {
      x: p.x, y: p.y + 4, 'text-anchor': 'middle', 'font-size': 12, 'font-weight': 700,
      'font-family': 'JetBrains Mono, monospace',
      fill: st === 'idle' ? '#8A93AC' : '#0E1320'
    });
    t.textContent = n.label ?? n.id;
    g.appendChild(t);
    return g;
  });

  const root = svg('svg', { viewBox: `0 0 ${width} ${height}`, width: '100%', height: height }, [...edgeEls, ...nodeEls]);
  return root;
}
