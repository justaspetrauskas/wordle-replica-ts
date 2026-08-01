import type { LetterState } from '../types/game';
import { WORD_LENGTH } from '../constants';
import { Cell } from './Cell';

interface LineProps {
  word: string;
  /** Server-graded states, or null while the row is still being typed. */
  states: LetterState[] | null;
  hideLetters?: boolean;
}

export function Line({ word, states, hideLetters = false }: LineProps) {
  const letters = Array.from({ length: WORD_LENGTH }, (_, index) => word[index] ?? '');

  return (
    <div className="line">
      {letters.map((letter, index) => (
        <Cell
          key={index}
          character={hideLetters ? '' : letter}
          state={states?.[index] ?? 'empty'}
        />
      ))}
    </div>
  );
}
