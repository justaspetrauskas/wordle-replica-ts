import type { LanguageCode, RandomWordResponse } from '../types/game';
import { RANDOM_WORDS_API_URL, WORD_COUNT, WORD_LENGTH } from '../constants';

export async function fetchWords(language: LanguageCode): Promise<string[]> {
  const query = new URLSearchParams({
    language,
    category: 'wordle',
    length: String(WORD_LENGTH),
    words: String(WORD_COUNT),
  });

  const response = await fetch(`${RANDOM_WORDS_API_URL}?${query.toString()}`);
  const data: RandomWordResponse[] = await response.json();
  return data.map((item) => item.word.toLowerCase());
}
