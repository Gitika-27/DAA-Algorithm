// Deterministic vs Randomized Quicksort (ported from exp10.py)

export function quicksortTraced(inputArr, randomized = false) {
  const arr = [...inputArr];
  let comparisons = 0;
  const steps = [];

  function partition(low, high) {
    if (randomized) {
      const randIdx = low + Math.floor(Math.random() * (high - low + 1));
      [arr[randIdx], arr[high]] = [arr[high], arr[randIdx]];
      steps.push({ type: 'choose-pivot', low, high, pivotIdx: high, array: [...arr] });
    } else {
      steps.push({ type: 'choose-pivot', low, high, pivotIdx: high, array: [...arr] });
    }
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      steps.push({ type: 'compare', low, high, i, j, pivotIdx: high, array: [...arr] });
      if (arr[j] <= pivot) {
        i++;
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ type: 'swap', low, high, i, j, pivotIdx: high, array: [...arr] });
      }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    steps.push({ type: 'place-pivot', low, high, i: i + 1, array: [...arr] });
    return i + 1;
  }

  function sort(low, high) {
    if (low < high) {
      const pi = partition(low, high);
      sort(low, pi - 1);
      sort(pi + 1, high);
    }
  }
  sort(0, arr.length - 1);
  return { sorted: arr, comparisons, steps };
}

export function quicksortFast(inputArr, randomized = false) {
  // Non-traced version for performance timing on larger arrays.
  const arr = [...inputArr];
  let comparisons = 0;
  function partition(low, high) {
    if (randomized) {
      const r = low + Math.floor(Math.random() * (high - low + 1));
      [arr[r], arr[high]] = [arr[high], arr[r]];
    }
    const pivot = arr[high];
    let i = low - 1;
    for (let j = low; j < high; j++) {
      comparisons++;
      if (arr[j] <= pivot) { i++; [arr[i], arr[j]] = [arr[j], arr[i]]; }
    }
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
  }
  function sort(low, high) {
    if (low < high) { const pi = partition(low, high); sort(low, pi - 1); sort(pi + 1, high); }
  }
  const t0 = performance.now();
  sort(0, arr.length - 1);
  const elapsed = performance.now() - t0;
  return { sorted: arr, comparisons, elapsed };
}

export function generateTestCases(N) {
  const random = Array.from({ length: N }, () => Math.floor(Math.random() * 100000) + 1);
  const sortedArr = Array.from({ length: N }, (_, i) => i);
  const reverse = Array.from({ length: N }, (_, i) => N - i);
  const nearlySorted = Array.from({ length: N }, (_, i) => i);
  for (let k = 0; k < Math.floor(N / 20); k++) {
    const i = Math.floor(Math.random() * N), j = Math.floor(Math.random() * N);
    [nearlySorted[i], nearlySorted[j]] = [nearlySorted[j], nearlySorted[i]];
  }
  return { Random: random, Sorted: sortedArr, Reverse: reverse, 'Nearly Sorted': nearlySorted };
}
