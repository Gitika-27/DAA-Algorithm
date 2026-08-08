// Divide & Conquer Min-Max (ported from exp5.py)

export function minMaxDC(arr) {
  let comparisons = 0;
  function rec(low, high) {
    if (low === high) return [arr[low], arr[low]];
    if (high === low + 1) {
      comparisons++;
      return arr[low] < arr[high] ? [arr[low], arr[high]] : [arr[high], arr[low]];
    }
    const mid = Math.floor((low + high) / 2);
    const [lmin, lmax] = rec(low, mid);
    const [rmin, rmax] = rec(mid + 1, high);
    comparisons++;
    const overallMin = lmin < rmin ? lmin : rmin;
    comparisons++;
    const overallMax = lmax > rmax ? lmax : rmax;
    return [overallMin, overallMax];
  }
  const [min, max] = rec(0, arr.length - 1);
  return { min, max, comparisons };
}

export function minMaxNaive(arr) {
  let mn = arr[0], mx = arr[0], comparisons = 0;
  for (let i = 1; i < arr.length; i++) {
    comparisons++;
    if (arr[i] < mn) mn = arr[i];
    comparisons++;
    if (arr[i] > mx) mx = arr[i];
  }
  return { min: mn, max: mx, comparisons };
}

export function performanceTable(sizes) {
  return sizes.map((size) => {
    const arr = Array.from({ length: size }, () => Math.floor(Math.random() * 10000) + 1);
    const dc = minMaxDC(arr);
    const naive = minMaxNaive(arr);
    const formula = Math.floor((3 * size) / 2) - 2;
    return { label: String(size), dc: dc.comparisons, naive: naive.comparisons, formula: Math.max(formula, 0) };
  });
}
