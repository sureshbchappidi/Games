# Sudoku Reasoning Lab

A browser-based Sudoku application that can:

- Generate a new Sudoku puzzle with difficulty levels (`easy`, `medium`, `hard`)
- Let the user solve directly on the grid
- Keep puzzles with a unique solution
- Explain solving steps using human-readable logic

## How to Run

1. Open `games/sudoku/index.html` in your browser.
2. Choose a difficulty.
3. Click **New Puzzle**.
4. Enter your own numbers in editable cells.
5. Use **Mode: Value / Mode: Notes** to switch between entering final values and writing pencil notes.
6. Click **Show Candidates** to display auto-calculated possible values in small text inside empty cells.
7. Click **Check Progress** to find conflicts.
8. Click **Hint Next Step** for one explained move, or **Explain & Solve** for full explanation.

## Solving Explanation Strategy

The app explains each move with one of these methods:

- **Naked Single**: a cell has exactly one candidate.
- **Hidden Single**: within a row, column, or 3x3 box, a value fits in only one position.

Each step includes:

- method used
- value placed
- location (`R#C#`)
- reason text

## Notes

- Puzzle generation enforces uniqueness.
- The explainer starts with logic techniques and can continue with guided guesses when needed, while still describing each step.

## Multi-Game Hub

- Game Hub: `games/hub/index.html`
- Sudoku: `games/sudoku/index.html`
- Tic-Tac-Toe: `games/tictactoe/index.html`
- Nonogram: `games/nonogram/index.html`
