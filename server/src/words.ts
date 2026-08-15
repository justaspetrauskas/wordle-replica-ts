import { WORD_SETS } from "./data/words.generated.js";

export type LanguageCode = "en" | "es";

export type CategoryId = "misc" | "animals" | "countries" | "food";

const LANGUAGE_CODES: LanguageCode[] = ["en", "es"];

const CATEGORY_IDS: CategoryId[] = ["misc", "animals", "countries", "food"];

export function isLanguageCode(value: unknown): value is LanguageCode {
  return LANGUAGE_CODES.includes(value as LanguageCode);
}

export function isCategoryId(value: unknown): value is CategoryId {
  return CATEGORY_IDS.includes(value as CategoryId);
}

export function isAvailable(
  language: LanguageCode,
  category: CategoryId
): boolean {
  return (WORD_SETS[language]?.[category]?.length ?? 0) > 0;
}

export function availableCategories(language: LanguageCode): CategoryId[] {
  return CATEGORY_IDS.filter((category) => isAvailable(language, category));
}

export class WordSourceError extends Error {}

export function getWords(
  language: LanguageCode,
  category: CategoryId
): string[] {
  const words = WORD_SETS[language]?.[category];

  if (!words || words.length === 0) {
    throw new WordSourceError(`No words for ${category} in ${language}`);
  }

  return [...words];
}
