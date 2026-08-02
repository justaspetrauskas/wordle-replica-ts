import { getCategoryMeta } from '../data/categories';

export function CutoutAccent({
  category,
  className = '',
}: {
  category?: string;
  className?: string;
}) {
  const meta = getCategoryMeta(category);

  if (!meta.image) return null;

  return (
    <div className={`pointer-events-none select-none ${className}`} aria-hidden>
      <img
        src={meta.image}
        alt=""
        decoding="async"
        className="h-full w-full object-cover shadow-[0_18px_40px_-24px_rgba(29,53,87,0.55)]"
      />
    </div>
  );
}
