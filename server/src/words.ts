const RANDOM_WORDS_API_URL = 'https://random-words-api.kushcreates.com/api';
const WORD_LENGTH = 5;
const WORD_COUNT = 100;

/**
 * Only the languages the API actually serves. It answers HTTP 200 with a
 * `null` body for Danish and Lithuanian, so offering them would just produce
 * failed rooms.
 */
export type LanguageCode = "en" | "es";

export type CategoryId = "misc" | "animals" | "countries";

/**
 * `misc` is the API's general Wordle pool rather than a themed list, and is the
 * only one with a decent number of words — the themed lists return 19-27.
 */
const API_CATEGORY: Record<CategoryId, string> = {
  misc: "wordle",
  animals: "animals",
  countries: "countries",
};

/** Which pairs the API can actually answer. Anything else returns `null`. */
const AVAILABLE: Record<LanguageCode, CategoryId[]> = {
  en: ["misc", "animals", "countries"],
  es: ["animals", "countries"],
};

export function isLanguageCode(value: unknown): value is LanguageCode {
  return value === "en" || value === "es";
}

export function isCategoryId(value: unknown): value is CategoryId {
  return value === "misc" || value === "animals" || value === "countries";
}

export function isAvailable(
  language: LanguageCode,
  category: CategoryId
): boolean {
  return AVAILABLE[language].includes(category);
}

type RandomWordResponse = {
  word: string;
};

export class WordSourceError extends Error {}

export async function fetchWords(
  language: LanguageCode,
  category: CategoryId
): Promise<string[]> {
  if (!isAvailable(language, category)) {
    throw new WordSourceError(
      `No words for ${category} in ${language}`
    );
  }

  const query = new URLSearchParams({
    language,
    category: API_CATEGORY[category],
    length: String(WORD_LENGTH),
    words: String(WORD_COUNT),
  });

  const response = await fetch(
    `${RANDOM_WORDS_API_URL}?${query.toString()}`
  );

  if (!response.ok) {
    throw new WordSourceError(`Word API failed: ${response.status}`);
  }

  const data: unknown = await response.json();

  // The API signals "nothing here" with a 200 and a `null` body rather than an
  // error status, so the response has to be shape-checked before it is used.
  if (!Array.isArray(data)) {
    throw new WordSourceError(
      `Word API returned no list for ${language}/${category}`
    );
  }

  const words = (data as RandomWordResponse[])
    .filter((item) => typeof item?.word === "string")
    .map((item) => item.word.toLowerCase())
    .filter((word) => word.length === WORD_LENGTH);

  if (words.length === 0) {
    throw new WordSourceError(
      `Word API returned no usable words for ${language}/${category}`
    );
  }

  return words;
}
