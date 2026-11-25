import { fireEvent, render, screen, within } from '@testing-library/react';
import Minesweeper from './Minesweeper';
import { DIFFICULTIES, newGame, reveal } from './minesweeperGame';

const easy = DIFFICULTIES[0];

afterEach(() => jest.restoreAllMocks());

test('changes difficulty and resets the current game', () => {
  render(<Minesweeper />);
  expect(screen.getByRole('heading', { name: /minesweeper/i })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /medium/i }));
  const board = screen.getByRole('group', { name: /12 by 12/i });
  expect(within(board).getAllByRole('button')).toHaveLength(144);

  fireEvent.click(screen.getByRole('button', { name: 'Flag' }));
  fireEvent.click(within(board).getByRole('button', { name: 'Row 1, column 1, hidden' }));
  expect(within(board).getByRole('button', { name: 'Row 1, column 1, flagged' })).toBeInTheDocument();

  fireEvent.click(screen.getByRole('button', { name: /new game/i }));
  expect(within(board).getAllByRole('button', { name: /hidden/i })).toHaveLength(144);
  expect(screen.getByRole('button', { name: 'Reveal' })).toHaveAttribute('aria-pressed', 'true');
});

test('protects a flagged tile and ends the game when a mine is revealed', () => {
  jest.spyOn(Math, 'random').mockReturnValue(.6);
  render(<Minesweeper />);

  const first = screen.getByRole('button', { name: 'Row 1, column 1, hidden' });
  const mine = screen.getByRole('button', { name: 'Row 1, column 3, hidden' });
  fireEvent.contextMenu(mine);
  fireEvent.click(first);
  fireEvent.click(mine);
  expect(first).toHaveAccessibleName('Row 1, column 1, clear');
  expect(mine).toHaveAccessibleName('Row 1, column 3, flagged');

  fireEvent.keyDown(mine, { key: 'f' });
  fireEvent.click(mine);
  expect(mine).toHaveAccessibleName('Row 1, column 3, mine hit');
  expect(screen.getByRole('status')).toHaveTextContent('You hit a mine!');
});

test('wins when every safe tile is open without requiring flags', () => {
  jest.spyOn(Math, 'random').mockReturnValue(.6);
  let game = reveal(newGame(easy), 0, easy, 1000);

  expect(game.cells.filter(cell => cell.mine)).toHaveLength(easy.mines);
  expect(game.cells[0]).toMatchObject({ mine: false, nearby: 0, revealed: true });

  for (const [index, cell] of game.cells.entries()) {
    if (!cell.mine && !cell.revealed) game = reveal(game, index, easy, 3000);
  }

  expect(game.status).toBe('won');
  expect(game.endedAt).toBe(3000);
  expect(game.cells.every(cell => cell.mine || cell.revealed)).toBe(true);
});
