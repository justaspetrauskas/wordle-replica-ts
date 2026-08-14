import { useCallback, useEffect, useRef } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { PageShell, SetupSummary, TopBar } from '../components/Chrome';
import { PlaySurface } from '../components/PlaySurface';
import { useRoom } from '../hooks/useRoom';
import {
  isCategoryAvailable,
  isCategoryId,
  isPlayableLanguage,
  type PlayableLanguage,
} from '../data/categories';
import type { CategoryId } from '../types/game';

export function SoloGame() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const {
    roomId,
    status,
    error,
    language,
    category,
    restored,
    restoreCount,
    createRoom,
  } = useRoom('solo');

  const rawLanguage = params.get('lang');
  const rawCategory = params.get('cat');
  const wanted: PlayableLanguage | null = isPlayableLanguage(rawLanguage) ? rawLanguage : null;
  const wantedCategory: CategoryId | null = isCategoryId(rawCategory) ? rawCategory : null;

  // The URL carries the setup choices, so a room is created once on arrival
  // rather than being handed down as navigation state.
  const requested = useRef(false);

  const start = useCallback(() => {
    if (!wanted || !wantedCategory) return;
    if (!isCategoryAvailable(wantedCategory, wanted)) return;

    createRoom(wanted, wantedCategory);
  }, [createRoom, wanted, wantedCategory]);

  useEffect(() => {
    if (requested.current) return;
    // A saved room is resumed by the hook; only a bare arrival creates one.
    if (roomId) return;
    if (!wanted || !wantedCategory) return;

    requested.current = true;
    start();
  }, [roomId, start, wanted, wantedCategory]);

  const playAgain = () => {
    navigate(`/?mode=solo`);
  };

  if (roomId && (status === 'playing' || status === 'finished')) {
    return (
      <PlaySurface
        key={`${roomId}:${restoreCount}`}
        roomId={roomId}
        mode="solo"
        language={language}
        category={category}
        restored={restored}
        backTo="/?mode=solo"
        headerCenter={
          <span className="font-accent text-xs uppercase tracking-[0.18em] text-mute">Solo</span>
        }
        headerRight={<SetupSummary mode="solo" language={language} category={category} />}
        footer={() => (
          <button
            type="button"
            onClick={playAgain}
            className="font-accent font-semibold text-coral-ink underline underline-offset-4"
          >
            New game
          </button>
        )}
      />
    );
  }

  return (
    <PageShell>
      <TopBar backTo="/?mode=solo" />
      <p className="mt-16 font-display text-3xl">
        {status === 'pending' ? 'Dealing a word…' : 'No solo game in progress.'}
      </p>
      {error ? (
        <p className="mt-3 text-sm text-coral-ink" role="alert">
          {error}
        </p>
      ) : null}
      <Link
        to="/?mode=solo"
        className="mt-4 inline-block font-accent text-coral-ink underline underline-offset-4"
      >
        Set one up
      </Link>
    </PageShell>
  );
}
