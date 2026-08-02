import { useCallback, useEffect, useState } from 'react';
import type {
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
 */
export function useRoom(mode: RoomMode) {
  const [roomId, setRoomId] = useState<string>(
    () => {
      const saved = getSavedRoom();

      return saved?.mode === mode ? saved.roomId : '';
    }
  );
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [error, setError] = useState<string>('');
  const [language, setLanguage] = useState<LanguageCode>('en');
  // <Game> only mounts once status becomes 'playing', which happens *because*
  // of room_reconnected — so a listener inside useGame would be registered too
  // late to ever see it. The payload is held here and passed down instead.
  const [restored, setRestored] = useState<RoomReconnectedPayload | null>(null);
  // Bumped on every restore so callers can remount <Game> and reseed its state.
  const [restoreCount, setRestoreCount] = useState<number>(0);

  useEffect(() => {
    const handleConnect = () => {
      const saved = getSavedRoom();

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
      setRestored(payload);
      setRestoreCount((count) => count + 1);
      setError('');
      setStatus(payload.roomStatus);
    };

    const handleRoomError = ({ message }: { message: string }) => {
      // The saved code is stale (rooms live in server memory), so drop it
      // instead of retrying it on every reconnect.
      clearSavedRoom();
      setRoomId('');
      setStatus('idle');
      setRestored(null);
      setError(message);
    };

    const handleGameStarted = ({ language: roomLanguage }: { language: LanguageCode }) => {
      setError('');
      setLanguage(roomLanguage);
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
  }, [mode]);

  const createRoom = useCallback(
    (language: LanguageCode) => {
      setError('');
      setStatus('pending');

      socket.emit('create_room', {
        language,
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
    restored,
    restoreCount,
    createRoom,
    joinRoom,
    leaveRoom,
  };
}
