import type { LetterState } from '../types/game';

/** 'tbd' is a letter the player has typed but not submitted for grading yet. */
export type TileStatus = LetterState | 'tbd';

export const TILE_PALETTE: Record<TileStatus, string> = {
  empty: 'bg-transparent border-ink/25 text-ink',
  tbd: 'bg-transparent border-ink text-ink',
  correct: 'bg-olive border-olive text-washi',
  present: 'bg-ochre border-ochre text-ink',
  absent: 'bg-navy border-navy text-washi/90',
};

export const TILE_STATUS_LABELS: Record<TileStatus, string> = {
  empty: 'empty',
  tbd: 'not submitted yet',
  correct: 'right letter, right spot',
  present: 'right letter, wrong spot',
  absent: 'not in the word',
};
