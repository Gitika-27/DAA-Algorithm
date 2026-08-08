// Travelling Salesman — brute force / branch-bound style verification (ported from exp8.py)

function* permutations(arr) {
  if (arr.length <= 1) { yield arr; return; }
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const p of permutations(rest)) yield [arr[i], ...p];
  }
}

export function tspBruteForce(cost, n) {
  const cities = Array.from({ length: n - 1 }, (_, i) => i + 1);
  let bestCost = Infinity, bestPath = null;
  let permutationsTried = 0;
  for (const perm of permutations(cities)) {
    const path = [0, ...perm, 0];
    let c = 0;
    for (let i = 0; i < path.length - 1; i++) c += cost[path[i]][path[i + 1]];
    permutationsTried++;
    if (c < bestCost) { bestCost = c; bestPath = path; }
  }
  return { bestPath, bestCost, permutationsTried };
}

export const DEFAULT_CITIES = ['A', 'B', 'C', 'D', 'E'];
export const DEFAULT_COST = [
  [Infinity, 10, 8, 9, 7],
  [10, Infinity, 10, 5, 6],
  [8, 10, Infinity, 8, 9],
  [9, 5, 8, Infinity, 6],
  [7, 6, 9, 6, Infinity]
];

export function randomSymmetricCost(n, max = 20) {
  const mat = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      const w = Math.floor(Math.random() * (max - 3)) + 3;
      mat[i][j] = w; mat[j][i] = w;
    }
  }
  return mat;
}
