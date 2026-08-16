import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { LetterState } from '../types/game';
import { MAX_GUESSES, WORD_LENGTH } from '../constants';
import { TILE_PALETTE } from '../lib/tiles';

const DEMO_ROWS: { word: string; states: LetterState[] }[] = [
  { word: 'crane', states: ['absent', 'correct', 'present', 'absent', 'present'] },
  { word: 'bread', states: ['correct', 'correct', 'correct', 'correct', 'correct'] },
];

function DemoBoard() {
  return (
    <div className="flex justify-center">
      <div className="relative inline-grid gap-1.5" aria-hidden>
        {DEMO_ROWS.map((row) => (
          <div key={row.word} className="grid grid-cols-5 gap-1.5">
            {row.word.split('').map((letter, index) => (
              <span
                key={index}
                className={`flex h-7 w-7 items-center justify-center rounded-[5px] border font-accent text-xs font-bold uppercase ${
                  TILE_PALETTE[row.states[index]]
                }`}
              >
                {letter}
              </span>
            ))}
          </div>
        ))}
        <span className="pointer-events-none absolute -inset-x-1.5 -top-1.5 h-10 rounded-lg border-2 border-olive" />
        <span className="pointer-events-none absolute left-full top-3.5 -translate-y-1/2 pl-2 font-accent text-base font-bold text-olive">
          →
        </span>
      </div>
    </div>
  );
}

function Legend() {
  const entries: { state: LetterState; letter: string; text: string }[] = [
    { state: 'correct', letter: 'r', text: 'Olive — in the word, in this exact spot.' },
    { state: 'present', letter: 'a', text: 'Ochre — in the word, but somewhere else.' },
    { state: 'absent', letter: 'c', text: 'Navy — not in the word at all.' },
  ];

  return (
    <ul className="mt-3 grid gap-2">
      {entries.map((entry) => (
        <li key={entry.state} className="flex items-center gap-3">
          <span
            className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] border font-accent text-xs font-bold uppercase ${
              TILE_PALETTE[entry.state]
            }`}
          >
            {entry.letter}
          </span>
          <span className="text-sm text-mute">{entry.text}</span>
        </li>
      ))}
    </ul>
  );
}

export function HowToPlay() {
  const id = useId();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!open) return;

    const onDoc = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };

    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <span ref={ref} className="inline-flex align-middle">
      <button
        type="button"
        className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.18em] text-mute transition hover:text-navy"
        aria-label="How to play"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <HelpCircle size={16} />
        <span className="hidden sm:inline">How to play</span>
      </button>

      {open && (
        <>
          <span
            aria-hidden
            onMouseDown={() => setOpen(false)}
            className="fixed inset-0 z-30 bg-ink/40 backdrop-blur-[2px]"
          />
          <span
            id={id}
            role="dialog"
            aria-modal="true"
            aria-label="How to play"
            className="fixed left-1/2 top-1/2 z-40 block max-h-[85dvh] w-[min(26rem,calc(100vw-2.5rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-ink/10 bg-washi px-5 py-5 text-left normal-case tracking-normal text-ink shadow-xl"
          >
            <span className="block font-display text-2xl">How to play</span>

            <p className="mt-2 text-sm leading-relaxed">
              Guess one hidden {WORD_LENGTH}-letter word in {MAX_GUESSES} tries.
            </p>

            <div className="mt-4 rounded-xl border border-ink/10 bg-paper/60 px-4 py-4">
              <DemoBoard />
              <p className="mt-3 text-center text-sm leading-snug">
                <span className="font-semibold text-olive">Always read across.</span>{' '}
                <span className="text-mute">
                  Every row is one whole word, left to right — across is the only direction that
                  ever spells anything.
                </span>
              </p>
            </div>

            <p className="mt-4 text-sm leading-relaxed text-mute">
              Type a full {WORD_LENGTH}-letter word from left to right, then press Enter. Each guess
              fills the next row down.
            </p>

            <p className="mt-4 text-sm leading-relaxed">After each guess the tiles change colour:</p>
            <Legend />

            <p className="mt-4 border-t border-ink/10 pt-3 text-xs leading-relaxed text-mute">
              The three help buttons are one-time hints: reveal a letter, suggest a word, or take a
              brief blurred peek at the answer.
            </p>
          </span>
        </>
      )}
    </span>
  );
}
