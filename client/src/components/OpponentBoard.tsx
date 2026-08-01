import type { LetterState } from '../types/game';
import { MAX_GUESSES } from '../constants';
import { Line } from './Line';

interface OpponentBoardProps {
  rows: LetterState[][];
}

/** Colours only — the server never sends the opponent's letters. */
export function OpponentBoard({ rows }: OpponentBoardProps) {
  return (
    <div className="opponent-board">
      <span className="help-count">Opponent</span>
      <div className="board board--mini">
        {Array.from({ length: MAX_GUESSES }, (_, index) => (
          <Line key={index} word="" states={rows[index] ?? null} hideLetters />
        ))}
      </div>
    </div>
  );
}
