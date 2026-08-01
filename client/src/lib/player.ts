import { customAlphabet } from 'nanoid'

// consider back end authentication later
const generatePlayerId = customAlphabet(
  '0123456789abcdefghijklmnopqrstuvwxyz',
  16
);

const PLAYER_ID_KEY = 'test-wordle-player-id';

export function getPlayerId(): string {
  const existingId = localStorage.getItem(PLAYER_ID_KEY)

  if (existingId) {
    return existingId
  }

  const playerId = generatePlayerId();

  localStorage.setItem(PLAYER_ID_KEY, playerId)

  return playerId
}