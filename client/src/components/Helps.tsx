import type { ReactNode } from 'react';
import { Eye, Hash, Lightbulb } from 'lucide-react';
import type { FlashHint as FlashHintType, GameStatus, HelpUsage } from '../types/game';

interface HelpsBarProps {
  gameStatus: GameStatus;
  helpUsage: HelpUsage;
  onRevealLetter: () => void;
  onSuggestWord: () => void;
  onFlashSolution: () => void;
}

export function HelpsBar({
  gameStatus,
  helpUsage,
  onRevealLetter,
  onSuggestWord,
  onFlashSolution,
}: HelpsBarProps) {
  const helpsLeft = Object.values(helpUsage).filter((used) => !used).length;
  const isPlaying = gameStatus === 'playing';

  const pill = (used: boolean, label: string, icon: ReactNode, aria: string, onClick: () => void) => (
    <button
      type="button"
      onClick={onClick}
      disabled={!isPlaying || used}
      aria-label={aria}
      title={aria}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition ${
        used ? 'border-ink/10 text-mute/50' : 'border-ink/20 bg-washi/70 text-ink hover:border-ink'
      } disabled:cursor-not-allowed`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <span className="text-[11px] uppercase tracking-[0.12em] text-mute">
        Helps left: {helpsLeft}
      </span>
      {pill(helpUsage.suggestWord, 'Word', <Lightbulb size={14} />, 'Suggest a matching word', onSuggestWord)}
      {pill(helpUsage.flashSolution, 'Peek', <Eye size={14} />, 'Flash full solution', onFlashSolution)}
      {pill(
        helpUsage.revealLetter,
        'Letter',
        <Hash size={14} />,
        'Reveal one letter in correct index',
        onRevealLetter
      )}
    </div>
  );
}

/**
 * The solution, shown blurred and briefly. It is meant to be *almost* readable
 * — that is the cost of spending the help.
 *
 * The blur and alpha here pair with FLASH_HINT_MS in useGame. Tested over the
 * category artwork, not flat paper: past roughly blur 8 / alpha 0.22 the word
 * disappears into the wash entirely and the help stops being worth spending.
 */
export function HelpFlash({ hint }: { hint: FlashHintType }) {
  if (!hint.visible) return null;

  return (
    <p
      className="pointer-events-none fixed z-40 -translate-x-1/2 font-accent text-4xl font-bold uppercase tracking-[0.35em] text-navy/28 blur-[7px] sm:text-5xl"
      style={{ top: `${hint.top}vh`, left: `${hint.left}vw` }}
    >
      {hint.word}
    </p>
  );
}

/** A short-lived note, used for hint text the server sends back. */
export function HelpToast({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 top-20 z-40 flex justify-center px-4 sm:top-24">
      <p className="rounded-full border border-ink/10 bg-washi/95 px-4 py-2 font-accent text-sm font-semibold tracking-[0.14em] text-ink shadow-lg sm:text-base">
        {text}
      </p>
    </div>
  );
}
