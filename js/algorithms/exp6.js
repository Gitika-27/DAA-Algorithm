// Matrix Chain Multiplication (ported from exp6.py)

export function matrixChainOrder(dims) {
  const n = dims.length - 1;
  const m = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  const s = Array.from({ length: n + 1 }, () => new Array(n + 1).fill(0));
  for (let l = 2; l <= n; l++) {
    for (let i = 1; i <= n - l + 1; i++) {
      const j = i + l - 1;
      m[i][j] = Infinity;
      for (let k = i; k < j; k++) {
        const cost = m[i][k] + m[k + 1][j] + dims[i - 1] * dims[k] * dims[j];
        if (cost < m[i][j]) { m[i][j] = cost; s[i][j] = k; }
      }
    }
  }
  return { m, s, n };
}

export function printOptimalParens(s, i, j) {
  if (i === j) return `A${i}`;
  const k = s[i][j];
  return `(${printOptimalParens(s, i, k)} x ${printOptimalParens(s, k + 1, j)})`;
}
