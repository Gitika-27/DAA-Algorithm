// Minimal DOM builder — avoids a framework while keeping page code readable.
export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(node.style, v);
    else node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c === null || c === undefined || c === false) continue;
    node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(c) : c);
  }
  return node;
}

export function svg(tag, attrs = {}, children = []) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs || {})) {
    if (v === null || v === undefined) continue;
    node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) if (c) node.appendChild(c);
  return node;
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

export function randInt(a, b) { return Math.floor(Math.random() * (b - a + 1)) + a; }
export function sample(arr, n) {
  const copy = [...arr];
  const out = [];
  while (out.length < n && copy.length) out.push(copy.splice(randInt(0, copy.length - 1), 1)[0]);
  return out;
}
export function randSortedArray(n, max) {
  const set = new Set();
  while (set.size < n) set.add(randInt(1, max));
  return [...set].sort((a, b) => a - b);
}
