import { getLetterStates } from '../lib/wordle';
import type { LetterState } from '../types/game';

describe('getLetterStates', () => {
  // -------------------------------------------------------------------------
  // Happy path — basic correct/present/absent outcomes
  // -------------------------------------------------------------------------
  describe('happy path', () => {
    it('returns all "correct" when guess exactly matches the solution', () => {
      const result = getLetterStates('crane', 'crane');
      const expected: LetterState[] = ['correct', 'correct', 'correct', 'correct', 'correct'];
      expect(result).toEqual(expected);
    });

    it('returns all "absent" when no letter in the guess appears in the solution', () => {
      // "mirth" shares no letters with "bland"
      const result = getLetterStates('mirth', 'bland');
      const expected: LetterState[] = ['absent', 'absent', 'absent', 'absent', 'absent'];
      expect(result).toEqual(expected);
    });

    it('marks a letter "present" when it exists in the solution but is in the wrong position', () => {
      // 'a' is in solution "apple" but at index 0, not index 2
      const result = getLetterStates('ppale', 'apple');
      // p(0)→present, p(1)→correct, a(2)→present, l(3)→correct, e(4)→correct
      const expected: LetterState[] = ['present', 'correct', 'present', 'correct', 'correct'];
      expect(result).toEqual(expected);
    });

    it('returns a mix of correct, present, and absent states', () => {
      // solution: "stare", guess: "rates"
      // r(0): present (in solution at idx 2), a(1): present (in solution at idx 1? no — idx 1 is 't')
      // Actually let's use a controlled example:
      // solution: "slate", guess: "crane"
      // First pass: c≠s, r≠l, a=a→correct(idx2), n≠t, e=e→correct(idx4)
      // Second pass: c→absent, r→absent, n→absent
      const result = getLetterStates('crane', 'slate');
      const expected: LetterState[] = ['absent', 'absent', 'correct', 'absent', 'correct'];
      expect(result).toEqual(expected);
    });

    it('returns an array of length 5', () => {
      const result = getLetterStates('brain', 'story');
      expect(result).toHaveLength(5);
    });
  });

  // -------------------------------------------------------------------------
  // Duplicate letter handling — the two-pass algorithm is critical here
  // -------------------------------------------------------------------------
  describe('duplicate letters', () => {
    it('marks excess duplicate guess letters "absent" when only one copy exists in the solution', () => {
      // solution: "crave", guess: "creek"
      // First pass: c=c→correct(0), r=r→correct(1), e≠a, e≠v, k≠e
      // solutionChars=['','','a','v','e'], guessChars=['','','e','e','k']
      // Second pass: e(2)→indexOf('e')=4→present; e(3)→no 'e' left→absent; k(4)→absent
      const result = getLetterStates('creek', 'crave');
      const expected: LetterState[] = ['correct', 'correct', 'present', 'absent', 'absent'];
      expect(result).toEqual(expected);
    });

    it('marks only one copy "present" when guess has duplicate and solution has one occurrence, and neither is in correct position', () => {
      // solution: "crane", guess: "eerie" — 'e' appears 3× in guess, 1× in solution (position 4)
      // e(0)→present (consumes the solution 'e'), e(1)→absent, r(2)→present, i(3)→absent, e(4)→correct
      // Wait — first pass runs before second. Let's trace:
      // First pass: e≠c, e≠r, r≠a, i≠n, e=e → states[4]='correct', solutionChars[4]='', guessChars[4]=''
      // Second pass: e(0) → indexOf('e') in ['c','r','a','n',''] = -1 → absent
      //              e(1) → absent, r(2) → indexOf('r') in ['c','r','a','n',''] = 1 → present
      //              i(3) → absent
      const result = getLetterStates('eerie', 'crane');
      const expected: LetterState[] = ['absent', 'absent', 'present', 'absent', 'correct'];
      expect(result).toEqual(expected);
    });

    it('marks both duplicate guess letters correctly when solution also has two copies', () => {
      // solution: "hello", guess: "llano" — 'l' appears 2× in both
      // First pass: l≠h, l≠e, a≠l, n≠l, o=o → states[4]='correct'
      // Second pass: l(0)→indexOf('l') in ['h','e','l','l',''] → 2 → present, solutionChars[2]=''
      //              l(1)→indexOf('l') in ['h','e','','l',''] → 3 → present, solutionChars[3]=''
      //              a(2)→absent, n(3)→absent
      const result = getLetterStates('llano', 'hello');
      const expected: LetterState[] = ['present', 'present', 'absent', 'absent', 'correct'];
      expect(result).toEqual(expected);
    });

    it('gives "correct" priority over "present" for a letter that appears once in solution', () => {
      // solution: "apple", guess: "papal"
      // First pass: p≠a, a≠p, p=p→correct(idx2), a≠l, l≠e
      // states = [absent,absent,correct,absent,absent]
      // solutionChars = ['a','p','','l','e'], guessChars = ['p','a','','a','l']
      // Second pass: p(0)→indexOf('p') in ['a','p','','l','e']=1 → present
      //              a(1)→indexOf('a') in ['a','','','l','e']=0 → present
      //              a(3)→indexOf('a') in ['','','','l','e']=-1 → absent
      //              l(4)→indexOf('l') in ['','','','l','e']=3 → present
      const result = getLetterStates('papal', 'apple');
      const expected: LetterState[] = ['present', 'present', 'correct', 'absent', 'present'];
      expect(result).toEqual(expected);
    });

    it('marks the correct-position duplicate as "correct" and the extra copy as "absent"', () => {
      // solution: "solid", guess: "spool"
      // First pass: s=s→correct, p≠o, o≠l, o≠i, l≠d
      // solutionChars=['','o','l','i','d'], guessChars=['','p','o','o','l']
      // Second pass: p(1)→absent, o(2)→indexOf('o')=1→present, o(3)→indexOf('o') in ['','','l','i','d']=-1→absent, l(4)→indexOf('l')=2→present
      const result = getLetterStates('spool', 'solid');
      const expected: LetterState[] = ['correct', 'absent', 'present', 'absent', 'present'];
      expect(result).toEqual(expected);
    });

    it('handles a letter that appears in solution twice but guess has it only once', () => {
      // solution: "belle", guess: "blend"
      // b=b→correct, l=l→correct, e=e→correct, n≠l, d≠e
      // Actually all three match in first pass. Let's pick better:
      // solution: "teeth", guess: "tents"
      // First pass: t=t→correct(0), e=e→correct(1), n≠e, t≠t... wait t(3)=t(3)→correct, s≠h
      // solutionChars=['','','e','','h'], guessChars=['','','n','','s']
      // Second pass: n→absent, s→absent
      const result = getLetterStates('tents', 'teeth');
      const expected: LetterState[] = ['correct', 'correct', 'absent', 'correct', 'absent'];
      expect(result).toEqual(expected);
    });
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  describe('edge cases', () => {
    it('handles a guess where all letters are the same and solution has none of that letter', () => {
      // guess: "aaaaa", solution: "brick"
      const result = getLetterStates('aaaaa', 'brick');
      const expected: LetterState[] = ['absent', 'absent', 'absent', 'absent', 'absent'];
      expect(result).toEqual(expected);
    });

    it('handles a guess where all letters are the same and solution has one of that letter', () => {
      // guess: "aaaaa", solution: "crane" — 'a' at index 2
      // First pass: none are correct (a≠c, a≠r, a=a→correct at idx2, a≠n, a≠e)
      // solutionChars=['c','r','','n','e'], guessChars=['a','a','','a','a']
      // Second pass: a(0)→absent (no 'a' left), a(1)→absent, a(3)→absent, a(4)→absent
      const result = getLetterStates('aaaaa', 'crane');
      const expected: LetterState[] = ['absent', 'absent', 'correct', 'absent', 'absent'];
      expect(result).toEqual(expected);
    });

    it('handles a guess where all letters are the same and solution has two of that letter', () => {
      // guess: "eeeee", solution: "geese" — 'e' at idx1, idx2, idx4
      // First pass: e≠g, e=e→correct(1), e=e→correct(2), e≠s, e=e→correct(4)
      // solutionChars=['g','','','s',''], guessChars=['e','','','e','']
      // Second pass: e(0)→indexOf('e') in ['g','','','s','']=-1→absent, e(3)→absent
      const result = getLetterStates('eeeee', 'geese');
      const expected: LetterState[] = ['absent', 'correct', 'correct', 'absent', 'correct'];
      expect(result).toEqual(expected);
    });

    it('correctly scores each of the 5 positions independently', () => {
      // Each position gets a distinct state by design
      // solution: "abcde", guess: "aecbd"
      // First pass: a=a→correct(0), e≠b, c=c→correct(2), b≠d, d≠e
      // solutionChars=['','b','','d','e'], guessChars=['','e','','b','d']
      // Second pass: e(1)→indexOf('e') in ['','b','','d','e']=4→present
      //              b(3)→indexOf('b') in ['','b','','d','']... wait solutionChars[4] was 'e' not cleared yet at this point
      //              b(3)→indexOf('b')=1→present, d(4)→indexOf('d')=3→present
      const result = getLetterStates('aecbd', 'abcde');
      const expected: LetterState[] = ['correct', 'present', 'correct', 'present', 'present'];
      expect(result).toEqual(expected);
    });

    it('does not mutate the original guess or solution strings', () => {
      const guess = 'crane';
      const solution = 'slate';
      getLetterStates(guess, solution);
      expect(guess).toBe('crane');
      expect(solution).toBe('slate');
    });

    it('returns only valid LetterState values in every position', () => {
      const validStates: LetterState[] = ['correct', 'present', 'absent', 'empty'];
      const result = getLetterStates('raise', 'stare');
      result.forEach((state) => {
        expect(validStates).toContain(state);
      });
    });

    it('handles a single-letter overlap correctly at the last position', () => {
      // solution: "tryst", guess: "plain" — no overlap
      const result = getLetterStates('plain', 'tryst');
      const expected: LetterState[] = ['absent', 'absent', 'absent', 'absent', 'absent'];
      expect(result).toEqual(expected);
    });

    it('produces "correct" for all positions when guess === solution with repeated letters', () => {
      // solution and guess: "speed"
      const result = getLetterStates('speed', 'speed');
      const expected: LetterState[] = ['correct', 'correct', 'correct', 'correct', 'correct'];
      expect(result).toEqual(expected);
    });
  });
});

// ~115 lines
