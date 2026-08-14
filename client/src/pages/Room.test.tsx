import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { Room } from './Room';
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
    connect: () => handlers.get('connect')?.(),
    disconnect: vi.fn(),
  },
}));

const ROOM_ID = 'K7MPQ2';

function renderRoom() {
  const view = render(
    <MemoryRouter initialEntries={[`/room/${ROOM_ID}`]}>
      <Routes>
        <Route path="/room/:code" element={<Room />} />
        <Route path="/" element={<div>setup screen</div>} />
      </Routes>
    </MemoryRouter>
  );

  act(() => {
    handlers.get('game_started')?.({ language: 'en', category: 'animals' });
  });

  return view;
}

const emitted = (event: string) =>
  emit.mock.calls.filter(([name]) => name === event);

beforeEach(() => {
  emit.mockClear();
  handlers.clear();
  localStorage.clear();
});

describe('Room', () => {
  describe('leaving', () => {
    it('tells the server, so the other player is not left waiting', async () => {
      const user = userEvent.setup();
      renderRoom();

      await user.click(screen.getByRole('button', { name: 'Leave' }));

      expect(emit).toHaveBeenCalledWith('leave_room', { roomId: ROOM_ID });
    });

    it('returns to setup and stops resuming the room', async () => {
      const user = userEvent.setup();
      saveRoom(ROOM_ID, 'multiplayer');
      renderRoom();

      await user.click(screen.getByRole('button', { name: 'Leave' }));

      expect(screen.getByText('setup screen')).toBeInTheDocument();
      expect(localStorage.getItem('wordl_room_id')).toBeNull();
    });
  });

  describe('an opponent who leaves', () => {
    it('says so where their board was', () => {
      renderRoom();

      act(() => handlers.get('player_left')?.());

      expect(
        screen.getByText('Left the game. Finish the word on your own.')
      ).toBeInTheDocument();
    });

    it('keeps saying so after the next guess clears the passing notice', () => {
      renderRoom();

      act(() => handlers.get('player_left')?.());
      act(() => {
        handlers.get('guess_result')?.({
          guesses: [{ word: 'crane', states: ['absent', 'absent', 'absent', 'absent', 'absent'] }],
          status: 'playing',
        });
      });

      expect(screen.queryByText('Your opponent left the game.')).not.toBeInTheDocument();
      expect(
        screen.getByText('Left the game. Finish the word on your own.')
      ).toBeInTheDocument();
    });

    it('says so in the compact strip the narrow layout uses', () => {
      renderRoom();

      act(() => handlers.get('player_left')?.());

      expect(screen.getByText('Left the game')).toBeInTheDocument();
    });

    it('is not announced while the room is still waiting', () => {
      render(
        <MemoryRouter initialEntries={[`/room/${ROOM_ID}`]}>
          <Routes>
            <Route path="/room/:code" element={<Room />} />
          </Routes>
        </MemoryRouter>
      );

      act(() => {
        handlers.get('room_reconnected')?.({
          roomId: ROOM_ID,
          language: 'en',
          category: 'animals',
          guesses: [],
          status: 'playing',
          helpUsage: { revealLetter: false, suggestWord: false, flashSolution: false },
          opponentRows: [],
          opponentStatus: null,
          roomStatus: 'waiting',
          solution: null,
        });
      });

      expect(screen.getByText(/Share the code above to start/)).toBeInTheDocument();
      expect(screen.queryByText('Left the game')).not.toBeInTheDocument();
      expect(emitted('leave_room')).toHaveLength(0);
    });
  });

  describe('the compact strip', () => {
    it('carries both scores, since there is no side column to read them from', () => {
      renderRoom();

      act(() => {
        handlers.get('opponent_progress')?.({
          rows: [['absent', 'absent', 'correct', 'present', 'absent']],
          status: 'playing',
        });
      });

      expect(screen.getByText('1/6 · you 0/6')).toBeInTheDocument();
    });

    it('stays out of the way until a second player arrives', () => {
      render(
        <MemoryRouter initialEntries={[`/room/${ROOM_ID}`]}>
          <Routes>
            <Route path="/room/:code" element={<Room />} />
          </Routes>
        </MemoryRouter>
      );

      act(() => {
        handlers.get('room_reconnected')?.({
          roomId: ROOM_ID,
          language: 'en',
          category: 'animals',
          guesses: [],
          status: 'playing',
          helpUsage: { revealLetter: false, suggestWord: false, flashSolution: false },
          opponentRows: [],
          opponentStatus: null,
          roomStatus: 'waiting',
          solution: null,
        });
      });

      expect(screen.queryByText(/· you \d\/6/)).not.toBeInTheDocument();
    });
  });
});
