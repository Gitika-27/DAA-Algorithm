// Bin Packing heuristics (ported from exp9.py)

export function firstFit(items, capacity = 1.0) {
  const bins = [], binContents = [];
  for (const item of items) {
    let placed = false;
    for (let i = 0; i < bins.length; i++) {
      if (bins[i] >= item) { bins[i] -= item; binContents[i].push(item); placed = true; break; }
    }
    if (!placed) { bins.push(capacity - item); binContents.push([item]); }
  }
  return binContents;
}

export function firstFitDecreasing(items, capacity = 1.0) {
  return firstFit([...items].sort((a, b) => b - a), capacity);
}

export function bestFitDecreasing(items, capacity = 1.0) {
  const sorted = [...items].sort((a, b) => b - a);
  const bins = [], binContents = [];
  for (const item of sorted) {
    let bestIdx = -1, bestSpace = Infinity;
    for (let i = 0; i < bins.length; i++) {
      if (bins[i] >= item && bins[i] - item < bestSpace) { bestSpace = bins[i] - item; bestIdx = i; }
    }
    if (bestIdx >= 0) { bins[bestIdx] -= item; binContents[bestIdx].push(item); }
    else { bins.push(capacity - item); binContents.push([item]); }
  }
  return binContents;
}

export const DEFAULT_ITEMS = [0.5, 0.7, 0.3, 0.9, 0.2, 0.6, 0.8, 0.4, 0.1, 0.5];
