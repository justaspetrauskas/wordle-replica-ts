import type { KeyboardLetterStates, LanguageCode } from '../types/game';

const BASE_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

/** Row the Enter/Backspace keys sit on, as on a physical Wordle keyboard. */
const ACTION_ROW = 2;

// Guesses are matched with \p{L}, so every alphabet the word API serves needs
// its own keys or those words cannot be typed at all on a touch device.
const EXTRA_LETTERS: Record<LanguageCode, string[]> = {
  en: [],
  es: ['ñ'],
  da: ['æ', 'ø', 'å'],
  lt: ['ą', 'č', 'ę', 'ė', 'į', 'š', 'ų', 'ū', 'ž'],
};

function getRows(language: LanguageCode): string[][] {
  const extras = EXTRA_LETTERS[language] ?? [];
  const rows = BASE_ROWS.map((row) => [...row]);

  if (extras.length === 0) return rows;

  // A couple of letters fit on the home row; a full set needs its own.
  if (extras.length <= 3) {
    rows[1] = [...rows[1], ...extras];
    return rows;
  }

  return [...rows, extras];
}

interface KeyboardProps {
  language: LanguageCode;
  letterStates: KeyboardLetterStates;
  disabled: boolean;
  onLetter: (letter: string) => void;
  onEnter: () => void;
  onBackspace: () => void;
}

export function Keyboard({
  language,
  letterStates,
  disabled,
  onLetter,
  onEnter,
  onBackspace,
}: KeyboardProps) {
  const rows = getRows(language);

  return (
    <div className="keyboard" role="group" aria-label="Keyboard">
      {rows.map((row, rowIndex) => (
        <div className="keyboard-row" key={rowIndex}>
          {rowIndex === ACTION_ROW ? (
            <button
              className="key key--action"
              type="button"
              onClick={onEnter}
              // Keeps focus off the key, so a later Enter press is not
              // delivered twice (once as a click, once as a keydown).
              onMouseDown={(event) => event.preventDefault()}
              disabled={disabled}
            >
              Enter
            </button>
          ) : null}

          {row.map((letter) => (
            <button
              key={letter}
              className={`key key--${letterStates[letter] ?? 'unused'}`}
              type="button"
              onClick={() => onLetter(letter)}
              onMouseDown={(event) => event.preventDefault()}
              disabled={disabled}
              aria-label={letter}
            >
              {letter}
            </button>
          ))}

          {rowIndex === ACTION_ROW ? (
            <button
              className="key key--action"
              type="button"
              onClick={onBackspace}
              onMouseDown={(event) => event.preventDefault()}
              disabled={disabled}
              aria-label="Backspace"
            >
              ⌫
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
