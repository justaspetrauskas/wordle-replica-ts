import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Check, Copy } from 'lucide-react';
import { getCategoryMeta, type CategoryKey, type PlayableLanguage } from '../data/categories';

export function TopBar({
  backTo,
  center,
  right,
}: {
  backTo?: string;
  center?: ReactNode;
  right?: ReactNode;
}) {
  return (
    <header className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      <div className="flex min-w-0 items-center gap-1.5">
        {backTo ? (
          <Link
            to={backTo}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center text-ink/70 transition hover:text-ink"
            aria-label="Back"
          >
            <ArrowLeft size={18} />
          </Link>
        ) : (
          <span className="inline-block h-9 w-2" />
        )}
        <Link to="/" className="flex min-w-0 items-baseline gap-1.5">
          <span className="font-accent text-base font-bold tracking-tight sm:text-lg">WORDL</span>
          <span className="hidden font-display text-xs text-navy sm:inline">ワードル</span>
        </Link>
      </div>
      <div className="justify-self-center">{center}</div>
      <div className="min-w-0 justify-self-end">{right}</div>
    </header>
  );
}

export function SetupSummary({
  mode,
  language,
  category,
}: {
  mode?: 'solo' | 'together';
  language: PlayableLanguage;
  category: CategoryKey;
}) {
  const meta = getCategoryMeta(category);

  return (
    // Hidden on small screens: the room code and Leave button have to fit the
    // same row, and this is the only part of it that is purely informational.
    <p className="hidden truncate text-right text-[11px] uppercase tracking-[0.12em] text-mute sm:block">
      <span className="text-ink">
        {mode === 'solo' ? 'Solo' : mode === 'together' ? 'Together' : ''}
      </span>
      {mode ? ' · ' : ''}
      {language.toUpperCase()} · {meta.label[language]}
    </p>
  );
}

export function RoomCode({
  code,
  copied,
  onCopy,
}: {
  code: string;
  copied: boolean;
  onCopy: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onCopy}
      className="inline-flex items-center gap-1.5 rounded-full border border-ink/15 bg-washi/80 px-2.5 py-1 sm:gap-2 sm:px-3"
      aria-label={copied ? 'Room code copied' : 'Copy room code'}
    >
      {/* The label is the first thing to go when the row gets tight. */}
      <span className="hidden text-[10px] uppercase tracking-[0.18em] text-mute sm:inline">Code</span>
      <span className="font-accent text-sm font-semibold tracking-[0.14em] sm:tracking-[0.2em]">{code}</span>
      {copied ? <Check size={13} /> : <Copy size={13} className="text-mute" />}
    </button>
  );
}

export function ColorKey() {
  return (
    <p className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-mute">
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-2.5 w-2.5 rounded-[2px] bg-olive" aria-hidden /> right
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-2.5 w-2.5 rounded-[2px] bg-ochre" aria-hidden /> close
      </span>
      <span className="inline-flex items-center gap-1.5">
        <i className="inline-block h-2.5 w-2.5 rounded-[2px] bg-navy" aria-hidden /> out
      </span>
    </p>
  );
}

export function PageShell({
  children,
  wide,
  className = '',
}: {
  children: ReactNode;
  wide?: boolean;
  className?: string;
}) {
  return (
    <div className={`relative min-h-dvh px-4 py-4 sm:px-8 sm:py-7 ${className}`}>
      <div className={`relative mx-auto ${wide ? 'max-w-6xl' : 'max-w-5xl'}`}>{children}</div>
    </div>
  );
}
