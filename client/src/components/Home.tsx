import type { GameMode } from '../types/game';

interface HomeProps {
  onSelectMode: (mode: GameMode) => void;
}

export function Home({ onSelectMode }: HomeProps) {
  return (
    <main className="game game--setup">
      <div className="setup-card">
        <h1 className="setup-title">Wordle</h1>
        <div className="menu-actions">
          <button
            className="menu-button menu-button--primary"
            type="button"
            onClick={() => onSelectMode('solo')}
          >
            Play solo
          </button>
          <button
            className="menu-button"
            type="button"
            onClick={() => onSelectMode('multiplayer')}
          >
            Multiplayer
          </button>
        </div>
      </div>
    </main>
  );
}
