import { initTheme } from "../game-ui-kit/theme.js";

const boardEl = document.getElementById("board");
const modeSelector = document.getElementById("mode-selector");
const aiLevelSelector = document.getElementById("ai-level");
const newGameBtn = document.getElementById("new-game-btn");
const swapFirstBtn = document.getElementById("swap-first-btn");
const statusEl = document.getElementById("status");
const scoreXEl = document.getElementById("score-x");
const scoreDrawEl = document.getElementById("score-draw");
const scoreOEl = document.getElementById("score-o");

const WIN_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

let board = Array(9).fill("");
let currentPlayer = "X";
let gameOver = false;
let firstPlayer = "X";
let scores = { X: 0, O: 0, draw: 0 };

function renderBoard(winningLine = []) {
  boardEl.innerHTML = "";
  board.forEach((value, index) => {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "cell";
    if (winningLine.includes(index)) {
      cell.classList.add("win");
    }
    cell.setAttribute("aria-label", `Cell ${index + 1}`);
    cell.textContent = value;
    cell.addEventListener("click", () => onCellClick(index));
    boardEl.appendChild(cell);
  });
}

function setStatus(message) {
  statusEl.textContent = message;
}

function updateScores() {
  scoreXEl.textContent = String(scores.X);
  scoreOEl.textContent = String(scores.O);
  scoreDrawEl.textContent = String(scores.draw);
}

function getWinner(currentBoard) {
  for (const line of WIN_LINES) {
    const [a, b, c] = line;
    if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[b] === currentBoard[c]) {
      return { player: currentBoard[a], line };
    }
  }
  return null;
}

function isDraw(currentBoard) {
  return currentBoard.every((cell) => cell !== "");
}

function availableMoves(currentBoard) {
  return currentBoard.map((cell, index) => (cell === "" ? index : -1)).filter((index) => index >= 0);
}

function getAiMove() {
  const level = aiLevelSelector.value;
  if (level === "easy") {
    const moves = availableMoves(board);
    return moves[Math.floor(Math.random() * moves.length)];
  }

  if (level === "medium") {
    return getSmartMove(board, "O") ?? getSmartMove(board, "X") ?? availableMoves(board)[0];
  }

  return minimaxMove(board, "O").index;
}

function getSmartMove(currentBoard, player) {
  for (const move of availableMoves(currentBoard)) {
    const copy = [...currentBoard];
    copy[move] = player;
    if (getWinner(copy)?.player === player) {
      return move;
    }
  }
  return null;
}

function minimaxMove(currentBoard, player) {
  const winner = getWinner(currentBoard);
  if (winner?.player === "O") return { score: 10 };
  if (winner?.player === "X") return { score: -10 };
  if (isDraw(currentBoard)) return { score: 0 };

  const moves = [];
  for (const move of availableMoves(currentBoard)) {
    const nextBoard = [...currentBoard];
    nextBoard[move] = player;
    const result = minimaxMove(nextBoard, player === "O" ? "X" : "O");
    moves.push({ index: move, score: result.score });
  }

  if (player === "O") {
    return moves.reduce((best, move) => (move.score > best.score ? move : best));
  }
  return moves.reduce((best, move) => (move.score < best.score ? move : best));
}

function finalizeTurn() {
  const winner = getWinner(board);
  if (winner) {
    gameOver = true;
    scores[winner.player] += 1;
    updateScores();
    renderBoard(winner.line);
    setStatus(`${winner.player} wins.`);
    return;
  }

  if (isDraw(board)) {
    gameOver = true;
    scores.draw += 1;
    updateScores();
    setStatus("Draw.");
    return;
  }

  currentPlayer = currentPlayer === "X" ? "O" : "X";
  setStatus(`${currentPlayer} turn.`);

  if (modeSelector.value === "ai" && currentPlayer === "O") {
    window.setTimeout(() => {
      if (!gameOver) {
        const aiMove = getAiMove();
        if (typeof aiMove === "number") {
          board[aiMove] = "O";
          renderBoard();
          finalizeTurn();
        }
      }
    }, 220);
  }
}

function onCellClick(index) {
  if (gameOver || board[index] !== "") return;
  if (modeSelector.value === "ai" && currentPlayer === "O") return;

  board[index] = currentPlayer;
  renderBoard();
  finalizeTurn();
}

function startGame() {
  board = Array(9).fill("");
  gameOver = false;
  currentPlayer = firstPlayer;
  renderBoard();
  setStatus(`${currentPlayer} turn.`);

  if (modeSelector.value === "ai" && currentPlayer === "O") {
    const aiMove = getAiMove();
    board[aiMove] = "O";
    renderBoard();
    finalizeTurn();
  }
}

newGameBtn.addEventListener("click", startGame);
swapFirstBtn.addEventListener("click", () => {
  firstPlayer = firstPlayer === "X" ? "O" : "X";
  startGame();
});
modeSelector.addEventListener("change", startGame);
aiLevelSelector.addEventListener("change", () => {
  if (modeSelector.value === "ai") {
    startGame();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "n" || event.key === "N") startGame();
});

initTheme("theme-selector", "ttt-theme");
updateScores();
startGame();
