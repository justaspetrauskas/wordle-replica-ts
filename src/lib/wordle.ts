import type { LetterState } from '../types/game';
import { WORD_LENGTH } from '../constants';

export function getLetterStates(guess: string, solution: string): LetterState[] {
  const states: LetterState[] = Array(WORD_LENGTH).fill('absent');
  const solutionChars = solution.split('');
  const guessChars = guess.split('');

  // First pass: correct positions
  guessChars.forEach((letter, i) => {
    if (letter === solutionChars[i]) {
      states[i] = 'correct';
      solutionChars[i] = '';
      guessChars[i] = '';
    }
  });

  // Second pass: present but wrong position
  guessChars.forEach((letter, i) => {
    if (letter === '') return;
    const solutionIndex = solutionChars.indexOf(letter);
    if (solutionIndex !== -1) {
      states[i] = 'present';
      solutionChars[solutionIndex] = '';
    }
  });

  return states;
}
