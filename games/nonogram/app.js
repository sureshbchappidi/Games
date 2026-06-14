import { initTheme } from "../game-ui-kit/theme.js";

const rootEl = document.getElementById("nonogram-root");
const sizeSelector = document.getElementById("size-selector");
const puzzleSelector = document.getElementById("puzzle-selector");
const modeSelector = document.getElementById("paint-mode");
const newBtn = document.getElementById("new-btn");
const clearBtn = document.getElementById("clear-btn");
const hintBtn = document.getElementById("hint-btn");
const checkBtn = document.getElementById("check-btn");
const statusEl = document.getElementById("status");

const PUZZLES = {
  5: [
    {
      name: "Plus",
      grid: [
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0],
        [1, 1, 1, 1, 1],
        [0, 0, 1, 0, 0],
        [0, 0, 1, 0, 0]
      ]
    },
    {
      name: "Heart",
      grid: [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ]
    }
  ],
  10: [
    {
      name: "Diamond",
      grid: [
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 0, 0, 1, 1, 0, 0, 0, 0]
      ]
    },
    {
      name: "Smiley",
      grid: [
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
        [1, 1, 0, 1, 0, 0, 1, 0, 1, 1],
        [1, 0, 0, 1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 0, 0, 0, 0, 1, 0, 1],
        [1, 1, 0, 1, 1, 1, 1, 0, 1, 1],
        [0, 1, 1, 0, 0, 0, 0, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    }
  ]
};

let activePuzzle = null;
let size = 5;
let playerGrid = [];
let hintCell = null;

function setStatus(message) {
  statusEl.textContent = message;
}

function cloneGrid(grid) {
  return grid.map((row) => [...row]);
}

function emptyGrid(n) {
  return Array.from({ length: n }, () => Array(n).fill(0));
}

function getLineClues(line) {
  const clues = [];
  let run = 0;
  for (const value of line) {
    if (value === 1) {
      run += 1;
    } else if (run > 0) {
      clues.push(run);
      run = 0;
    }
  }
  if (run > 0) clues.push(run);
  return clues.length > 0 ? clues : [0];
}

function getColumn(grid, col) {
  return grid.map((row) => row[col]);
}

function rowClues(grid) {
  return grid.map((row) => getLineClues(row));
}

function colClues(grid) {
  return grid[0].map((_, col) => getLineClues(getColumn(grid, col)));
}

function populatePuzzleSelector() {
  const list = PUZZLES[size];
  puzzleSelector.innerHTML = "";
  list.forEach((puzzle, idx) => {
    const option = document.createElement("option");
    option.value = String(idx);
    option.textContent = puzzle.name;
    puzzleSelector.appendChild(option);
  });
}

function startPuzzle() {
  const idx = Number(puzzleSelector.value) || 0;
  activePuzzle = cloneGrid(PUZZLES[size][idx].grid);
  playerGrid = emptyGrid(size);
  hintCell = null;
  render();
  setStatus("Puzzle ready.");
}

function clearGrid() {
  playerGrid = emptyGrid(size);
  hintCell = null;
  render();
  setStatus("Grid cleared.");
}

function applyCell(row, col, intent) {
  hintCell = null;
  if (intent === "fill") playerGrid[row][col] = 1;
  if (intent === "mark") playerGrid[row][col] = 2;
  if (intent === "erase") playerGrid[row][col] = 0;
  render();
}

function checkSolved() {
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const expected = activePuzzle[r][c];
      const actual = playerGrid[r][c] === 1 ? 1 : 0;
      if (expected !== actual) return false;
    }
  }
  return true;
}

function findHintCell() {
  const options = [];
  for (let r = 0; r < size; r += 1) {
    for (let c = 0; c < size; c += 1) {
      const expected = activePuzzle[r][c];
      const actual = playerGrid[r][c] === 1 ? 1 : 0;
      if (expected !== actual) options.push([r, c]);
    }
  }
  if (options.length === 0) return null;
  return options[Math.floor(Math.random() * options.length)];
}

function hint() {
  const pick = findHintCell();
  if (!pick) {
    setStatus("No hint needed. Puzzle is solved.");
    return;
  }
  hintCell = { row: pick[0], col: pick[1] };
  render();
  setStatus("Hint highlighted.");
}

function render() {
  if (!activePuzzle) return;

  rootEl.innerHTML = "";
  const rows = rowClues(activePuzzle);
  const cols = colClues(activePuzzle);
  const maxTop = Math.max(...cols.map((v) => v.length));
  const maxLeft = Math.max(...rows.map((v) => v.length));

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = `repeat(${maxLeft}, minmax(16px, 1fr)) repeat(${size}, minmax(26px, 1fr))`;
  wrapper.style.gap = "2px";

  for (let tr = 0; tr < maxTop; tr += 1) {
    for (let lc = 0; lc < maxLeft; lc += 1) {
      const pad = document.createElement("div");
      wrapper.appendChild(pad);
    }
    for (let c = 0; c < size; c += 1) {
      const cell = document.createElement("div");
      cell.className = "top-clue";
      const clueLine = cols[c];
      const clueIdx = tr - (maxTop - clueLine.length);
      cell.textContent = clueIdx >= 0 ? String(clueLine[clueIdx]) : "";
      wrapper.appendChild(cell);
    }
  }

  for (let r = 0; r < size; r += 1) {
    const rowLine = rows[r];
    for (let lc = 0; lc < maxLeft; lc += 1) {
      const clueCell = document.createElement("div");
      clueCell.className = "left-clue";
      const clueIdx = lc - (maxLeft - rowLine.length);
      clueCell.textContent = clueIdx >= 0 ? String(rowLine[clueIdx]) : "";
      wrapper.appendChild(clueCell);
    }

    for (let c = 0; c < size; c += 1) {
      const cell = document.createElement("button");
      cell.type = "button";
      cell.className = "cell";
      cell.dataset.row = String(r);
      cell.dataset.col = String(c);
      cell.setAttribute("aria-label", `Cell ${r + 1},${c + 1}`);

      if (playerGrid[r][c] === 1) cell.classList.add("filled");
      if (playerGrid[r][c] === 2) cell.classList.add("marked");
      if (hintCell && hintCell.row === r && hintCell.col === c) cell.classList.add("hint");

      cell.addEventListener("click", () => applyCell(r, c, modeSelector.value));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        applyCell(r, c, "mark");
      });
      wrapper.appendChild(cell);
    }
  }

  rootEl.appendChild(wrapper);
}

sizeSelector.addEventListener("change", () => {
  size = Number(sizeSelector.value);
  populatePuzzleSelector();
  startPuzzle();
});

puzzleSelector.addEventListener("change", startPuzzle);
newBtn.addEventListener("click", startPuzzle);
clearBtn.addEventListener("click", clearGrid);
hintBtn.addEventListener("click", hint);
checkBtn.addEventListener("click", () => {
  if (checkSolved()) {
    setStatus("Great work. Puzzle solved.");
  } else {
    setStatus("Not solved yet.");
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "1") modeSelector.value = "fill";
  if (event.key === "2") modeSelector.value = "mark";
  if (event.key === "0") modeSelector.value = "erase";
});

initTheme("theme-selector", "nonogram-theme");
populatePuzzleSelector();
startPuzzle();
