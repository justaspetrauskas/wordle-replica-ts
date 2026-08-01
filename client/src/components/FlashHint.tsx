import type { FlashHint as FlashHintType } from '../types/game';

interface FlashHintProps {
  hint: FlashHintType;
}

export function FlashHint({ hint }: FlashHintProps) {
  if (!hint.visible) return null;

  return (
    <div
      className="flash-solution"
      style={{ top: `${hint.top}vh`, left: `${hint.left}vw` }}
    >
      {hint.word}
    </div>
  );
}
