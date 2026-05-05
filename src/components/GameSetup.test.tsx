import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GameSetup } from './GameSetup';
import type { LanguageCode } from '../types/game';
import { LANGUAGE_OPTIONS } from '../constants';

describe('GameSetup', () => {
  const onSelectLanguage = vi.fn();
  const onStart = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ---------------------------------------------------------------------------
  // Rendering
  // ---------------------------------------------------------------------------

  describe('initial render', () => {
    it('renders the heading "Choose game language"', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      expect(screen.getByRole('heading', { name: 'Choose game language' })).toBeInTheDocument();
    });

    it('renders a radiogroup with aria-label "Choose language"', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      expect(
        screen.getByRole('radiogroup', { name: 'Choose language' })
      ).toBeInTheDocument();
    });

    it('renders all 4 language buttons', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      const radios = screen.getAllByRole('radio');
      expect(radios).toHaveLength(LANGUAGE_OPTIONS.length);
    });

    it('renders each language button with correct aria-label', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      for (const option of LANGUAGE_OPTIONS) {
        expect(screen.getByRole('radio', { name: option.label })).toBeInTheDocument();
      }
    });

    it('renders the "Start game" button', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      expect(screen.getByRole('button', { name: 'Start game' })).toBeInTheDocument();
    });
  });

  // ---------------------------------------------------------------------------
  // Start button disabled / enabled state
  // ---------------------------------------------------------------------------

  describe('Start button disabled state', () => {
    it('is disabled when no language is selected', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      expect(screen.getByRole('button', { name: 'Start game' })).toBeDisabled();
    });

    it.each(LANGUAGE_OPTIONS)(
      'is enabled when "$label" language is selected',
      ({ value }) => {
        render(
          <GameSetup
            selectedLanguage={value as LanguageCode}
            onSelectLanguage={onSelectLanguage}
            onStart={onStart}
          />
        );

        expect(screen.getByRole('button', { name: 'Start game' })).toBeEnabled();
      }
    );
  });

  // ---------------------------------------------------------------------------
  // aria-checked state
  // ---------------------------------------------------------------------------

  describe('aria-checked on language buttons', () => {
    it('marks the selected language button as aria-checked="true"', () => {
      render(
        <GameSetup
          selectedLanguage="en"
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
    });

    it('marks all non-selected language buttons as aria-checked="false"', () => {
      render(
        <GameSetup
          selectedLanguage="en"
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      const nonSelected = LANGUAGE_OPTIONS.filter((o) => o.value !== 'en');
      for (const option of nonSelected) {
        expect(screen.getByRole('radio', { name: option.label })).toHaveAttribute(
          'aria-checked',
          'false'
        );
      }
    });

    it('marks all buttons as aria-checked="false" when no language is selected', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      for (const option of LANGUAGE_OPTIONS) {
        expect(screen.getByRole('radio', { name: option.label })).toHaveAttribute(
          'aria-checked',
          'false'
        );
      }
    });
  });

  // ---------------------------------------------------------------------------
  // Interactions — onSelectLanguage
  // ---------------------------------------------------------------------------

  describe('onSelectLanguage callback', () => {
    it.each(LANGUAGE_OPTIONS)(
      'calls onSelectLanguage with "$value" when the "$label" button is clicked',
      async ({ value, label }) => {
        const user = userEvent.setup();

        render(
          <GameSetup
            selectedLanguage=""
            onSelectLanguage={onSelectLanguage}
            onStart={onStart}
          />
        );

        await user.click(screen.getByRole('radio', { name: label }));

        expect(onSelectLanguage).toHaveBeenCalledOnce();
        expect(onSelectLanguage).toHaveBeenCalledWith(value);
      }
    );

    it('does not call onStart when a language button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      await user.click(screen.getByRole('radio', { name: 'English' }));

      expect(onStart).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Interactions — onStart
  // ---------------------------------------------------------------------------

  describe('onStart callback', () => {
    it('calls onStart when Start button is clicked with a language selected', async () => {
      const user = userEvent.setup();

      render(
        <GameSetup
          selectedLanguage="es"
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Start game' }));

      expect(onStart).toHaveBeenCalledOnce();
    });

    it('does not call onStart when Start button is clicked while disabled', async () => {
      const user = userEvent.setup();

      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Start game' }));

      expect(onStart).not.toHaveBeenCalled();
    });

    it('does not call onSelectLanguage when Start button is clicked', async () => {
      const user = userEvent.setup();

      render(
        <GameSetup
          selectedLanguage="da"
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      await user.click(screen.getByRole('button', { name: 'Start game' }));

      expect(onSelectLanguage).not.toHaveBeenCalled();
    });
  });

  // ---------------------------------------------------------------------------
  // Active CSS class
  // ---------------------------------------------------------------------------

  describe('active language CSS class', () => {
    it('applies "language-flag--active" class to the selected language button', () => {
      render(
        <GameSetup
          selectedLanguage="lt"
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      expect(screen.getByRole('radio', { name: 'Lithuanian' })).toHaveClass(
        'language-flag--active'
      );
    });

    it('does not apply "language-flag--active" class to non-selected buttons', () => {
      render(
        <GameSetup
          selectedLanguage="lt"
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      const nonSelected = LANGUAGE_OPTIONS.filter((o) => o.value !== 'lt');
      for (const option of nonSelected) {
        expect(screen.getByRole('radio', { name: option.label })).not.toHaveClass(
          'language-flag--active'
        );
      }
    });

    it('does not apply "language-flag--active" to any button when nothing is selected', () => {
      render(
        <GameSetup
          selectedLanguage=""
          onSelectLanguage={onSelectLanguage}
          onStart={onStart}
        />
      );

      for (const option of LANGUAGE_OPTIONS) {
        expect(screen.getByRole('radio', { name: option.label })).not.toHaveClass(
          'language-flag--active'
        );
      }
    });
  });
});

// ~220 lines
