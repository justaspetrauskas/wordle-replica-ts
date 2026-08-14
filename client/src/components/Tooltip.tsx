import { useEffect, useId, useRef, useState } from 'react';
import { HelpCircle } from 'lucide-react';

export function Tooltip({ label, children }: { label: string; children: string }) {
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
        className="inline-flex h-6 w-6 items-center justify-center text-mute transition hover:text-navy"
        aria-label={label}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((value) => !value)}
      >
        <HelpCircle size={16} />
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
            role="tooltip"
            className="fixed left-1/2 top-1/2 z-40 w-[min(22rem,calc(100vw-2.5rem))] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-ink/10 bg-washi px-5 py-4 text-left text-sm normal-case leading-relaxed tracking-normal text-ink shadow-xl"
          >
            {children}
          </span>
        </>
      )}
    </span>
  );
}
