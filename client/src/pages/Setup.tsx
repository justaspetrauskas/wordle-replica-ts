import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PageShell, TopBar } from '../components/Chrome';
import { Tooltip } from '../components/Tooltip';
import { useRoom } from '../hooks/useRoom';
import {
  CATEGORIES,
  LANGUAGES,
  getCategoryMeta,
  isCategoryAvailable,
  isCategoryId,
  resolveCategory,
  type PlayableLanguage,
} from '../data/categories';
import type { CategoryId } from '../types/game';
import { clearSavedRoom } from '../lib/room';
import { ROOM_CODE_LENGTH } from '../constants';

type PlayMode = 'solo' | 'together';
type TogetherTab = 'create' | 'join';

export function Setup() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const mode: PlayMode = params.get('mode') === 'together' ? 'together' : 'solo';
  const tab: TogetherTab = params.get('tab') === 'join' ? 'join' : 'create';

  const [language, setLanguage] = useState<PlayableLanguage>('en');
  const [category, setCategory] = useState<CategoryId>('animals');
  const [code, setCode] = useState('');
  const [localError, setLocalError] = useState('');
  // Only a room this screen deliberately created should redirect; the hook may
  // also resurface an earlier room in the background.
  const creating = useRef(false);

  const { roomId, status, error, createRoom } = useRoom('multiplayer');

  // Derived rather than synced: `category` is what the player picked, and this
  // is the nearest valid one for the current language (Misc is English-only).
  // Switching back to English therefore restores their original choice.
  const effectiveCategory = resolveCategory(category, language);
  const meta = useMemo(() => getCategoryMeta(effectiveCategory), [effectiveCategory]);

  useEffect(() => {
    if (creating.current && roomId && status === 'waiting') {
      navigate(`/room/${roomId}`);
    }
  }, [navigate, roomId, status]);

  const setMode = (next: PlayMode) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('mode', next);

    if (next === 'solo') nextParams.delete('tab');
    else if (!nextParams.get('tab')) nextParams.set('tab', 'create');

    setLocalError('');
    setParams(nextParams, { replace: true });
  };

  const setTab = (next: TogetherTab) => {
    const nextParams = new URLSearchParams(params);
    nextParams.set('mode', 'together');
    nextParams.set('tab', next);
    setLocalError('');
    setParams(nextParams, { replace: true });
  };

  const go = () => {
    if (mode === 'solo') {
      clearSavedRoom();
      navigate(`/play?lang=${language}&cat=${effectiveCategory}`);
      return;
    }

    if (tab === 'join') {
      const normalized = code.trim().toUpperCase();

      if (!normalized) {
        setLocalError('Enter a room code first.');
        return;
      }

      navigate(`/room/${normalized}`);
      return;
    }

    creating.current = true;
    createRoom(language, effectiveCategory);
  };

  const pill = (active: boolean, activeClass: string) =>
    `flex-1 rounded-full px-5 py-2 text-sm font-semibold transition sm:flex-none ${
      active ? activeClass : 'text-mute'
    }`;

  const shown = error || localError;

  return (
    <PageShell>
      <TopBar
        right={
          <Tooltip label="How to play">
            Guess a five-letter word in six tries. Olive is right, ochre is close, navy is out.
            Together: create a room or join one, then share the code in the top bar.
          </Tooltip>
        }
      />

      <div className="mt-8 max-w-2xl">
        <div className="flex items-start gap-2">
          <h1 className="font-display text-4xl leading-tight sm:text-5xl">WORDL</h1>
          <Tooltip label="About WORDL">
            A paper Wordle · ワードル. Choose Solo or Together, then a language and a category.
          </Tooltip>
        </div>
        <p className="mt-3 max-w-md text-sm leading-relaxed text-mute sm:text-base">
          Five letters, six rows. Set up a game here.
        </p>
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="inline-flex rounded-full border border-ink/15 p-1">
          <button type="button" onClick={() => setMode('solo')} className={pill(mode === 'solo', 'bg-navy text-washi')}>
            Solo
          </button>
          <button
            type="button"
            onClick={() => setMode('together')}
            className={pill(mode === 'together', 'bg-navy text-washi')}
          >
            Together
          </button>
        </div>

        {mode === 'together' && (
          <div className="inline-flex rounded-full border border-coral/50 bg-washi/60 p-1">
            <button type="button" onClick={() => setTab('create')} className={pill(tab === 'create', 'bg-coral-ink text-washi')}>
              Create
            </button>
            <button type="button" onClick={() => setTab('join')} className={pill(tab === 'join', 'bg-coral-ink text-washi')}>
              Join
            </button>
          </div>
        )}
      </div>

      <motion.div layout className="paper-card mt-8 overflow-hidden rounded-[28px]">
        {mode === 'together' && tab === 'join' && (
          <div className="px-5 py-5 sm:px-7">
            <label className="block max-w-md">
              <span className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-mute">
                Room code
                <Tooltip label="Room code help">
                  Ask the host for the six-character code shown in the centre of their top bar.
                </Tooltip>
              </span>
              <input
                value={code}
                onChange={(event) => {
                  setCode(
                    event.target.value
                      .toUpperCase()
                      .replace(/[^A-Z0-9]/g, '')
                      .slice(0, ROOM_CODE_LENGTH)
                  );
                  setLocalError('');
                }}
                placeholder="K7MPQ2"
                autoComplete="off"
                spellCheck={false}
                className="field font-accent text-3xl tracking-[0.28em]"
              />
            </label>
          </div>
        )}

        {(mode === 'solo' || tab === 'create') && (
          <div className={`grid ${meta.image ? 'lg:grid-cols-[1.05fr_0.95fr]' : ''}`}>
            {meta.image ? (
              <img src={meta.image} alt="" className="h-52 w-full object-cover sm:h-64 lg:h-full" />
            ) : null}
            <div className="p-5 sm:p-7">
              <p className="text-[11px] uppercase tracking-[0.22em] text-mute">{meta.kicker}</p>
              <h2 className="mt-1 font-display text-3xl">{meta.label[language]}</h2>
              <p className="mt-2 text-sm text-mute">{meta.note[language]}</p>

              <div className="mt-6">
                <p
                  className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-mute"
                  id="language-label"
                >
                  Language
                  <Tooltip label="Language help">
                    The hidden word and the keyboard both follow this language.
                  </Tooltip>
                </p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose language">
                  {LANGUAGES.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      role="radio"
                      aria-checked={language === option.id}
                      aria-label={option.name}
                      onClick={() => setLanguage(option.id)}
                      className={`rounded-full px-3 py-1.5 text-sm transition ${
                        language === option.id ? 'bg-navy text-washi' : 'border border-ink/15 text-ink'
                      }`}
                    >
                      {option.native}
                    </button>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <p className="inline-flex items-center gap-1 text-[11px] uppercase tracking-[0.22em] text-mute">
                  Category
                  <Tooltip label="Category help">
                    The word is drawn from this theme. Greyed categories are prepared but the word
                    source cannot serve them yet.
                  </Tooltip>
                </p>
                <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Choose category">
                  {CATEGORIES.map((option) => {
                    const available = isCategoryAvailable(option.id, language);

                    return (
                      <button
                        key={option.id}
                        type="button"
                        role="radio"
                        aria-checked={effectiveCategory === option.id}
                        aria-label={option.label[language]}
                        disabled={!available}
                        // The unavailable ones are disabled, but narrowing here
                        // keeps the state to what the server will accept.
                        onClick={() => isCategoryId(option.id) && setCategory(option.id)}
                        className={`rounded-full px-3 py-1.5 text-sm transition ${
                          !available
                            ? 'cursor-not-allowed border border-dashed border-ink/15 text-mute/60'
                            : effectiveCategory === option.id
                              ? 'bg-coral-ink text-washi'
                              : 'border border-ink/15 text-ink'
                        }`}
                      >
                        {option.label[language]}
                        {!available && <span className="ml-1 text-[10px] uppercase">soon</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {shown ? (
        <p className="mt-4 text-sm text-coral-ink" role="alert">
          {shown}
        </p>
      ) : null}

      <button
        type="button"
        onClick={go}
        disabled={status === 'pending'}
        className="mt-8 w-full rounded-2xl bg-coral-ink py-4 font-accent text-lg font-semibold text-washi transition hover:bg-navy disabled:opacity-60 sm:w-auto sm:px-10"
      >
        {status === 'pending'
          ? 'Creating room…'
          : mode === 'solo'
            ? 'Begin'
            : tab === 'create'
              ? 'Create room'
              : 'Enter room'}
      </button>
    </PageShell>
  );
}
