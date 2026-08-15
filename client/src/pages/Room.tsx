import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MiniBoard } from '../components/Board';
import { PageShell, RoomCode, SetupSummary, TopBar } from '../components/Chrome';
import { PlaySurface } from '../components/PlaySurface';
import { useRoom } from '../hooks/useRoom';

export function Room() {
  const { code = '' } = useParams();
  const navigate = useNavigate();
  const normalized = code.toUpperCase();
  const [copied, setCopied] = useState(false);

  const {
    roomId,
    status,
    error,
    language,
    category,
    restored,
    restoreCount,
    seatTaken,
    wantsRematch,
    opponentWantsRematch,
    requestRematch,
    leaveRoom,
  } = useRoom('multiplayer', normalized);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomId || normalized);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — the code is on screen anyway */
    }
  };

  const leave = () => {
    leaveRoom();
    navigate('/?mode=together');
  };

  // The room is fine here — this browser just has it open twice. Nothing is
  // cleared, so the tab that holds the seat carries on undisturbed.
  if (seatTaken) {
    return (
      <PageShell>
        <TopBar backTo="/?mode=together" />
        <p className="mt-16 font-display text-3xl">Already open in another tab.</p>
        <p className="mt-3 max-w-md text-sm text-mute" role="alert">
          {error} Switch back to it to keep playing — closing this tab changes nothing.
        </p>
        <Link
          to="/?mode=together"
          className="mt-4 inline-block font-accent text-coral-ink underline underline-offset-4"
        >
          Back to setup
        </Link>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell>
        <TopBar backTo="/?mode=together" />
        <p className="mt-16 font-display text-3xl">This room is gone.</p>
        <p className="mt-3 text-sm text-mute" role="alert">
          {error}
        </p>
        <Link
          to="/?mode=together"
          className="mt-4 inline-block font-accent text-coral-ink underline underline-offset-4"
        >
          Back to setup
        </Link>
      </PageShell>
    );
  }

  if (!roomId || status === 'idle' || status === 'pending') {
    return (
      <PageShell>
        <TopBar backTo="/?mode=together" />
        <p className="mt-16 font-display text-xl text-mute">Opening the room…</p>
      </PageShell>
    );
  }

  const waiting = status === 'waiting';

  return (
    <PlaySurface
      key={`${roomId}:${restoreCount}`}
      roomId={roomId}
      mode="multiplayer"
      language={language}
      category={category}
      restored={restored}
      waiting={waiting}
      backTo="/?mode=together"
      headerCenter={<RoomCode code={roomId} copied={copied} onCopy={copyCode} />}
      headerRight={
        <div className="flex items-center gap-2 sm:gap-3">
          <SetupSummary mode="together" language={language} category={category} />
          <button
            type="button"
            onClick={leave}
            className="shrink-0 rounded-full border border-ink/20 bg-washi/80 px-2.5 py-1 text-[11px] uppercase tracking-[0.14em] text-ink transition hover:border-coral-ink hover:text-coral-ink"
          >
            Leave
          </button>
        </div>
      }
      footer={({ opponentLeft }) =>
        opponentLeft ? (
          <Link
            to="/?mode=together"
            className="font-accent font-semibold text-coral-ink underline underline-offset-4"
          >
            New room
          </Link>
        ) : (
          <>
            <button
              type="button"
              onClick={requestRematch}
              disabled={wantsRematch}
              className="font-accent font-semibold text-coral-ink underline underline-offset-4 disabled:no-underline disabled:opacity-60"
            >
              {wantsRematch ? 'Waiting for your opponent…' : 'Play again'}
            </button>
            {opponentWantsRematch && !wantsRematch ? (
              <p className="mt-1 text-xs text-mute">Your opponent wants another round.</p>
            ) : null}
          </>
        )
      }
      sideNote={({ opponentRows, opponentLeft, guessCount }) =>
        waiting ? null : (
          <div className="mt-4 flex items-center justify-center gap-3 lg:hidden">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Opponent</p>
              {opponentLeft ? (
                <p className="mt-0.5 text-xs text-coral-ink">Left the game</p>
              ) : (
                <p className="mt-0.5 text-xs text-mute">
                  {opponentRows.length}/6 · you {guessCount}/6
                </p>
              )}
            </div>
            <MiniBoard rows={opponentRows} compact />
          </div>
        )
      }
      aside={({ opponentRows, opponentLeft, guessCount }) => (
        <>
          <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Room</p>
          <p className="mt-2 font-accent text-lg font-semibold tracking-[0.2em]">{roomId}</p>
          <p className="mt-1 text-xs text-mute">You · {guessCount}/6</p>

          <div className="mt-8">
            <p className="text-[11px] uppercase tracking-[0.18em] text-mute">Opponent</p>
            {waiting ? (
              <p className="mt-3 text-sm text-mute">
                Share the code above to start. Their board appears here.
              </p>
            ) : (
              <>
                {opponentLeft ? (
                  <p className="mt-2 text-sm text-coral-ink">
                    Left the game. Finish the word on your own.
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-mute">{opponentRows.length}/6</p>
                )}
                <div className="mt-3">
                  {/* Colours only — the server never sends their letters. */}
                  <MiniBoard rows={opponentRows} />
                </div>
              </>
            )}
          </div>
        </>
      )}
    />
  );
}
