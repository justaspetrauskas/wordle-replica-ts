import type { LetterState } from '../types/game';

interface CellProps {
  character: string;
  state: LetterState;
}

export function Cell({ character, state }: CellProps) {
  return <div className={`cell cell--${state}`}>{character}</div>;
}
