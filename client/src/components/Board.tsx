import type { GameStatus } from '../types/game';
import { Line } from './Line';

interface BoardProps {
  guesses: (string | null)[];
  currentGuess: string[];
  currentGuessIndex: number;
  gameStatus: GameStatus;
  solution: string;
}

export function Board({ guesses, currentGuess, currentGuessIndex, gameStatus, solution }: BoardProps) {
  return (
    <div className="board">
      {guesses.map((guess, index) => (
        <Line
          key={index}
          guess={index === currentGuessIndex && gameStatus === 'playing' ? currentGuess.join('') : guess}
          solution={solution}
          isCommitted={guess !== null && (index < currentGuessIndex || gameStatus === 'ended')}
        />
      ))}
    </div>
  );
}
