import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Setup } from './Setup';

const emit = vi.fn();

// useRoom opens a socket on mount; the setup screen only needs it for creating
// a room, so the transport is stubbed out.
vi.mock('../lib/socket', () => ({
  socket: {
    on: vi.fn(),
    off: vi.fn(),
    emit: (...args: unknown[]) => emit(...args),
    connect: vi.fn(),
    disconnect: vi.fn(),
  },
}));

/** Renders Setup and exposes wherever it navigated to. */
function renderSetup(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Routes>
        <Route path="/" element={<Setup />} />
        <Route path="/play" element={<div>solo game</div>} />
        <Route path="/room/:code" element={<div>room screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const category = (name: string) =>
  screen.getByRole('radio', { name });

beforeEach(() => {
  emit.mockClear();
  localStorage.clear();
});

describe('Setup', () => {
  describe('language choices', () => {
    it('offers only the languages the word API serves', () => {
      renderSetup();

      expect(screen.getByRole('radio', { name: 'English' })).toBeInTheDocument();
      expect(screen.getByRole('radio', { name: 'Spanish' })).toBeInTheDocument();
    });

    it('does not offer languages the API answers with null', () => {
      renderSetup();

      expect(screen.queryByRole('radio', { name: 'Danish' })).not.toBeInTheDocument();
      expect(screen.queryByRole('radio', { name: 'Lithuanian' })).not.toBeInTheDocument();
    });

    it('marks the selected language with aria-checked', async () => {
      const user = userEvent.setup();
      renderSetup();

      expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute(
        'aria-checked',
        'true'
      );

      await user.click(screen.getByRole('radio', { name: 'Spanish' }));

      expect(screen.getByRole('radio', { name: 'Spanish' })).toHaveAttribute(
        'aria-checked',
        'true'
      );
      expect(screen.getByRole('radio', { name: 'English' })).toHaveAttribute(
        'aria-checked',
        'false'
      );
    });
  });

  describe('category availability', () => {
    it('enables the three English categories', () => {
      renderSetup();

      expect(category('Misc')).toBeEnabled();
      expect(category('Animals')).toBeEnabled();
      expect(category('Countries')).toBeEnabled();
    });

    it('disables the categories the API cannot serve', () => {
      renderSetup();

      for (const name of ['Food', 'Birds', 'Science', 'History']) {
        expect(category(name)).toBeDisabled();
      }
    });

    it('disables Misc once Spanish is chosen', async () => {
      const user = userEvent.setup();
      renderSetup();

      expect(category('Misc')).toBeEnabled();

      await user.click(screen.getByRole('radio', { name: 'Spanish' }));

      // Labels localise, so the Spanish name is what is on screen now.
      expect(category('Varios')).toBeDisabled();
      expect(category('Animales')).toBeEnabled();
    });

    it('restores the original pick when the language changes back', async () => {
      const user = userEvent.setup();
      renderSetup();

      await user.click(category('Misc'));
      expect(category('Misc')).toHaveAttribute('aria-checked', 'true');

      await user.click(screen.getByRole('radio', { name: 'Spanish' }));
      // Misc is unavailable here, so it falls back rather than staying invalid.
      expect(category('Animales')).toHaveAttribute('aria-checked', 'true');

      await user.click(screen.getByRole('radio', { name: 'English' }));
      expect(category('Misc')).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('starting a solo game', () => {
    it('carries the choices to the play screen in the URL', async () => {
      const user = userEvent.setup();
      renderSetup();

      await user.click(category('Countries'));
      await user.click(screen.getByRole('button', { name: 'Begin' }));

      expect(screen.getByText('solo game')).toBeInTheDocument();
    });

    it('does not create the room from this screen', async () => {
      const user = userEvent.setup();
      renderSetup();

      await user.click(screen.getByRole('button', { name: 'Begin' }));

      // Solo rooms are created by the play screen, from the query string.
      expect(emit).not.toHaveBeenCalledWith('create_room', expect.anything());
    });
  });

  describe('together mode', () => {
    it('creates a room with the chosen language and category', async () => {
      const user = userEvent.setup();
      renderSetup('/?mode=together&tab=create');

      await user.click(category('Countries'));
      await user.click(screen.getByRole('button', { name: 'Create room' }));

      expect(emit).toHaveBeenCalledWith(
        'create_room',
        expect.objectContaining({
          language: 'en',
          category: 'countries',
          mode: 'multiplayer',
        })
      );
    });

    it('never sends a category the chosen language cannot serve', async () => {
      const user = userEvent.setup();
      renderSetup('/?mode=together&tab=create');

      await user.click(category('Misc'));
      await user.click(screen.getByRole('radio', { name: 'Spanish' }));
      await user.click(screen.getByRole('button', { name: 'Create room' }));

      expect(emit).toHaveBeenCalledWith(
        'create_room',
        expect.objectContaining({ language: 'es', category: 'animals' })
      );
    });

    it('refuses to enter a room without a code', async () => {
      const user = userEvent.setup();
      renderSetup('/?mode=together&tab=join');

      await user.click(screen.getByRole('button', { name: 'Enter room' }));

      expect(screen.getByRole('alert')).toHaveTextContent('Enter a room code first.');
      expect(screen.queryByText('room screen')).not.toBeInTheDocument();
    });

    it('goes to the room screen for a typed code', async () => {
      const user = userEvent.setup();
      renderSetup('/?mode=together&tab=join');

      await user.type(screen.getByRole('textbox'), 'sq8bu4');
      await user.click(screen.getByRole('button', { name: 'Enter room' }));

      expect(screen.getByText('room screen')).toBeInTheDocument();
    });

    it('keeps the code to the characters a room code can contain', async () => {
      const user = userEvent.setup();
      renderSetup('/?mode=together&tab=join');

      const input = screen.getByRole('textbox');
      await user.type(input, 'ab-3!x9zzzz');

      expect(input).toHaveValue('AB3X9Z');
    });
  });
});
