// N-Queens backtracking (ported from exp7.py)

function isSafe(board, row, col) {
  for (let prevRow = 0; prevRow < row; prevRow++) {
    const placed = board[prevRow];
    if (placed === col) return false;
    if (Math.abs(prevRow - row) === Math.abs(placed - col)) return false;
  }
  return true;
}

// Returns solutions + a bounded step trace (place/backtrack events) for animation.
export function solveNQueens(n, { maxSteps = 4000 } = {}) {
  const board = new Array(n).fill(-1);
  const solutions = [];
  const steps = [];
  let backtracks = 0;

  function record(type, row, col) {
    if (steps.length < maxSteps) steps.push({ type, row, col, board: [...board] });
  }

  function backtrack(row) {
    if (row === n) {
      solutions.push([...board]);
      record('solution', row, -1);
      return;
    }
    for (let col = 0; col < n; col++) {
      if (isSafe(board, row, col)) {
        board[row] = col;
        record('place', row, col);
        backtrack(row + 1);
        board[row] = -1;
        record('remove', row, col);
      }
      backtracks++;
    }
  }
  backtrack(0);
  return { solutions, backtracks, steps };
}
