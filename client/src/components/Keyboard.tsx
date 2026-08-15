import { Delete } from 'lucide-react';
import type { KeyboardLetterStates, LanguageCode } from '../types/game';

const BASE_ROWS: string[][] = [
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l'],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm'],
];

/** Row the Enter/Backspace keys sit on, as on a physical Wordle keyboard. */
const ACTION_ROW = 2;

// Guesses are matched with \p{L}, so every alphabet the word API serves needs
// its own keys or those words cannot be typed at all on a touch device. The
// Danish and Lithuanian sets are kept ready for when a word source can serve
// them — today the API answers `null` for both, so neither is offered.
const EXTRA_LETTERS: Record<string, string[]> = {
  en: [],
  es: ['ñ'],
  da: ['æ', 'ø', 'å'],
  lt: ['ą', 'č', 'ę', 'ė', 'į', 'š', 'ų', 'ū', 'ž'],
};

// Torn-paper key silhouettes, cycled so no two neighbours match.
const SHAPES = [
  'rounded-[38%_62%_48%_52%/55%_42%_58%_45%]',
  'rounded-[55%_45%_60%_40%/48%_58%_42%_52%]',
  'rounded-[42%_58%_40%_60%/60%_40%_55%_45%]',
  'rounded-[60%_40%_55%_45%/40%_60%_45%_55%]',
  'rounded-[48%_52%_62%_38%/52%_48%_40%_60%]',
  'rounded-[35%_65%_50%_50%/58%_42%_50%_50%]',
];

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

function keyColour(state: KeyboardLetterStates[string] | undefined): string {
  if (state === 'correct') return 'bg-olive text-washi border-olive';
  if (state === 'present') return 'bg-ochre text-ink border-ochre';
  if (state === 'absent') return 'bg-navy/85 text-washi/85 border-navy/85';

  return 'bg-washi/85 text-ink border-ink/20 hover:border-ink/50';
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
    <div
      className="mx-auto flex w-full max-w-xl flex-col gap-1.5"
      role="group"
      aria-label="Keyboard"
    >
      {rows.map((row, rowIndex) => (
        <div className="flex justify-center gap-1 sm:gap-1.5" key={rowIndex}>
          {rowIndex === ACTION_ROW ? (
            <button
              className="rounded-[48%_52%_40%_60%/50%_45%_55%_50%] border border-coral-ink bg-coral-ink px-2 py-2.5 font-accent text-[11px] font-bold uppercase tracking-wide text-washi transition disabled:opacity-40 sm:px-3 sm:py-3 sm:text-xs"
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

          {row.map((letter, index) => (
            <button
              key={letter}
              className={`min-w-6 flex-1 border px-1 py-2.5 font-accent text-xs font-semibold uppercase transition disabled:opacity-40 sm:min-w-8 sm:flex-none sm:px-2.5 sm:py-3 sm:text-sm ${
                SHAPES[(rowIndex + index) % SHAPES.length]
              } ${keyColour(letterStates[letter])}`}
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
              className="inline-flex items-center justify-center rounded-[50%_50%_45%_55%/55%_45%_55%_45%] border border-ink/25 bg-washi/85 px-2 py-2.5 text-ink transition disabled:opacity-40 sm:px-3 sm:py-3"
              type="button"
              onClick={onBackspace}
              onMouseDown={(event) => event.preventDefault()}
              disabled={disabled}
              aria-label="Backspace"
            >
              <Delete size={16} />
            </button>
          ) : null}
        </div>
      ))}
    </div>
  );
}
