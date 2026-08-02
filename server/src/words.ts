const RANDOM_WORDS_API_URL = 'https://random-words-api.kushcreates.com/api';
const WORD_LENGTH = 5;
const WORD_COUNT = 100;
const CATEGORY = 'wordle';


export type LanguageCode = "en" | "es" | "da" | "lt";

type RandomWordResponse = {
  word: string;
};

export async function fetchWords(
  language: LanguageCode
): Promise<string[]> {
  const query = new URLSearchParams({
    language,
    category: CATEGORY,
    length: String(WORD_LENGTH),
    words: String(WORD_COUNT),
  });

  const response = await fetch(
    `${RANDOM_WORDS_API_URL}?${query.toString()}`
  );

  if (!response.ok) {
    throw new Error(`Word API failed: ${response.status}`);
  }

  const data: RandomWordResponse[] = await response.json();

  return data.map((item) => item.word.toLowerCase());
}

export async function getRandomWord(
  language: LanguageCode
): Promise<string> {
  const words = await fetchWords(language);

  if (words.length === 0) {
    throw new Error("No words returned from API");
  }

  const index = Math.floor(Math.random() * words.length);

  return words[index];
}