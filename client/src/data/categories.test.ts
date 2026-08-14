import {
  CATEGORIES,
  categoriesFor,
  isCategoryAvailable,
  isCategoryId,
  isPlayableLanguage,
  resolveCategory,
} from './categories';

describe('playable languages', () => {
  it('accepts only the languages with generated word sets', () => {
    expect(isPlayableLanguage('en')).toBe(true);
    expect(isPlayableLanguage('es')).toBe(true);
  });

  it('rejects the languages with no word set', () => {
    expect(isPlayableLanguage('da')).toBe(false);
    expect(isPlayableLanguage('lt')).toBe(false);
    expect(isPlayableLanguage('')).toBe(false);
    expect(isPlayableLanguage(undefined)).toBe(false);
  });
});

describe('isCategoryId', () => {
  it('accepts the categories the server will take', () => {
    expect(isCategoryId('misc')).toBe(true);
    expect(isCategoryId('animals')).toBe(true);
    expect(isCategoryId('countries')).toBe(true);
    expect(isCategoryId('food')).toBe(true);
  });

  it('rejects categories that are only displayed', () => {
    // These appear in the picker as "soon" but must never reach create_room.
    expect(isCategoryId('birds')).toBe(false);
    expect(isCategoryId('science')).toBe(false);
    expect(isCategoryId('history')).toBe(false);
  });
});

describe('per-language availability', () => {
  it('offers the general pool in English only', () => {
    expect(isCategoryAvailable('misc', 'en')).toBe(true);
    // No Spanish set was generated for the general pool.
    expect(isCategoryAvailable('misc', 'es')).toBe(false);
  });

  it('offers the themed lists in both languages', () => {
    for (const language of ['en', 'es'] as const) {
      expect(isCategoryAvailable('animals', language)).toBe(true);
      expect(isCategoryAvailable('countries', language)).toBe(true);
      expect(isCategoryAvailable('food', language)).toBe(true);
    }
  });

  it('offers nothing that has no generated word set', () => {
    for (const language of ['en', 'es'] as const) {
      for (const id of ['birds', 'science', 'history'] as const) {
        expect(isCategoryAvailable(id, language)).toBe(false);
      }
    }
  });

  it('lists four categories for English and three for Spanish', () => {
    expect(categoriesFor('en').map((entry) => entry.id)).toEqual([
      'misc',
      'animals',
      'countries',
      'food',
    ]);
    expect(categoriesFor('es').map((entry) => entry.id)).toEqual([
      'animals',
      'countries',
      'food',
    ]);
  });
});

describe('resolveCategory', () => {
  it('keeps a category that works in the chosen language', () => {
    expect(resolveCategory('countries', 'es')).toBe('countries');
    expect(resolveCategory('misc', 'en')).toBe('misc');
  });

  it('falls back when the category is not served in that language', () => {
    expect(resolveCategory('misc', 'es')).toBe('animals');
  });

  it('never resolves to a display-only category', () => {
    expect(isCategoryId(resolveCategory('food', 'en'))).toBe(true);
    expect(isCategoryId(resolveCategory('history', 'es'))).toBe(true);
  });

  it('always returns something the server would accept', () => {
    for (const language of ['en', 'es'] as const) {
      for (const category of CATEGORIES) {
        const resolved = resolveCategory(category.id, language);

        expect(isCategoryId(resolved)).toBe(true);
        expect(isCategoryAvailable(resolved, language)).toBe(true);
      }
    }
  });
});

describe('category metadata', () => {
  it('gives artwork to every playable category except food, which is still waiting on it', () => {
    for (const category of CATEGORIES) {
      if (category.availableIn.length === 0) continue;

      if (category.id === 'food') expect(category.image).toBeFalsy();
      else expect(category.image).toBeTruthy();
    }
  });

  it('labels every category in both languages', () => {
    for (const category of CATEGORIES) {
      expect(category.label.en).toBeTruthy();
      expect(category.label.es).toBeTruthy();
    }
  });
});
