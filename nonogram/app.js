const rootEl = document.getElementById("nonogram-root");
const sizeSelector = document.getElementById("size-selector");
const modeCheckbox = document.getElementById("mode-checkbox");
const modeLabelFill = document.getElementById("mode-label-fill");
const modeLabelMark = document.getElementById("mode-label-mark");
const eraseBtn = document.getElementById("erase-btn");
const newBtn = document.getElementById("new-btn");
const clearBtn = document.getElementById("clear-btn");
const hintBtn = document.getElementById("hint-btn");
const checkBtn = document.getElementById("check-btn");
const statusEl = document.getElementById("status");
const completionModal = document.getElementById("completion-modal");
const completionNewBtn = document.getElementById("completion-new-btn");
const completionCloseBtn = document.getElementById("completion-close-btn");

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
    },
    {
      name: "House",
      grid: [
        [0, 0, 1, 0, 0],
        [0, 1, 1, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 0, 0, 0, 1],
        [1, 1, 1, 1, 1]
      ]
    },
    {
      name: "Flag",
      grid: [
        [1, 1, 1, 1, 0],
        [1, 0, 0, 1, 0],
        [1, 1, 1, 1, 0],
        [1, 0, 0, 0, 0],
        [1, 0, 0, 0, 0]
      ]
    },
    {
      name: "Star",
      grid: [
        [0, 0, 1, 0, 0],
        [1, 0, 1, 0, 1],
        [0, 1, 1, 1, 0],
        [1, 0, 1, 0, 1],
        [0, 0, 1, 0, 0]
      ]
    }
  ],
  6: [
    {
      name: "Diamond",
      grid: [
        [0, 0, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 0, 0]
      ]
    },
    {
      name: "Cross",
      grid: [
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0],
        [1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1],
        [0, 0, 1, 1, 0, 0],
        [0, 0, 1, 1, 0, 0]
      ]
    }
  ],
  7: [
    {
      name: "Pyramid",
      grid: [
        [0, 0, 0, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ]
    },
    {
      name: "Square",
      grid: [
        [1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 1, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1]
      ]
    }
  ],
  8: [
    {
      name: "Circle",
      grid: [
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 0, 0]
      ]
    },
    {
      name: "Wave",
      grid: [
        [1, 1, 1, 0, 0, 0, 0, 0],
        [1, 1, 1, 1, 0, 0, 0, 0],
        [0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0],
        [0, 0, 0, 0, 1, 1, 1, 1],
        [0, 0, 0, 0, 0, 1, 1, 1],
        [0, 0, 0, 0, 0, 0, 1, 1]
      ]
    }
  ],
  9: [
    {
      name: "Spiral",
      grid: [
        [1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 0, 1, 0, 1, 0, 1],
        [1, 0, 1, 0, 0, 0, 1, 0, 1],
        [1, 0, 1, 1, 1, 1, 1, 0, 1],
        [1, 0, 0, 0, 0, 0, 0, 0, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1]
      ]
    },
    {
      name: "Target",
      grid: [
        [0, 0, 1, 1, 1, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 0, 0, 1, 0, 0, 1, 1],
        [1, 1, 0, 0, 0, 0, 0, 1, 1],
        [1, 1, 1, 0, 0, 0, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0]
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
    },
    {
      name: "Ship",
      grid: [
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 1, 0, 0, 0],
        [0, 0, 1, 1, 0, 0, 1, 1, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        [0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
        [0, 0, 1, 0, 1, 1, 0, 1, 0, 0],
        [0, 0, 0, 1, 0, 0, 1, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    },
    {
      name: "Tree",
      grid: [
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 1, 1, 1, 1, 1, 0, 0, 0],
        [0, 1, 1, 1, 1, 1, 1, 1, 0, 0],
        [0, 0, 0, 1, 1, 1, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      ]
    }
  ]
};

let activePuzzle = null;
let size = 5;
let playerGrid = [];
let hintCell = null;
let currentMode = "fill";
let previousMode = "fill";
let isEraseMode = false;
let isDragging = false;

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

function startPuzzle() {
  const list = PUZZLES[size];
  const idx = Math.floor(Math.random() * list.length);
  activePuzzle = cloneGrid(list[idx].grid);
  playerGrid = emptyGrid(size);
  hintCell = null;
  render();
  setStatus(`${list[idx].name} puzzle ready.`);
}

function clearGrid() {
  playerGrid = emptyGrid(size);
  hintCell = null;
  render();
  setStatus("Grid cleared.");
}

function autoMarkLine(lineIdx, isRow) {
  const line = isRow ? playerGrid[lineIdx] : getColumn(playerGrid, lineIdx);
  const expected = isRow ? activePuzzle[lineIdx] : getColumn(activePuzzle, lineIdx);

  let filledCount = 0;
  let expectedCount = 0;

  for (let i = 0; i < size; i++) {
    if (expected[i] === 1) expectedCount++;
    if (line[i] === 1) filledCount++;
  }

  if (filledCount === expectedCount && expectedCount > 0) {
    for (let i = 0; i < size; i++) {
      if (isRow) {
        if (playerGrid[lineIdx][i] === 0) playerGrid[lineIdx][i] = 2;
      } else {
        if (playerGrid[i][lineIdx] === 0) playerGrid[i][lineIdx] = 2;
      }
    }
  }
}

function applyCell(row, col, mode) {
  hintCell = null;
  if (mode === "fill") playerGrid[row][col] = 1;
  if (mode === "mark") playerGrid[row][col] = 2;
  if (mode === "erase") playerGrid[row][col] = 0;

  if (mode === "fill") {
    autoMarkLine(row, true);
    autoMarkLine(col, false);
  }

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

  const cellSize = "min(36px, 7vw)";
  const clueSize = cellSize;

  const wrapper = document.createElement("div");
  wrapper.style.display = "grid";
  wrapper.style.gridTemplateColumns = `repeat(${maxLeft}, ${clueSize}) repeat(${size}, ${cellSize})`;
  wrapper.style.gap = "0";

  // Top clue area
  for (let tr = 0; tr < maxTop; tr += 1) {
    // Top-left corner
    for (let lc = 0; lc < maxLeft; lc += 1) {
      const corner = document.createElement("div");
      corner.className = "clue-corner";
      wrapper.appendChild(corner);
    }
    // Top clues (column clues)
    for (let c = 0; c < size; c += 1) {
      const clueCell = document.createElement("div");
      clueCell.className = "clue-cell clue-top";
      const clueLine = cols[c];
      const clueIdx = tr - (maxTop - clueLine.length);
      clueCell.textContent = clueIdx >= 0 ? String(clueLine[clueIdx]) : "";
      wrapper.appendChild(clueCell);
    }
  }

  // Game rows
  for (let r = 0; r < size; r += 1) {
    const rowLine = rows[r];
    // Left clues (row clues)
    for (let lc = 0; lc < maxLeft; lc += 1) {
      const clueCell = document.createElement("div");
      clueCell.className = "clue-cell clue-left";
      const clueIdx = lc - (maxLeft - rowLine.length);
      clueCell.textContent = clueIdx >= 0 ? String(rowLine[clueIdx]) : "";
      wrapper.appendChild(clueCell);
    }

    // Game cells
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
      if (c === size - 1) cell.classList.add("last-col");
      if (r === size - 1) cell.classList.add("last-row");

      cell.addEventListener("click", () => applyCell(r, c, currentMode));
      cell.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        applyCell(r, c, "mark");
      });
      cell.addEventListener("mouseenter", () => {
        if (isDragging) {
          applyCell(r, c, currentMode);
        }
      });
      wrapper.appendChild(cell);
    }
  }

  rootEl.appendChild(wrapper);
}

sizeSelector.addEventListener("change", () => {
  size = Number(sizeSelector.value);
  startPuzzle();
});

modeCheckbox.addEventListener("change", () => {
  if (isEraseMode) return;
  previousMode = currentMode;
  currentMode = modeCheckbox.checked ? "mark" : "fill";
});

eraseBtn.addEventListener("click", () => {
  if (isEraseMode) {
    isEraseMode = false;
    currentMode = previousMode;
    modeCheckbox.checked = previousMode === "mark";
    modeCheckbox.disabled = false;
    eraseBtn.classList.remove("active");
  } else {
    isEraseMode = true;
    previousMode = currentMode;
    currentMode = "erase";
    modeCheckbox.disabled = true;
    eraseBtn.classList.add("active");
  }
});

newBtn.addEventListener("click", startPuzzle);
clearBtn.addEventListener("click", clearGrid);
hintBtn.addEventListener("click", hint);
checkBtn.addEventListener("click", () => {
  if (checkSolved()) {
    completionModal.classList.remove("hidden");
    setStatus("Puzzle solved! 🎉");
  } else {
    setStatus("Not solved yet.");
  }
});

completionNewBtn.addEventListener("click", () => {
  completionModal.classList.add("hidden");
  startPuzzle();
});

completionCloseBtn.addEventListener("click", () => {
  completionModal.classList.add("hidden");
});

document.addEventListener("keydown", (event) => {
  if (event.key === "1") {
    if (isEraseMode) {
      isEraseMode = false;
      modeCheckbox.disabled = false;
      eraseBtn.classList.remove("active");
    }
    currentMode = "fill";
    previousMode = "fill";
    modeCheckbox.checked = false;
  }
  if (event.key === "2") {
    if (isEraseMode) {
      isEraseMode = false;
      modeCheckbox.disabled = false;
      eraseBtn.classList.remove("active");
    }
    currentMode = "mark";
    previousMode = "mark";
    modeCheckbox.checked = true;
  }
  if (event.key === "0") {
    isEraseMode = true;
    previousMode = currentMode;
    currentMode = "erase";
    modeCheckbox.disabled = true;
    eraseBtn.classList.add("active");
  }
});

// Mouse drag support
rootEl.addEventListener("mousedown", (e) => {
  if (e.target.classList.contains("cell")) {
    isDragging = true;
    applyCell(Number(e.target.dataset.row), Number(e.target.dataset.col), currentMode);
  }
});

rootEl.addEventListener("mousemove", (e) => {
  if (isDragging && e.target.classList.contains("cell")) {
    applyCell(Number(e.target.dataset.row), Number(e.target.dataset.col), currentMode);
  }
});

document.addEventListener("mouseup", () => {
  isDragging = false;
});

// Touch drag support for mobile
let touchCell = null;

rootEl.addEventListener("touchstart", (e) => {
  if (e.target.classList.contains("cell")) {
    isDragging = true;
    touchCell = e.target;
    applyCell(Number(e.target.dataset.row), Number(e.target.dataset.col), currentMode);
  }
});

rootEl.addEventListener("touchmove", (e) => {
  if (isDragging) {
    const touch = e.touches[0];
    const element = document.elementFromPoint(touch.clientX, touch.clientY);
    if (element && element.classList.contains("cell") && element !== touchCell) {
      touchCell = element;
      applyCell(Number(element.dataset.row), Number(element.dataset.col), currentMode);
    }
  }
});

document.addEventListener("touchend", () => {
  isDragging = false;
  touchCell = null;
});

import { initTheme } from "../game-ui-kit/theme.js";
initTheme("theme-selector", "nonogram-theme");

populatePuzzleSelector();
startPuzzle();
