import type { LetterState } from '../types/game';
import { getLetterStates } from '../lib/wordle';
import { WORD_LENGTH } from '../constants';
import { Cell } from './Cell';

interface LineProps {
  guess: string | null;
  solution: string;
  isCommitted: boolean;
}

export function Line({ guess, solution, isCommitted }: LineProps) {
  const letters = Array.from({ length: WORD_LENGTH }, (_, index) => guess?.[index] ?? '');
  const states: LetterState[] = isCommitted && guess && solution
    ? getLetterStates(guess, solution)
    : Array(WORD_LENGTH).fill('empty');

  return (
    <div className="line">
      {letters.map((letter, index) => (
        <Cell key={index} character={letter} state={states[index]} />
      ))}
    </div>
  );
}
