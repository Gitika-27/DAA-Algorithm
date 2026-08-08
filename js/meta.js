export const EXPERIMENTS = [
  {
    id: 'exp1', num: '01', title: 'Interpolation vs Binary Search', tag: 'Searching',
    complexity: 'O(log log n)', fn: (x) => Math.log2(Math.log2(x + 1.2) + 1) * 8,
    desc: 'Probe a sorted array by estimating the target\u2019s position instead of always splitting in half, then race it against classic binary search.'
  },
  {
    id: 'exp2', num: '02', title: 'Pattern Matching', tag: 'Strings',
    complexity: 'O(n+m)', fn: (x) => 6 + x * 0.35,
    desc: 'Naive scanning, Knuth\u2013Morris\u2013Pratt and Rabin\u2013Karp all hunt for a pattern inside text \u2014 watch how few comparisons the smart ones need.'
  },
  {
    id: 'exp3', num: '03', title: 'Minimum Spanning Tree', tag: 'Graphs',
    complexity: 'O(E log V)', fn: (x) => x * Math.log2(x + 2) * 0.55,
    desc: 'Kruskal\u2019s and Prim\u2019s algorithms each wire up the same graph for the least total cost, taking very different routes to get there.'
  },
  {
    id: 'exp4', num: '04', title: "Dijkstra's Shortest Path", tag: 'Graphs',
    complexity: 'O((V+E) log V)', fn: (x) => (x + 8) * Math.log2(x + 2) * 0.45,
    desc: 'Relax edges outward from a source vertex until every vertex knows its cheapest possible route.'
  },
  {
    id: 'exp5', num: '05', title: 'Min-Max Divide & Conquer', tag: 'Divide & Conquer',
    complexity: '3n/2 \u2212 2', fn: (x) => 1.5 * x - 2,
    desc: 'Find the smallest and largest element together using roughly 3n/2 comparisons instead of the naive 2n.'
  },
  {
    id: 'exp6', num: '06', title: 'Matrix Chain Multiplication', tag: 'Dynamic Programming',
    complexity: 'O(n\u00b3)', fn: (x) => Math.pow(x / 14, 3),
    desc: 'Choose where to place parentheses across a chain of matrices to minimise the total scalar multiplications.'
  },
  {
    id: 'exp7', num: '07', title: 'N-Queens', tag: 'Backtracking',
    complexity: 'O(N!)', fn: (x) => Math.min(120, Math.pow(1.09, x)),
    desc: 'Place N queens on a board so that no two attack each other \u2014 watch the backtracker place, retreat, and try again.'
  },
  {
    id: 'exp8', num: '08', title: 'Travelling Salesman', tag: 'Branch & Bound',
    complexity: 'O(n!)', fn: (x) => Math.min(120, Math.pow(1.14, x)),
    desc: 'Find the cheapest round trip that visits every city exactly once, verified by brute force over all permutations.'
  },
  {
    id: 'exp9', num: '09', title: 'Bin Packing', tag: 'Greedy',
    complexity: 'O(n log n)', fn: (x) => x * Math.log2(x + 2) * 0.5,
    desc: 'Pack items into the fewest bins possible using First Fit, First Fit Decreasing and Best Fit Decreasing.'
  },
  {
    id: 'exp10', num: '10', title: 'Quicksort', tag: 'Divide & Conquer',
    complexity: 'O(n log n)', fn: (x) => x * Math.log2(x + 2) * 0.4,
    desc: 'Deterministic vs randomized pivot selection, stress-tested against random, sorted, reversed and nearly-sorted input.'
  }
];

export function getExperiment(id) {
  return EXPERIMENTS.find((e) => e.id === id);
}
