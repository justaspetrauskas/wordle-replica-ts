import { getCategoryMeta } from '../data/categories';

/**
 * Full-bleed category artwork behind the board, knocked back by a paper-cutout
 * mask so the tiles stay readable on top of it.
 */
export function CategoryWash({ category }: { category?: string }) {
  const meta = getCategoryMeta(category);

  if (!meta.image) return null;

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden>
      <img
        src={meta.image}
        alt=""
        decoding="async"
        className="absolute inset-0 h-full w-full scale-110 object-cover"
        style={{ opacity: 'var(--cutout-opacity)' }}
      />
      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path
          fill="#efe6d6"
          d="M0 0 H38
             C46 4 41 11 48 16
             C56 22 47 28 53 34
             C61 41 49 47 55 54
             C63 62 50 68 57 75
             C64 82 52 88 58 93
             C61 96 54 99 50 100
             H0 Z"
        />
        <path fill="#efe6d6" opacity="0.88" d="M0 78 C28 72 48 86 70 80 C84 76 94 88 100 84 V100 H0 Z" />
        <path fill="#efe6d6" opacity="0.72" d="M62 0 C70 8 66 14 78 18 C90 23 86 8 100 12 V0 Z" />
      </svg>
    </div>
  );
}
