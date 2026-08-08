// Minimum Spanning Tree: Kruskal & Prim (ported from exp3.py)

class UnionFind {
  constructor(n) { this.parent = Array.from({ length: n }, (_, i) => i); this.rank = new Array(n).fill(0); }
  find(x) { if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]); return this.parent[x]; }
  union(x, y) {
    const rx = this.find(x), ry = this.find(y);
    if (rx === ry) return false;
    if (this.rank[rx] < this.rank[ry]) { this.parent[rx] = ry; }
    else if (this.rank[rx] > this.rank[ry]) { this.parent[ry] = rx; }
    else { this.parent[ry] = rx; this.rank[rx]++; }
    return true;
  }
}

export function kruskal(n, edges) {
  const sorted = [...edges].sort((a, b) => a.w - b.w);
  const uf = new UnionFind(n);
  const mst = []; let cost = 0;
  const steps = [];
  for (const e of sorted) {
    if (uf.find(e.u) !== uf.find(e.v)) {
      uf.union(e.u, e.v);
      mst.push(e); cost += e.w;
      steps.push({ edge: e, included: true, mst: [...mst], cost, note: `Accept (${e.u}-${e.v}) w=${e.w} — connects two components` });
      if (mst.length === n - 1) break;
    } else {
      steps.push({ edge: e, included: false, mst: [...mst], cost, note: `Reject (${e.u}-${e.v}) w=${e.w} — would form a cycle` });
    }
  }
  return { mst, cost, steps };
}

export function prim(n, adj, start = 0) {
  const INF = Infinity;
  const key = new Array(n).fill(INF);
  const parent = new Array(n).fill(-1);
  const inMST = new Array(n).fill(false);
  key[start] = 0;
  const pq = [[0, start]];
  const mst = []; let cost = 0;
  const steps = [];
  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0]);
    const [w, u] = pq.shift();
    if (inMST[u]) continue;
    inMST[u] = true;
    if (parent[u] !== -1) {
      const e = { u: parent[u], v: u, w };
      mst.push(e); cost += w;
      steps.push({ edge: e, included: true, mst: [...mst], cost, note: `Add cheapest crossing edge (${e.u}-${e.v}) w=${w}` });
    } else {
      steps.push({ edge: null, included: true, mst: [...mst], cost, note: `Start from vertex ${u}` });
    }
    for (const [v, wt] of (adj[u] || [])) {
      if (!inMST[v] && wt < key[v]) {
        key[v] = wt; parent[v] = u;
        pq.push([wt, v]);
        steps.push({ edge: { u, v, w: wt }, included: false, mst: [...mst], cost, note: `Relax: key[${v}] updated to ${wt} via ${u}`, preview: true });
      }
    }
  }
  return { mst, cost, steps };
}

export const DEFAULT_GRAPH = {
  n: 7,
  edges: [
    { u: 0, v: 1, w: 7 }, { u: 0, v: 3, w: 5 }, { u: 1, v: 2, w: 8 }, { u: 1, v: 3, w: 9 },
    { u: 1, v: 4, w: 7 }, { u: 2, v: 4, w: 5 }, { u: 3, v: 4, w: 15 }, { u: 3, v: 5, w: 6 },
    { u: 4, v: 5, w: 8 }, { u: 4, v: 6, w: 9 }, { u: 5, v: 6, w: 11 }
  ]
};

export function buildAdjacency(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const { u, v, w } of edges) { adj[u].push([v, w]); adj[v].push([u, w]); }
  return adj;
}
