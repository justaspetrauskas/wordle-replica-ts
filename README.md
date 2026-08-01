
Architecture

                    React
                      │
                  useGame()
                      │
          ┌───────────┼───────────┐
          │           │           │
    currentGuess   guesses   opponentRows
          │           │           │
          ▼           ▼           ▼
      keyboard      Board    OpponentBoard
          │
          │ Enter
          ▼
   socket.emit("submit_guess")
          │
          ▼
       Backend
          │
          ├── validate
          ├── getLetterStates()
          ├── save guess
          ├── determine win/loss
          │
          ├──────────────► guess_result
          │                    │
          │                    ▼
          │               Your board
          │
          └──────────────► opponent_progress
                               │
                               ▼
                         Opponent board