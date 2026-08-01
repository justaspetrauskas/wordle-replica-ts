import { useCallback, useEffect, useState } from 'react';
import type { LanguageCode, RoomMode, RoomStatus } from '../types/game';
import { socket } from '../lib/socket';
import { getPlayerId } from '../lib/player';

/**
 * Owns the connection and the room lifecycle (create / join / wait). Solo games
 * are rooms too, so the server stays the single source of truth in both modes.
 */
export function useRoom() {
  const [roomId, setRoomId] = useState<string>('');
  const [status, setStatus] = useState<RoomStatus>('idle');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const handleRoomCreated = ({ roomId: createdRoomId }: { roomId: string }) => {
      setRoomId(createdRoomId);
      setStatus('waiting');
    };

    const handleRoomError = ({ message }: { message: string }) => {
      setRoomId('');
      setStatus('idle');
      setError(message);
    };

    const handleGameStarted = () => {
      setError('');
      setStatus('playing');
    };

    const handleConnectError = () => {
      setStatus('idle');
      setError('Could not reach the game server.');
    };

    socket.on('room_created', handleRoomCreated);
    socket.on('room_error', handleRoomError);
    socket.on('game_started', handleGameStarted);
    socket.on('connect_error', handleConnectError);
    socket.connect();

    return () => {
      socket.off('room_created', handleRoomCreated);
      socket.off('room_error', handleRoomError);
      socket.off('game_started', handleGameStarted);
      socket.off('connect_error', handleConnectError);
      socket.disconnect();
    };
  }, []);

  const createRoom = useCallback((language: LanguageCode, mode: RoomMode) => {
    setError('');
    setStatus('pending');
    socket.emit('create_room', { language, mode, playerId: getPlayerId() });
  }, []);

  const joinRoom = useCallback((code: string) => {
    const normalizedCode = code.trim().toUpperCase();

    if (!normalizedCode) {
      setError('Enter a room code first.');
      return;
    }

    setError('');
    setRoomId(normalizedCode);
    setStatus('pending');
    socket.emit('join_room', { roomId: normalizedCode, playerId: getPlayerId() });
  }, []);

  return { roomId, status, error, createRoom, joinRoom };
}
