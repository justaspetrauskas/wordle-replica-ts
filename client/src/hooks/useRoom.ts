import { useCallback, useEffect, useRef, useState } from 'react';
import type {
  CategoryId,
  LanguageCode,
  RoomMode,
  RoomReconnectedPayload,
  RoomStatus,
} from '../types/game';
import { socket } from '../lib/socket';
import { getPlayerId } from '../lib/player';
import { clearSavedRoom, getSavedRoom, saveRoom } from '../lib/room';

/**
 * Owns the connection and the room the player belongs to. `mode` scopes the
 * hook to one kind of room: a saved room is only resumed by the screen that
 * created it.
 *
 * `targetRoomId` is the code from a `/room/:code` URL. It takes priority over
 * the saved room, which is what makes a room link shareable.
 */
export function useRoom(mode: RoomMode, targetRoomId?: string) {
  const [roomId, setRoomId] = useState<string>(
    () => {
      if (targetRoomId) return targetRoomId;

      const saved = getSavedRoom();

      return saved?.mode === mode ? saved.roomId : '';
    }
  );
  // A failed reconnect falls back to joining, but only once — otherwise a room
  // that is genuinely gone would loop between the two.
  const triedJoin = useRef<boolean>(false);
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [category, setCategory] = useState<CategoryId>('misc');
  // <Game> only mounts once status becomes 'playing', which happens *because*
  // of room_reconnected — so a listener inside useGame would be registered too
  // late to ever see it. The payload is held here and passed down instead.
  const [restored, setRestored] = useState<RoomReconnectedPayload | null>(null);
  // Bumped on every restore so callers can remount <Game> and reseed its state.
  const [restoreCount, setRestoreCount] = useState<number>(0);

  useEffect(() => {
    const handleConnect = () => {
      const saved = getSavedRoom();

      if (targetRoomId) {
        // Reconnecting and joining are different requests, and the server
        // rejects a second join from a player already seated. Whether this
        // player has been here before is what decides which one to send.
        const isReturning = saved?.roomId === targetRoomId && saved.mode === mode;

        socket.emit(isReturning ? 'reconnect_room' : 'join_room', {
          roomId: targetRoomId,
          playerId: getPlayerId(),
        });

        return;
      }

      // Someone else's room (a solo screen must not resume a multiplayer game).
      if (!saved || saved.mode !== mode) return;

      socket.emit('reconnect_room', {
        roomId: saved.roomId,
        playerId: getPlayerId(),
      });
    };

    const handleRoomCreated = ({ roomId: createdRoomId }: { roomId: string }) => {
      saveRoom(createdRoomId, mode);
      setRoomId(createdRoomId);
      setStatus('waiting');
      // A fresh room must not inherit an earlier room's restored board.
      setRestored(null);
    };

    const handleRoomReconnected = (payload: RoomReconnectedPayload) => {
      saveRoom(payload.roomId, mode);
      setRoomId(payload.roomId);
      setLanguage(payload.language);
      setCategory(payload.category);
      setRestored(payload);
      setRestoreCount((count) => count + 1);
      setError('');
      setStatus(payload.roomStatus);
    };

    const handleRoomError = ({ message }: { message: string }) => {
      // The saved code is stale (rooms live in server memory), so drop it
      // instead of retrying it on every reconnect.
      clearSavedRoom();

      // Arriving on a room link with a stale save for the same code: the
      // reconnect was refused, but joining as a newcomer may still work.
      if (targetRoomId && !triedJoin.current) {
        triedJoin.current = true;

        socket.emit('join_room', {
          roomId: targetRoomId,
          playerId: getPlayerId(),
        });

        return;
      }

      setRoomId('');
      setStatus('idle');
      setRestored(null);
      setError(message);
    };

    const handleGameStarted = ({
      language: roomLanguage,
      category: roomCategory,
    }: { language: LanguageCode; category: CategoryId }) => {
      // A player who arrived on a room link has not saved it yet; without this
      // a refresh would try to join a room they are already sitting in.
      if (targetRoomId) saveRoom(targetRoomId, mode);

      setError('');
      setLanguage(roomLanguage);
      setCategory(roomCategory);
      setStatus('playing');
      setRestored(null);
    };

    const handleGameOver = () => {
      setStatus('finished');
    };

    const handleConnectError = () => {
      setStatus('idle');
      setError('Could not reach the game server.');
    };

    socket.on('connect', handleConnect);
    socket.on('room_created', handleRoomCreated);
    socket.on('room_reconnected', handleRoomReconnected);
    socket.on('room_error', handleRoomError);
    socket.on('game_started', handleGameStarted);
    socket.on('game_over', handleGameOver);
    socket.on('connect_error', handleConnectError);

    socket.connect();

    return () => {
      socket.off('connect', handleConnect);
      socket.off('room_created', handleRoomCreated);
      socket.off('room_reconnected', handleRoomReconnected);
      socket.off('room_error', handleRoomError);
      socket.off('game_started', handleGameStarted);
      socket.off('game_over', handleGameOver);
      socket.off('connect_error', handleConnectError);

      socket.disconnect();
    };
  }, [mode, targetRoomId]);

  const createRoom = useCallback(
    (language: LanguageCode, category: CategoryId) => {
      setError('');
      setStatus('pending');

      socket.emit('create_room', {
        language,
        category,
        mode,
        playerId: getPlayerId(),
      });
    },
    [mode]
  );

  const joinRoom = useCallback(
    (code: string) => {
      const normalizedCode = code.trim().toUpperCase();

      if (!normalizedCode) {
        setError('Enter a room code first.');
        return;
      }

      saveRoom(normalizedCode, mode);

      setError('');
      setRoomId(normalizedCode);
      setStatus('pending');

      socket.emit('join_room', {
        roomId: normalizedCode,
        playerId: getPlayerId(),
      });
    },
    [mode]
  );

  /** Give up the current room so a refresh no longer resumes it. */
  const leaveRoom = useCallback(() => {
    clearSavedRoom();
    setRoomId('');
    setStatus('idle');
    setError('');
    setRestored(null);
  }, []);

  return {
    roomId,
    status,
    error,
    language,
    category,
    restored,
    restoreCount,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
