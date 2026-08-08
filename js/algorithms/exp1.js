// Interpolation Search vs Binary Search (ported from exp1.py)

export function interpolationSearch(arr, target) {
  let low = 0, high = arr.length - 1, comparisons = 0;
  const steps = [];
  while (low <= high && arr[low] <= target && target <= arr[high]) {
    comparisons++;
    if (low === high) {
      const found = arr[low] === target;
      steps.push({ low, high, pos: low, found, comparisons, note: found ? `Match at index ${low}` : 'Single cell, no match' });
      return { index: found ? low : -1, comparisons, steps };
    }
    const pos = low + Math.floor(((target - arr[low]) / (arr[high] - arr[low])) * (high - low));
    if (arr[pos] === target) {
      steps.push({ low, high, pos, found: true, comparisons, note: `Probe formula lands on index ${pos} — match!` });
      return { index: pos, comparisons, steps };
    } else if (arr[pos] < target) {
      steps.push({ low, high, pos, found: false, comparisons, note: `arr[${pos}]=${arr[pos]} < ${target} → search right` });
      low = pos + 1;
    } else {
      steps.push({ low, high, pos, found: false, comparisons, note: `arr[${pos}]=${arr[pos]} > ${target} → search left` });
      high = pos - 1;
    }
  }
  steps.push({ low, high, pos: -1, found: false, comparisons, note: 'Target outside remaining range' });
  return { index: -1, comparisons, steps };
}

export function binarySearch(arr, target) {
  let low = 0, high = arr.length - 1, comparisons = 0;
  const steps = [];
  while (low <= high) {
    comparisons++;
    const mid = Math.floor((low + high) / 2);
    if (arr[mid] === target) {
      steps.push({ low, high, pos: mid, found: true, comparisons, note: `Midpoint ${mid} matches!` });
      return { index: mid, comparisons, steps };
    } else if (arr[mid] < target) {
      steps.push({ low, high, pos: mid, found: false, comparisons, note: `arr[${mid}]=${arr[mid]} < ${target} → search right half` });
      low = mid + 1;
    } else {
      steps.push({ low, high, pos: mid, found: false, comparisons, note: `arr[${mid}]=${arr[mid]} > ${target} → search left half` });
      high = mid - 1;
    }
  }
  steps.push({ low, high, pos: -1, found: false, comparisons, note: 'Range exhausted, no match' });
  return { index: -1, comparisons, steps };
}

export function performanceTable(sizes) {
  return sizes.map((size) => {
    const arr = Array.from({ length: size }, (_, i) => i * 3 + (i % 7)).sort((a, b) => a - b);
    const target = arr[Math.floor(Math.random() * arr.length)];
    const is = interpolationSearch(arr, target);
    const bs = binarySearch(arr, target);
    return { label: String(size), isComparisons: is.comparisons, bsComparisons: bs.comparisons };
  });
}
