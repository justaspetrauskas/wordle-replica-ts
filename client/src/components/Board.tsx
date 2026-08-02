import type { LetterState, SubmittedGuess } from '../types/game';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';

/** 'tbd' is a letter the player has typed but not submitted for grading yet. */
type TileStatus = LetterState | 'tbd';

const PALETTE: Record<TileStatus, string> = {
  empty: 'bg-transparent border-ink/25 text-ink',
  tbd: 'bg-transparent border-ink text-ink',
  correct: 'bg-olive border-olive text-washi',
  present: 'bg-ochre border-ochre text-ink',
  absent: 'bg-navy border-navy text-washi/90',
};

// Hand-cut paper corners: every tile gets a slightly different silhouette so
// the grid never reads as a table of rectangles.
const SHAPES = [
  'rounded-[18%_22%_16%_20%/20%_16%_22%_18%]',
  'rounded-[22%_16%_20%_18%/16%_22%_18%_20%]',
  'rounded-[16%_20%_22%_16%/22%_18%_16%_20%]',
  'rounded-[20%_18%_16%_22%/18%_20%_22%_16%]',
  'rounded-[18%_20%_18%_20%/20%_18%_20%_18%]',
];

function Tile({
  letter,
  status,
  delay = 0,
  reveal,
}: {
  letter: string;
  status: TileStatus;
  delay?: number;
  reveal?: boolean;
}) {
  const graded = status === 'correct' || status === 'present' || status === 'absent';

  return (
    <div
      className={`flex aspect-square w-full items-center justify-center border-2 font-accent text-xl font-bold sm:text-2xl ${
        SHAPES[delay % SHAPES.length]
      } ${PALETTE[status]} ${reveal && graded ? 'tile-flip' : ''}`}
      style={reveal ? { animationDelay: `${delay * 80}ms` } : undefined}
    >
      {letter}
    </div>
  );
}

interface BoardProps {
  /** Graded by the server; the client only renders the result. */
  guesses: SubmittedGuess[];
  currentGuess: string[];
  shake?: boolean;
}

export function Board({ guesses, currentGuess, shake }: BoardProps) {
  return (
    <div
      className={`mx-auto grid w-full max-w-[300px] gap-1.5 sm:max-w-[340px] ${shake ? 'shake' : ''}`}
    >
      {Array.from({ length: MAX_GUESSES }, (_, row) => {
        const submitted = guesses[row];
        const isCurrentRow = row === guesses.length;

        return (
          <div key={row} className="grid grid-cols-5 gap-1.5">
            {Array.from({ length: WORD_LENGTH }, (_, column) => {
              if (submitted) {
                return (
                  <Tile
                    key={column}
                    letter={submitted.word[column]?.toUpperCase() ?? ''}
                    status={submitted.states[column] ?? 'empty'}
                    delay={column}
                    // Only the row that just landed animates.
                    reveal={row === guesses.length - 1}
                  />
                );
              }

              const letter = isCurrentRow ? (currentGuess[column] ?? '') : '';

              return (
                <Tile
                  key={column}
                  letter={letter.toUpperCase()}
                  status={letter ? 'tbd' : 'empty'}
                  delay={column}
                />
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

/**
 * The opponent's board. The server sends colours only — never their letters —
 * so this renders bars rather than tiles.
 */
export function MiniBoard({ rows, compact }: { rows: LetterState[][]; compact?: boolean }) {
  const colour = (state: LetterState | undefined) => {
    if (state === 'correct') return 'bg-olive';
    if (state === 'present') return 'bg-ochre';
    if (state === 'absent') return 'bg-navy';

    return 'bg-ink/15';
  };

  return (
    <div className={`grid ${compact ? 'w-24 gap-0.5' : 'gap-1'}`}>
      {Array.from({ length: MAX_GUESSES }, (_, row) => (
        <div key={row} className={`grid grid-cols-5 ${compact ? 'gap-0.5' : 'gap-1'}`}>
          {Array.from({ length: WORD_LENGTH }, (_, column) => (
            <div
              key={column}
              className={`${compact ? 'h-1.5' : 'h-2.5 sm:h-3'} rounded-[1px] ${colour(
                rows[row]?.[column]
              )}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
