import { render } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SoloGame } from './SoloGame';
import { saveRoom } from '../lib/room';

const emit = vi.fn();
const handlers = new Map<string, (payload?: unknown) => void>();

vi.mock('../lib/socket', () => ({
  socket: {
    on: (event: string, handler: (payload?: unknown) => void) => {
      handlers.set(event, handler);
    },
    off: vi.fn(),
    emit: (...args: unknown[]) => emit(...args),
    // useRoom registers every listener before it connects, so running the
    // 'connect' handler here is enough to reach the resume/create decision.
    connect: () => handlers.get('connect')?.(),
    disconnect: vi.fn(),
  },
}));

function renderSolo(path = '/play?lang=en&cat=animals') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/play" element={<SoloGame />} />
        <Route path="/" element={<div>setup screen</div>} />
      </Routes>
    </MemoryRouter>
  );
}

const emitted = (event: string) =>
  emit.mock.calls.filter(([name]) => name === event);

beforeEach(() => {
  emit.mockClear();
  handlers.clear();
  localStorage.clear();
});

describe('SoloGame', () => {
  describe('arriving with no room saved', () => {
    it('creates a room from the query string', () => {
      renderSolo('/play?lang=en&cat=countries');

      expect(emit).toHaveBeenCalledWith(
        'create_room',
        expect.objectContaining({
          language: 'en',
          category: 'countries',
          mode: 'solo',
        })
      );
    });

    it('creates only one room', () => {
      renderSolo();

      expect(emitted('create_room')).toHaveLength(1);
    });

    it('ignores a category the chosen language cannot serve', () => {
      // Misc is English-only, so the server would refuse this pairing.
      renderSolo('/play?lang=es&cat=misc');

      expect(emitted('create_room')).toHaveLength(0);
    });
  });

  describe('arriving with a room saved', () => {
    it('resumes it instead of dealing a new word', () => {
      saveRoom('K7MPQ2', 'solo');
      renderSolo();

      // This is what a refresh mid-round relies on.
      expect(emit).toHaveBeenCalledWith(
        'reconnect_room',
        expect.objectContaining({ roomId: 'K7MPQ2' })
      );
      expect(emitted('create_room')).toHaveLength(0);
    });

    it('does not resume a multiplayer room', () => {
      saveRoom('K7MPQ2', 'multiplayer');
      renderSolo();

      expect(emitted('reconnect_room')).toHaveLength(0);
      expect(emitted('create_room')).toHaveLength(1);
    });
  });
});
