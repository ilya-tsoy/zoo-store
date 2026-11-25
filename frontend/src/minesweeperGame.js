export const DIFFICULTIES = [
  { name: 'Easy', size: 9, mines: 10 },
  { name: 'Medium', size: 12, mines: 24 },
  { name: 'Hard', size: 16, mines: 50 },
];

export function newGame({ size }) {
  return {
    cells: Array.from({ length: size * size }, () => ({
      mine: false,
      nearby: 0,
      revealed: false,
      flagged: false,
    })),
    status: 'ready',
    startedAt: null,
    endedAt: null,
    hit: null,
  };
}

function neighbors(index, size) {
  const row = Math.floor(index / size);
  const col = index % size;
  const adjacent = [];
  for (let y = Math.max(0, row - 1); y <= Math.min(size - 1, row + 1); y++) {
    for (let x = Math.max(0, col - 1); x <= Math.min(size - 1, col + 1); x++) {
      const next = y * size + x;
      if (next !== index) adjacent.push(next);
    }
  }
  return adjacent;
}

function placeMines(cells, first, { size, mines }) {
  const safe = new Set([first, ...neighbors(first, size)]);
  const candidates = cells.map((_, index) => index).filter(index => !safe.has(index));

  for (let i = 0; i < mines; i++) {
    const chosen = i + Math.floor(Math.random() * (candidates.length - i));
    [candidates[i], candidates[chosen]] = [candidates[chosen], candidates[i]];
  }

  const mineIndices = new Set(candidates.slice(0, mines));
  return cells.map((cell, index) => ({
    ...cell,
    mine: mineIndices.has(index),
    nearby: neighbors(index, size).filter(next => mineIndices.has(next)).length,
  }));
}

export function isFinished(game) {
  return game.status === 'won' || game.status === 'lost';
}

export function toggleFlag(game, index) {
  const cell = game.cells[index];
  if (isFinished(game) || cell.revealed) return game;

  const cells = [...game.cells];
  cells[index] = { ...cell, flagged: !cell.flagged };
  return { ...game, cells };
}

export function reveal(game, index, difficulty, now) {
  const selected = game.cells[index];
  if (isFinished(game) || selected.flagged) return game;

  const { size } = difficulty;
  const adjacent = neighbors(index, size);
  const opening = game.status === 'ready';
  let pending = [index];

  if (selected.revealed) {
    const flagged = adjacent.filter(next => game.cells[next].flagged).length;
    if (!selected.nearby || flagged !== selected.nearby) return game;
    pending = adjacent;
  }

  const cells = opening ? placeMines(game.cells, index, difficulty) : [...game.cells];
  const startedAt = game.startedAt ?? now;

  while (pending.length) {
    const next = pending.pop();
    const cell = cells[next];
    if (cell.flagged || cell.revealed) continue;
    if (cell.mine) {
      return { cells, status: 'lost', startedAt, endedAt: now, hit: next };
    }

    cells[next] = { ...cell, revealed: true };
    if (!cell.nearby) pending.push(...neighbors(next, size));
  }

  const won = cells.every(cell => cell.mine || cell.revealed);
  return { cells, status: won ? 'won' : 'playing', startedAt, endedAt: won ? now : null, hit: null };
}
