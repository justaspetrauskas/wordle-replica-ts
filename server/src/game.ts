export const WORD_LENGTH = 5;
export const MAX_GUESSES = 6;

export type LetterState = "correct" | "present" | "absent";

export function getLetterStates(
  guess: string,
  solution: string
): LetterState[] {
  const states: LetterState[] = Array(WORD_LENGTH).fill("absent");

  const solutionChars = solution.split("");
  const guessChars = guess.split("");

  // First pass: correct positions
  guessChars.forEach((letter, i) => {
    if (letter === solutionChars[i]) {
      states[i] = "correct";
      solutionChars[i] = "";
      guessChars[i] = "";
    }
  });

  // Second pass: present but wrong position
  guessChars.forEach((letter, i) => {
    if (letter === "") return;

    const solutionIndex = solutionChars.indexOf(letter);

    if (solutionIndex !== -1) {
      states[i] = "present";
      solutionChars[solutionIndex] = "";
    }
  });

  return states;
}

// Letters are matched with \p{L} rather than [a-z] so Danish and Lithuanian
// words are accepted.
export function isValidGuess(guess: string): boolean {
  return guess.length === WORD_LENGTH && /^\p{L}+$/u.test(guess);
}

export function pickHintLetter(
  solution: string,
  guesses: string[]
): { index: number; letter: string } {
  const unrevealedIndexes = solution
    .split("")
    .map((_, index) => index)
    .filter((index) => !guesses.some((guess) => guess[index] === solution[index]));

  const hintIndexPool = unrevealedIndexes.length > 0
    ? unrevealedIndexes
    : solution.split("").map((_, index) => index);

  const index = hintIndexPool[Math.floor(Math.random() * hintIndexPool.length)];

  return { index, letter: solution[index] };
}

export function pickSuggestion(
  solution: string,
  wordPool: string[]
): string | null {
  const candidates = wordPool.filter((word) => {
    if (word === solution || word.length !== solution.length) return false;

    return word.split("").some((letter, index) => letter === solution[index]);
  });

  if (candidates.length === 0) return null;

  return candidates[Math.floor(Math.random() * candidates.length)];
}