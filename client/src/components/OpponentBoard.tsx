import type { LetterState } from '../types/game';
import { MiniBoard } from './Board';

interface OpponentBoardProps {
  rows: LetterState[][];
  compact?: boolean;
}

/** Colours only — the server never sends the opponent's letters. */
export function OpponentBoard({ rows, compact }: OpponentBoardProps) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Opponent</p>
      <div className="mt-3">
        <MiniBoard rows={rows} compact={compact} />
      </div>
    </div>
  );
}
