// String matching (ported from exp2.py)

export function naiveSearch(text, pattern) {
  const n = text.length, m = pattern.length;
  const matches = [], steps = [];
  let comparisons = 0;
  for (let i = 0; i <= n - m; i++) {
    let j = 0;
    while (j < m) {
      comparisons++;
      const ok = text[i + j] === pattern[j];
      steps.push({ i, j, comparisons, ok, matched: false });
      if (!ok) break;
      j++;
    }
    if (j === m) { matches.push(i); steps.push({ i, j: m - 1, comparisons, ok: true, matched: true }); }
  }
  return { matches, comparisons, steps };
}

function computeLPS(pattern) {
  const m = pattern.length;
  const lps = new Array(m).fill(0);
  let len = 0, i = 1;
  while (i < m) {
    if (pattern[i] === pattern[len]) { len++; lps[i] = len; i++; }
    else if (len !== 0) len = lps[len - 1];
    else { lps[i] = 0; i++; }
  }
  return lps;
}

export function kmpSearch(text, pattern) {
  const n = text.length, m = pattern.length;
  const lps = computeLPS(pattern);
  const matches = [], steps = [];
  let comparisons = 0, i = 0, j = 0;
  while (i < n) {
    comparisons++;
    const ok = pattern[j] === text[i];
    steps.push({ i: i - j, j, comparisons, ok, matched: false });
    if (ok) { i++; j++; }
    if (j === m) {
      matches.push(i - j);
      steps.push({ i: i - j, j: m - 1, comparisons, ok: true, matched: true });
      j = lps[j - 1];
    } else if (i < n && pattern[j] !== text[i]) {
      if (j !== 0) j = lps[j - 1]; else i++;
    }
  }
  return { matches, comparisons, steps, lps };
}

export function rabinKarpSearch(text, pattern, q = 101) {
  const n = text.length, m = pattern.length, d = 256;
  let h = 1;
  for (let k = 0; k < m - 1; k++) h = (h * d) % q;
  let pHash = 0, tHash = 0;
  const matches = [], steps = [];
  let comparisons = 0;
  for (let i = 0; i < m; i++) {
    pHash = (d * pHash + pattern.charCodeAt(i)) % q;
    tHash = (d * tHash + text.charCodeAt(i)) % q;
  }
  for (let s = 0; s <= n - m; s++) {
    let hitAll = true;
    if (pHash === tHash) {
      for (let k = 0; k < m; k++) {
        comparisons++;
        const ok = text[s + k] === pattern[k];
        steps.push({ i: s, j: k, comparisons, ok, matched: false, hashHit: true });
        if (!ok) { hitAll = false; break; }
      }
      if (hitAll) { matches.push(s); steps.push({ i: s, j: m - 1, comparisons, ok: true, matched: true, hashHit: true }); }
    } else {
      steps.push({ i: s, j: -1, comparisons, ok: false, matched: false, hashHit: false });
    }
    if (s < n - m) {
      tHash = (d * (tHash - text.charCodeAt(s) * h) + text.charCodeAt(s + m)) % q;
      if (tHash < 0) tHash += q;
    }
  }
  return { matches, comparisons, steps };
}
