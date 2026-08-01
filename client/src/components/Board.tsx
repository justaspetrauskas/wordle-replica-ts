import type { SubmittedGuess } from '../types/game';
import { MAX_GUESSES } from '../constants';
import { Line } from './Line';

interface BoardProps {
  guesses: SubmittedGuess[];
  currentGuess: string[];
}

export function Board({ guesses, currentGuess }: BoardProps) {
  return (
    <div className="board">
      {Array.from({ length: MAX_GUESSES }, (_, index) => {
        const submitted = guesses[index];

        if (submitted) {
          return <Line key={index} word={submitted.word} states={submitted.states} />;
        }

        const isCurrentRow = index === guesses.length;

        return (
          <Line
            key={index}
            word={isCurrentRow ? currentGuess.join('') : ''}
            states={null}
          />
        );
      })}
    </div>
  );
}
