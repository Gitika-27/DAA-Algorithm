# Algorithm Lab — DAA Sem 3

An interactive workbench for all 10 experiments from your `DAA Sem3` file
(`exp1.py`–`exp10.py`). One home page lists every algorithm as a card; click
one to open a dedicated page where you can edit the input, run the real
algorithm (ported to JavaScript, not faked), and watch it work step by step.

**Plain HTML/CSS/JS — no framework, no build step, no dependencies.**
Everything runs in the browser; nothing is sent to a server.

## What's inside

| # | Experiment | What you can do |
|---|---|---|
| 1 | Interpolation vs Binary Search | Edit the sorted array & target, step through both searches side by side, run a benchmark across sizes |
| 2 | Naive / KMP / Rabin–Karp | Edit text & pattern, watch the sliding window and comparisons |
| 3 | Kruskal's & Prim's MST | Edit the weighted graph, animate edge-by-edge construction |
| 4 | Dijkstra's Shortest Path | Edit a directed graph, pick source/target, animate relaxations |
| 5 | Divide & Conquer Min-Max | Edit the array, compare comparison counts vs a naive scan |
| 6 | Matrix Chain Multiplication | Edit matrix dimensions, see the DP table & optimal parenthesization |
| 7 | N-Queens | Pick N, animate the backtracker placing/removing queens |
| 8 | Travelling Salesman | Pick city count, brute-force the optimal tour, see cost matrix |
| 9 | Bin Packing | Edit item sizes, compare First Fit / FFD / Best Fit Decreasing |
| 10 | Quicksort | Deterministic vs randomized pivot, animate partitioning, benchmark input shapes |

## Project structure

```
daa-algo-lab/
├── index.html              # shell page + router mount point
├── css/style.css           # design tokens & all styling
└── js/
    ├── main.js              # wires the router to all 10 pages
    ├── meta.js               # titles/descriptions/complexity for the home grid
    ├── algorithms/expN.js    # pure algorithm logic (ported from your Python), no DOM code
    ├── pages/expN.js         # the interactive page for each experiment (controls + viz)
    ├── pages/home.js         # the bench overview grid
    └── lib/                  # shared helpers: router, step player, charts, graph/array viz
```

Each `algorithms/expN.js` is a straight line-for-line port of the matching
Python file, so if you want to sanity-check correctness you can compare them
directly.

## Run it locally

No install needed — any static file server works. Pick one:

```bash
# Option A: Python (already on most machines)
cd daa-algo-lab
python3 -m http.server 8000
# open http://localhost:8000

# Option B: Node
cd daa-algo-lab
npx serve .

# Option C: VS Code
# install the "Live Server" extension, right-click index.html → "Open with Live Server"
```

You cannot just double-click `index.html` and open it as a `file://` URL —
the app uses ES module imports, which browsers block on `file://` for
security reasons. It must be served over `http://`.

## Deploy it

It's a static site, so any static host works and it's free on all of these:

### Vercel (drag & drop, easiest)
1. Go to https://vercel.com/new
2. Drag the `daa-algo-lab` folder onto the page (or "Deploy" → "Upload").
3. Leave build settings blank (no framework, no build command).
4. Click Deploy — you'll get a live `*.vercel.app` URL in ~10 seconds.

### Netlify (drag & drop)
1. Go to https://app.netlify.com/drop
2. Drag the `daa-algo-lab` folder onto the page.
3. Done — you get a live URL immediately.

### GitHub Pages (good if you want a permanent link tied to your repo)
```bash
cd daa-algo-lab
git init
git add .
git commit -m "Algorithm Lab"
git branch -M main
git remote add origin https://github.com/<your-username>/<repo-name>.git
git push -u origin main
```
Then in the repo on GitHub: **Settings → Pages → Source: `main` branch, `/` (root)**.
Your site will be live at `https://<your-username>.github.io/<repo-name>/`.

### Vercel CLI (if you prefer terminal over drag & drop)
```bash
npm i -g vercel
cd daa-algo-lab
vercel --prod
```

## Notes / things worth knowing

- The N-Queens and Quicksort pages record a full step-by-step trace so you
  can scrub through the animation; for N ≥ 9 on N-Queens the trace is capped
  at a few thousand steps so the tab doesn't lock up (the final solution
  count is still exact).
- TSP is genuine brute force over all permutations, so it's capped at 9
  cities in the UI — 10+ would mean checking 362,880+ tours in the browser.
- The Google Fonts link in `index.html` needs internet access; if you're
  demoing somewhere offline, it'll silently fall back to system fonts and
  everything still works.
