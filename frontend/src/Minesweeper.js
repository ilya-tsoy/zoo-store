import { useEffect, useRef, useState } from 'react';
import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import '@fontsource/ibm-plex-mono/latin-500.css';
import '@fontsource/ibm-plex-mono/latin-600.css';
import { DIFFICULTIES, isFinished, newGame, reveal, toggleFlag } from './minesweeperGame';
import './Minesweeper.css';

const statusMessages = {
  ready: 'Select a tile to begin',
  playing: 'Game in progress',
  won: 'Field cleared!',
  lost: 'You hit a mine!',
};

function Icon({ name }) {
  return <span aria-hidden="true" className={`ms-icon ms-icon--${name}`} />;
}

function gameTime(milliseconds) {
  const seconds = Math.floor(Math.max(0, milliseconds) / 1000);
  return [Math.floor(seconds / 60), seconds % 60]
    .map(part => String(part).padStart(2, '0'))
    .join(':');
}

function Tile({ cell, index, size, status, hit, focused, onFocus, onPlay, onFlag, onKeyDown, tileRefs }) {
  let display = '';
  let label = 'hidden';

  if (index === hit || (status === 'lost' && cell.mine && !cell.flagged)) {
    display = 'mine';
    label = index === hit ? 'mine hit' : 'mine';
  } else if (status === 'lost' && cell.flagged && !cell.mine) {
    display = 'wrong';
    label = 'incorrect flag';
  } else if (cell.flagged || (status === 'won' && cell.mine)) {
    display = 'flag';
    label = 'flagged';
  } else if (cell.revealed) {
    display = cell.nearby || '';
    label = cell.nearby ? `${cell.nearby} adjacent ${cell.nearby === 1 ? 'mine' : 'mines'}` : 'clear';
  }

  return (
    <button
      type="button"
      className="ms-tile"
      data-face={display}
      data-revealed={cell.revealed || display === 'mine'}
      data-hit={index === hit}
      aria-label={`Row ${Math.floor(index / size) + 1}, column ${index % size + 1}, ${label}`}
      aria-disabled={status === 'won' || status === 'lost'}
      tabIndex={focused ? 0 : -1}
      ref={element => { tileRefs.current[index] = element; }}
      onFocus={() => onFocus(index)}
      onClick={() => onPlay(index)}
      onContextMenu={event => {
        event.preventDefault();
        onFlag(index);
      }}
      onKeyDown={event => onKeyDown(event, index)}
    >
      {typeof display === 'number' ? display : display && <Icon name={display} />}
    </button>
  );
}

export default function Minesweeper() {
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const difficulty = DIFFICULTIES[difficultyIndex];
  const [game, setGame] = useState(() => newGame(DIFFICULTIES[0]));
  const [now, setNow] = useState(0);
  const [mode, setMode] = useState('reveal');
  const [focusedTile, setFocusedTile] = useState(0);
  const tileRefs = useRef([]);
  const help = useRef(null);

  useEffect(() => {
    if (game.status !== 'playing') return undefined;
    const timer = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(timer);
  }, [game.status]);

  const flaggedCount = game.cells.filter(cell => cell.flagged).length;
  const minesLeft = game.status === 'won' ? 0 : difficulty.mines - flaggedCount;
  const elapsed = game.startedAt === null ? 0 : (game.endedAt ?? now) - game.startedAt;

  function reset(nextDifficulty = difficultyIndex) {
    setDifficultyIndex(nextDifficulty);
    setGame(newGame(DIFFICULTIES[nextDifficulty]));
    setNow(0);
    setMode('reveal');
    setFocusedTile(0);
  }

  function flagTile(index) {
    setGame(current => toggleFlag(current, index));
  }

  function playTile(index) {
    if (mode === 'flag') {
      flagTile(index);
      return;
    }

    const timestamp = Date.now();
    const next = reveal(game, index, difficulty, timestamp);
    if (next !== game) {
      setNow(timestamp);
      setGame(next);
    }
  }

  function tileKeyDown(event, index) {
    if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      if (!event.repeat) flagTile(index);
      return;
    }

    const { size } = difficulty;
    const destinations = {
      ArrowUp: index >= size ? index - size : index,
      ArrowDown: index + size < game.cells.length ? index + size : index,
      ArrowLeft: index % size > 0 ? index - 1 : index,
      ArrowRight: index % size < size - 1 ? index + 1 : index,
    };
    if (Object.prototype.hasOwnProperty.call(destinations, event.key)) {
      event.preventDefault();
      tileRefs.current[destinations[event.key]]?.focus();
    }
  }

  return (
    <div className="ms-page">
      <header className="ms-header">
        <div className="ms-header-inner">
          <div className="ms-wordmark">
            <span className="ms-brand-icon"><Icon name="mine" /></span>
            FIELDWORK
          </div>
          <button className="ms-help-button" type="button" onClick={() => help.current.showModal()}>
            <Icon name="help" /> How to play
          </button>
        </div>
      </header>

      <main className="ms-main">
        <div className="ms-intro">
          <h1>Minesweeper<span>.</span></h1>
          <p>Reveal every safe tile without hitting a mine.</p>
        </div>

        <div className="ms-layout">
          <section className="ms-board-panel" aria-label="Game">
            <div className="ms-board-header">
              <div className="ms-score">
                <div className="ms-stat">
                  <span className="ms-stat-label"><Icon name="mine" /> Mines left</span>
                  <strong>{minesLeft}</strong>
                </div>
                <div className="ms-stat">
                  <span className="ms-stat-label"><Icon name="clock" /> Time</span>
                  <strong>{gameTime(elapsed)}</strong>
                </div>
              </div>
              <button className="ms-new-game" type="button" onClick={() => reset()}>
                <Icon name="reset" /> New game
              </button>
            </div>

            <div
              className="ms-board"
              role="group"
              aria-label={`Minesweeper board, ${difficulty.size} by ${difficulty.size}`}
              style={{ '--columns': difficulty.size }}
            >
              {game.cells.map((cell, index) => (
                <Tile
                  key={index}
                  cell={cell}
                  index={index}
                  size={difficulty.size}
                  status={game.status}
                  hit={game.hit}
                  focused={focusedTile === index}
                  onFocus={setFocusedTile}
                  onPlay={playTile}
                  onFlag={flagTile}
                  onKeyDown={tileKeyDown}
                  tileRefs={tileRefs}
                />
              ))}
            </div>

            <div className="ms-board-footer">
              <div className="ms-status" role="status" data-status={game.status}>
                <span aria-hidden="true" />{statusMessages[game.status]}
              </div>
              <div className="ms-mode" role="group" aria-label="Tile action">
                {['reveal', 'flag'].map(action => (
                  <button
                    key={action}
                    type="button"
                    aria-pressed={mode === action}
                    disabled={isFinished(game)}
                    onClick={() => setMode(action)}
                  >
                    <Icon name={action === 'reveal' ? 'target' : 'flag'} /> {action === 'reveal' ? 'Reveal' : 'Flag'}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="ms-sidebar" aria-label="Settings and controls">
            <section className="ms-card" aria-labelledby="ms-difficulty">
              <h2 id="ms-difficulty"><Icon name="levels" /> Difficulty</h2>
              <div className="ms-levels" role="group" aria-labelledby="ms-difficulty">
                {DIFFICULTIES.map(({ name, size, mines }, index) => (
                  <button
                    key={name}
                    className="ms-level"
                    type="button"
                    aria-pressed={difficultyIndex === index}
                    onClick={() => {
                      if (difficultyIndex !== index) reset(index);
                    }}
                  >
                    <span className="ms-level-radio" aria-hidden="true" />
                    <span className="ms-level-copy">
                      <strong>{name}</strong>
                      <small>
                        <span>{size} × {size}</span>
                        <span className="ms-level-separator" aria-hidden="true"> · </span>
                        <span>{mines} mines</span>
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </section>

            <section className="ms-card ms-controls" aria-labelledby="ms-controls">
              <h2 id="ms-controls"><Icon name="mouse" /> Controls</h2>
              <dl>
                <div><dt>Reveal a tile</dt><dd><kbd>Click</kbd></dd></div>
                <div><dt>Place or remove flag</dt><dd><kbd>Right-click</kbd></dd></div>
                <div><dt>Flag with keyboard</dt><dd><kbd>F</kbd></dd></div>
              </dl>
              <p className="ms-tip"><Icon name="info" /> Your first reveal is always safe.</p>
            </section>
          </aside>
        </div>
      </main>

      <dialog className="ms-dialog" aria-labelledby="ms-help-title" ref={help} onClick={event => {
        if (event.target === event.currentTarget) help.current.close();
      }}>
        <div className="ms-dialog-inner">
          <button className="ms-close" type="button" aria-label="Close instructions" onClick={() => help.current.close()}>
            <Icon name="wrong" />
          </button>
          <h2 id="ms-help-title">How to play</h2>
          <p>Reveal every safe tile to win. Each number tells you how many mines touch that tile, including diagonally.</p>
          <ul>
            <li>Click or tap a tile to reveal it. Empty tiles open up the surrounding area.</li>
            <li>Right-click to flag a suspected mine. On a touch screen, choose Flag and tap a tile.</li>
            <li>Once you’ve flagged all the mines next to a number, click that number to reveal its other neighbors.</li>
            <li>Use arrow keys to move around the board, Enter or Space to use the selected action, and F to flag.</li>
          </ul>
          <button className="ms-new-game" type="button" onClick={() => help.current.close()}>Back to game</button>
        </div>
      </dialog>
    </div>
  );
}
