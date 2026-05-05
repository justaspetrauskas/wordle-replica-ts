import { fetchWords } from './api';
import { RANDOM_WORDS_API_URL, WORD_COUNT, WORD_LENGTH } from '../constants';
import type { RandomWordResponse } from '../types/game';

const mockFetch = vi.fn();

beforeAll(() => {
  vi.stubGlobal('fetch', mockFetch);
});

afterAll(() => {
  vi.unstubAllGlobals();
});

beforeEach(() => {
  mockFetch.mockReset();
});

function makeWordResponse(words: string[]): RandomWordResponse[] {
  return words.map((word) => ({
    word,
    length: word.length,
    category: 'wordle',
    language: 'en',
  }));
}

describe('fetchWords', () => {
  describe('successful response', () => {
    it('returns an array of lowercase words from the API response', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['Crane', 'Slate', 'Raise']),
      });

      const result = await fetchWords('en');
      expect(result).toEqual(['crane', 'slate', 'raise']);
    });

    it('lowercases words that are already lowercase', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['bread', 'stone']),
      });

      const result = await fetchWords('en');
      expect(result).toEqual(['bread', 'stone']);
    });

    it('lowercases words that are fully uppercase', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['CRANE', 'SLATE']),
      });

      const result = await fetchWords('en');
      expect(result).toEqual(['crane', 'slate']);
    });

    it('returns an empty array when the API returns no words', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => [],
      });

      const result = await fetchWords('en');
      expect(result).toEqual([]);
    });
  });

  describe('URL construction', () => {
    it('calls fetch with the correct base URL', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('en');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain(RANDOM_WORDS_API_URL);
    });

    it('includes the correct language query parameter', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('es');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('language=es');
    });

    it('includes language=en for English', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('en');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('language=en');
    });

    it('includes category=wordle', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('en');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain('category=wordle');
    });

    it('includes the correct word length', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('en');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain(`length=${WORD_LENGTH}`);
    });

    it('includes the correct word count', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('en');

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain(`words=${WORD_COUNT}`);
    });

    it('calls fetch exactly once per invocation', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords('en');

      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  describe('language codes', () => {
    const languages = ['en', 'es', 'da', 'lt'] as const;

    it.each(languages)('passes language code "%s" to the API', async (lang) => {
      mockFetch.mockResolvedValueOnce({
        json: async () => makeWordResponse(['crane']),
      });

      await fetchWords(lang);

      const calledUrl: string = mockFetch.mock.calls[0][0];
      expect(calledUrl).toContain(`language=${lang}`);
    });
  });

  describe('error handling', () => {
    it('propagates network errors', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      await expect(fetchWords('en')).rejects.toThrow('Network error');
    });

    it('propagates JSON parse errors', async () => {
      mockFetch.mockResolvedValueOnce({
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      });

      await expect(fetchWords('en')).rejects.toThrow('Unexpected token');
    });
  });
});
