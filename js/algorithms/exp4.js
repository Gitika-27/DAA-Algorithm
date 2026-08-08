// Dijkstra's Algorithm (ported from exp4.py)

export function dijkstra(adj, source) {
  const n = adj.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(null);
  dist[source] = 0;
  const pq = [[0, source]];
  const visited = new Set();
  const steps = [];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [d, u] = pq.shift();
    if (visited.has(u)) continue;
    visited.add(u);
    steps.push({ type: 'visit', node: u, dist: [...dist], note: `Settle vertex ${u} at distance ${d === Infinity ? '∞' : d}` });
    for (const [v, w] of adj[u]) {
      if (dist[u] + w < dist[v]) {
        dist[v] = dist[u] + w;
        prev[v] = u;
        pq.push([dist[v], v]);
        steps.push({ type: 'relax', edge: { u, v, w }, dist: [...dist], note: `Relax edge ${u}→${v}: dist[${v}] = ${dist[v]}` });
      }
    }
  }
  return { dist, prev, steps };
}

export function reconstructPath(prev, source, target) {
  const path = [];
  let node = target;
  while (node !== null && node !== undefined) { path.push(node); node = prev[node]; }
  path.reverse();
  return path[0] === source ? path : [];
}

export const DEFAULT_GRAPH = {
  n: 6,
  edges: [
    { u: 0, v: 1, w: 4 }, { u: 0, v: 2, w: 1 }, { u: 2, v: 1, w: 2 },
    { u: 1, v: 3, w: 1 }, { u: 2, v: 3, w: 5 }, { u: 3, v: 4, w: 3 }, { u: 4, v: 5, w: 2 }
  ],
  directed: true
};

export function buildDirectedAdjacency(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const { u, v, w } of edges) adj[u].push([v, w]);
  return adj;
}
