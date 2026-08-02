import type { LanguageCode } from '../types/game';

/**
 * The languages the word API actually serves. It answers with HTTP 200 and a
 * `null` body for everything else, so Danish and Lithuanian are not offered.
 */
export const PLAYABLE_LANGUAGES = ['en', 'es'] as const satisfies readonly LanguageCode[];

export type PlayableLanguage = (typeof PLAYABLE_LANGUAGES)[number];

export type CategoryId =
  | 'misc'
  | 'animals'
  | 'countries'
  | 'food'
  | 'birds'
  | 'science'
  | 'history';

export interface CategoryMeta {
  id: CategoryId;
  label: Record<PlayableLanguage, string>;
  kicker: string;
  note: Record<PlayableLanguage, string>;
  /** Empty means the category is prepared but not playable yet. */
  availableIn: PlayableLanguage[];
  /** Only the playable categories carry artwork. */
  image?: string;
}

/**
 * Availability is per language, not global: the API serves `animals` and
 * `countries` in both languages but the general pool behind `misc` only in
 * English.
 */
export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'misc',
    label: { en: 'Misc', es: 'Varios' },
    kicker: '雑',
    note: {
      en: 'A mixed paper drawer.',
      es: 'Un cajón de papel mezclado.',
    },
    availableIn: ['en'],
    image: '/images/cat-misc.webp',
  },
  {
    id: 'animals',
    label: { en: 'Animals', es: 'Animales' },
    kicker: '生きもの',
    note: {
      en: 'Beasts, birds, and quiet companions.',
      es: 'Bestias, aves y compañeros quietos.',
    },
    availableIn: ['en', 'es'],
    image: '/images/cat-animals.webp',
  },
  {
    id: 'countries',
    label: { en: 'Countries', es: 'Países' },
    kicker: '国',
    note: {
      en: 'Places on a paper map.',
      es: 'Lugares en un mapa de papel.',
    },
    availableIn: ['en', 'es'],
    image: '/images/cat-countries.webp',
  },
  {
    id: 'food',
    label: { en: 'Food', es: 'Comida' },
    kicker: '食',
    note: { en: 'Kitchen still life.', es: 'Bodegón de cocina.' },
    availableIn: [],
  },
  {
    id: 'birds',
    label: { en: 'Birds', es: 'Aves' },
    kicker: '鳥',
    note: { en: 'Wings on paper.', es: 'Alas en papel.' },
    availableIn: [],
  },
  {
    id: 'science',
    label: { en: 'Science', es: 'Ciencia' },
    kicker: '科学',
    note: { en: 'Atoms, lenses, leaves.', es: 'Átomos, lentes, hojas.' },
    availableIn: [],
  },
  {
    id: 'history',
    label: { en: 'History', es: 'Historia' },
    kicker: '歴史',
    note: { en: 'Old paper, old worlds.', es: 'Papel viejo, mundos viejos.' },
    availableIn: [],
  },
];

export const LANGUAGES: {
  id: PlayableLanguage;
  name: string;
  native: string;
  kicker: string;
}[] = [
  { id: 'en', name: 'English', native: 'English', kicker: '英語' },
  { id: 'es', name: 'Spanish', native: 'Español', kicker: 'スペイン語' },
];

const FALLBACK_CATEGORY = CATEGORIES[0];

export function getCategoryMeta(id?: string): CategoryMeta {
  return CATEGORIES.find((category) => category.id === id) ?? FALLBACK_CATEGORY;
}

export function isPlayableLanguage(value: unknown): value is PlayableLanguage {
  return PLAYABLE_LANGUAGES.includes(value as PlayableLanguage);
}

export function isCategoryId(value: unknown): value is CategoryId {
  return CATEGORIES.some((category) => category.id === value);
}

/** Categories the API can actually serve a word for in this language. */
export function categoriesFor(language: PlayableLanguage): CategoryMeta[] {
  return CATEGORIES.filter((category) => category.availableIn.includes(language));
}

export function isCategoryAvailable(
  id: CategoryId,
  language: PlayableLanguage
): boolean {
  return getCategoryMeta(id).availableIn.includes(language);
}

/**
 * Keeps a selection valid when the language changes — switching to Spanish
 * with Misc selected has to land somewhere real.
 */
export function resolveCategory(
  preferred: CategoryId,
  language: PlayableLanguage
): CategoryId {
  if (isCategoryAvailable(preferred, language)) return preferred;

  return categoriesFor(language)[0]?.id ?? 'animals';
}

export const KEYBOARD: Record<PlayableLanguage, string[][]> = {
  en: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ],
  es: [
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M'],
  ],
};

export const COPY = {
  brand: 'WORDL',
  brandJa: 'ワードル',
  tagline: {
    en: 'A paper game of five letters.',
    es: 'Un juego de papel de cinco letras.',
  },
};
