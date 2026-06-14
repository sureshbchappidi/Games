const SIZE = 9;
const BOX = 3;

const gridEl = document.getElementById("sudoku-grid");
const stepsListEl = document.getElementById("steps-list");
const statusEl = document.getElementById("status");
const difficultyEl = document.getElementById("difficulty");
const newPuzzleBtn = document.getElementById("new-puzzle-btn");
const undoBtn = document.getElementById("undo-btn");
const resetBtn = document.getElementById("reset-btn");
const modeCheckbox = document.getElementById("mode-checkbox");
const candidatesBtn = document.getElementById("candidates-btn");
const highlightGivensBtn = document.getElementById("highlight-givens-btn");
const checkBtn = document.getElementById("check-btn");
const nextStepBtn = document.getElementById("next-step-btn");
const solveAllBtn = document.getElementById("solve-all-btn");
const completionModal = document.getElementById("completion-modal");
const completionNewBtn = document.getElementById("completion-new-btn");
const completionCloseBtn = document.getElementById("completion-close-btn");

let puzzleBoard = emptyBoard();
let currentBoard = emptyBoard();
let solutionBoard = emptyBoard();
let givenMask = makeMask();
let stepHistory = [];
let cellEls = makeMask();
let showCandidates = false;
let highlightGivens = false;
let inputMode = "value";
let userNotes = emptyNotes();
let undoStack = [];
let focusedCell = null; // {row, col}

// Mobile keyboard behavior
let lastTapTime = 0;
let lastTapCell = null;

function isMobileViewport() {
  return window.innerWidth <= 600;
}

function emptyBoard() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
}

function makeMask() {
  return Array.from({ length: SIZE }, () => Array(SIZE).fill(false));
}

function emptyNotes() {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => new Set())
  );
}

function cloneNotes(notes) {
  return notes.map((row) => row.map((set) => new Set(set)));
}

function saveUndo() {
  undoStack.push({
    board: cloneBoard(currentBoard),
    notes: cloneNotes(userNotes),
  });
  if (undoStack.length > 100) {
    undoStack.shift();
  }
}

function applyUndo() {
  if (undoStack.length === 0) {
    setStatus("Nothing to undo.");
    return;
  }
  const snapshot = undoStack.pop();
  currentBoard = snapshot.board;
  userNotes = snapshot.notes;
  renderBoard();
  setStatus("Undone.");
}

function resetPuzzle() {
  currentBoard = cloneBoard(puzzleBoard);
  userNotes = emptyNotes();
  undoStack = [];
  renderBoard();
  setStatus("Puzzle reset to starting position.");
}

function cloneBoard(board) {
  return board.map((row) => [...row]);
}

function shuffle(values) {
  const arr = [...values];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function isValidPlacement(board, row, col, value) {
  for (let i = 0; i < SIZE; i += 1) {
    if (board[row][i] === value || board[i][col] === value) {
      return false;
    }
  }

  const rowStart = Math.floor(row / BOX) * BOX;
  const colStart = Math.floor(col / BOX) * BOX;
  for (let r = rowStart; r < rowStart + BOX; r += 1) {
    for (let c = colStart; c < colStart + BOX; c += 1) {
      if (board[r][c] === value) {
        return false;
      }
    }
  }

  return true;
}

function isCellConsistent(board, row, col) {
  const value = board[row][col];
  if (value === 0) {
    return true;
  }

  board[row][col] = 0;
  const valid = isValidPlacement(board, row, col, value);
  board[row][col] = value;
  return valid;
}

function boardHasConflicts(board) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (!isCellConsistent(board, row, col)) {
        return true;
      }
    }
  }
  return false;
}

function getCandidates(board, row, col) {
  if (board[row][col] !== 0) {
    return [];
  }

  const candidates = [];
  for (let value = 1; value <= SIZE; value += 1) {
    if (isValidPlacement(board, row, col, value)) {
      candidates.push(value);
    }
  }
  return candidates;
}

function findBestEmptyCell(board) {
  let best = null;
  let bestCandidates = null;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }

      const candidates = getCandidates(board, row, col);
      if (candidates.length === 0) {
        return { row, col, candidates };
      }
      if (!best || candidates.length < bestCandidates.length) {
        best = { row, col };
        bestCandidates = candidates;
      }
      if (bestCandidates.length === 1) {
        return { ...best, candidates: bestCandidates };
      }
    }
  }

  return best ? { ...best, candidates: bestCandidates } : null;
}

function solveBoard(board) {
  const next = findBestEmptyCell(board);
  if (!next) {
    return true;
  }

  const { row, col, candidates } = next;
  for (const value of shuffle(candidates)) {
    board[row][col] = value;
    if (solveBoard(board)) {
      return true;
    }
  }

  board[row][col] = 0;
  return false;
}

function countSolutions(board, limit = 2) {
  const next = findBestEmptyCell(board);
  if (!next) {
    return 1;
  }

  let total = 0;
  const { row, col, candidates } = next;
  for (const value of candidates) {
    board[row][col] = value;
    total += countSolutions(board, limit);
    if (total >= limit) {
      board[row][col] = 0;
      return total;
    }
  }

  board[row][col] = 0;
  return total;
}

function generateSolvedBoard() {
  const board = emptyBoard();
  solveBoard(board);
  return board;
}

function cluesByDifficulty(level) {
  if (level === "easy") {
    return 40;
  }
  if (level === "hard") {
    return 29;
  }
  if (level === "extreme") {
    return 23;
  }
  return 34;
}

function generatePuzzle(level) {
  const clues = cluesByDifficulty(level);
  const solved = generateSolvedBoard();
  const puzzle = cloneBoard(solved);

  const allCells = [];
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      allCells.push({ row, col });
    }
  }

  let filledCount = SIZE * SIZE;
  for (const { row, col } of shuffle(allCells)) {
    if (filledCount <= clues) {
      break;
    }

    const backup = puzzle[row][col];
    puzzle[row][col] = 0;

    const testBoard = cloneBoard(puzzle);
    const solutions = countSolutions(testBoard, 2);
    if (solutions !== 1) {
      puzzle[row][col] = backup;
    } else {
      filledCount -= 1;
    }
  }

  return { puzzle, solved, clues: filledCount };
}

function isSolved(board) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] === 0) {
        return false;
      }
    }
  }
  return true;
}

function buildStep(type, row, col, value, detail) {
  return { type, row, col, value, detail };
}

function findNakedSingle(board) {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      if (board[row][col] !== 0) {
        continue;
      }
      const candidates = getCandidates(board, row, col);
      if (candidates.length === 1) {
        return buildStep(
          "Naked Single",
          row,
          col,
          candidates[0],
          `Cell (${row + 1}, ${col + 1}) can only be ${candidates[0]}.`
        );
      }
    }
  }
  return null;
}

function hiddenSingleInUnit(board, cells, unitName) {
  for (let value = 1; value <= SIZE; value += 1) {
    const matches = [];
    for (const [row, col] of cells) {
      if (board[row][col] !== 0) {
        continue;
      }
      const candidates = getCandidates(board, row, col);
      if (candidates.includes(value)) {
        matches.push([row, col]);
      }
    }

    if (matches.length === 1) {
      const [row, col] = matches[0];
      return buildStep(
        "Hidden Single",
        row,
        col,
        value,
        `In ${unitName}, only cell (${row + 1}, ${col + 1}) can take ${value}.`
      );
    }
  }

  return null;
}

function findHiddenSingle(board) {
  for (let row = 0; row < SIZE; row += 1) {
    const cells = Array.from({ length: SIZE }, (_, col) => [row, col]);
    const found = hiddenSingleInUnit(board, cells, `row ${row + 1}`);
    if (found) {
      return found;
    }
  }

  for (let col = 0; col < SIZE; col += 1) {
    const cells = Array.from({ length: SIZE }, (_, row) => [row, col]);
    const found = hiddenSingleInUnit(board, cells, `column ${col + 1}`);
    if (found) {
      return found;
    }
  }

  for (let boxRow = 0; boxRow < BOX; boxRow += 1) {
    for (let boxCol = 0; boxCol < BOX; boxCol += 1) {
      const cells = [];
      for (let r = boxRow * BOX; r < boxRow * BOX + BOX; r += 1) {
        for (let c = boxCol * BOX; c < boxCol * BOX + BOX; c += 1) {
          cells.push([r, c]);
        }
      }
      const boxIndex = boxRow * BOX + boxCol + 1;
      const found = hiddenSingleInUnit(board, cells, `box ${boxIndex}`);
      if (found) {
        return found;
      }
    }
  }

  return null;
}

function findReasoningStep(board, solved) {
  const naked = findNakedSingle(board);
  if (naked) {
    return naked;
  }

  const hidden = findHiddenSingle(board);
  if (hidden) {
    return hidden;
  }

  const next = findBestEmptyCell(board);
  if (!next) {
    return null;
  }

  const { row, col, candidates } = next;
  const value = solved[row][col];
  return buildStep(
    "Guided Guess",
    row,
    col,
    value,
    `No direct single found. Cell (${row + 1}, ${col + 1}) has candidates [${candidates.join(
      ", "
    )}], choose ${value} and continue.`
  );
}

function renderSteps(steps) {
  stepsListEl.innerHTML = "";
  for (const step of steps) {
    const li = document.createElement("li");
    li.textContent = `${step.type}: ${step.detail}`;
    stepsListEl.appendChild(li);
  }
}

function updateModeButton() {
  modeCheckbox.checked = (inputMode === "notes");
}

function erasePeerNotes(row, col, value) {
  const boxRow = Math.floor(row / BOX) * BOX;
  const boxCol = Math.floor(col / BOX) * BOX;

  for (let i = 0; i < SIZE; i += 1) {
    userNotes[row][i].delete(value);
    userNotes[i][col].delete(value);
  }

  for (let r = boxRow; r < boxRow + BOX; r += 1) {
    for (let c = boxCol; c < boxCol + BOX; c += 1) {
      userNotes[r][c].delete(value);
    }
  }
}

function clearHighlights() {
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (cellEls[r][c]) {
        cellEls[r][c].classList.remove("hl-focused", "hl-peer", "hl-same");
      }
    }
  }
}

function applyHighlights(row, col) {
  clearHighlights();
  const value = currentBoard[row][col];

  for (let i = 0; i < SIZE; i += 1) {
    // same row - all cells
    if (i !== col && cellEls[row][i]) {
      cellEls[row][i].classList.add("hl-peer");
    }
    // same column - all cells
    if (i !== row && cellEls[i][col]) {
      cellEls[i][col].classList.add("hl-peer");
    }
  }

  if (value !== 0) {
    for (let r = 0; r < SIZE; r += 1) {
      for (let c = 0; c < SIZE; c += 1) {
        if ((r !== row || c !== col) && currentBoard[r][c] === value && cellEls[r][c]) {
          cellEls[r][c].classList.add("hl-same");
        }
      }
    }
  }

  cellEls[row][col].classList.add("hl-focused");
}

function updateCandidatesButton() {
  candidatesBtn.textContent = showCandidates ? "Hide Candidates" : "Show Candidates";
  candidatesBtn.classList.toggle("toggle-active", showCandidates);
}

function updateHighlightGivensButton() {
  highlightGivensBtn.textContent = highlightGivens ? "Hide Givens" : "Highlight Givens";
  highlightGivensBtn.classList.toggle("toggle-active", highlightGivens);
}

function setStatus(text) {
  statusEl.textContent = text;
}

function getDigitCounts(board) {
  const counts = new Array(10).fill(0);
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const val = board[row][col];
      if (val > 0 && val <= 9) {
        counts[val] += 1;
      }
    }
  }
  return counts;
}

function updateDigitProgress() {
  const counts = getDigitCounts(currentBoard);
  const indicators = document.querySelectorAll(".digit-indicator");
  
  indicators.forEach((indicator) => {
    const digit = parseInt(indicator.dataset.digit, 10);
    if (counts[digit] === 9) {
      indicator.classList.add("complete");
    } else {
      indicator.classList.remove("complete");
    }
  });
}

function showCompletionModal() {
  completionModal.classList.remove("hidden");
}

function closeCompletionModal() {
  completionModal.classList.add("hidden");
}

function handleDigitClick(digit) {
  if (!focusedCell) {
    setStatus("Click on a cell first to select it.");
    return;
  }

  const { row, col } = focusedCell;

  // Don't allow editing given clues
  if (givenMask[row][col]) {
    setStatus("Cannot edit given clues.");
    return;
  }

  if (inputMode === "notes") {
    // Toggle note for this digit
    if (currentBoard[row][col] !== 0) {
      setStatus("Clear the value first, then add notes for that cell.");
      return;
    }
    saveUndo();
    if (userNotes[row][col].has(digit)) {
      userNotes[row][col].delete(digit);
    } else {
      userNotes[row][col].add(digit);
    }
  } else {
    // Value mode: enter the digit
    saveUndo();
    currentBoard[row][col] = digit;
    userNotes[row][col].clear();
    erasePeerNotes(row, col, digit);
  }

  renderBoard();

  // Keep focus on the same cell after render
  if (cellEls[row][col]) {
    const input = cellEls[row][col].querySelector("input");
    if (input) input.focus();
  }

  // Check if puzzle is solved
  if (isSolved(currentBoard) && !boardHasConflicts(currentBoard)) {
    setStatus("Great work. You solved the puzzle.");
    showCompletionModal();
  }
  updateDigitProgress();
}

function refreshConflicts() {
  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const cell = cellEls[row][col];
      cell.classList.remove("conflict");
      if (currentBoard[row][col] !== 0 && !isCellConsistent(currentBoard, row, col)) {
        cell.classList.add("conflict");
      }
    }
  }
}

function renderBoard() {
  gridEl.innerHTML = "";
  cellEls = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      const cell = document.createElement("div");
      cell.className = "cell";

      if ((col + 1) % BOX === 0 && col < SIZE - 1) {
        cell.classList.add("box-right");
      }
      if ((row + 1) % BOX === 0 && row < SIZE - 1) {
        cell.classList.add("box-bottom");
      }

      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = 1;
      input.inputMode = "numeric";
      input.value = currentBoard[row][col] === 0 ? "" : String(currentBoard[row][col]);

      if ((showCandidates || userNotes[row][col].size > 0) && currentBoard[row][col] === 0) {
        const candidates = showCandidates ? getCandidates(currentBoard, row, col) : [];
        const candidateWrap = document.createElement("div");
        candidateWrap.className = "candidates";

        for (let digit = 1; digit <= SIZE; digit += 1) {
          const slot = document.createElement("span");
          slot.className = "candidate-digit";
          const hasAuto = candidates.includes(digit);
          const hasNote = userNotes[row][col].has(digit);
          slot.textContent = hasAuto || hasNote ? String(digit) : "";
          if (hasNote) {
            slot.classList.add("user-note");
          }
          candidateWrap.appendChild(slot);
        }

        cell.appendChild(candidateWrap);
      }

      if (givenMask[row][col]) {
        cell.classList.add("given");
        if (highlightGivens) {
          cell.classList.add("highlight-givens");
        }
        input.readOnly = true;
      } else if (currentBoard[row][col] !== 0) {
        cell.classList.add("user-value");
      }

      // On mobile, make input readonly to prevent auto-showing keyboard
      if (isMobileViewport()) {
        input.readOnly = true;
      }

      input.addEventListener("focus", () => {
        focusedCell = { row, col };
        applyHighlights(row, col);
      });

      input.addEventListener("blur", () => {
        // Re-apply readonly on mobile to prevent keyboard showing on accidental focus
        if (isMobileViewport() && !givenMask[row][col]) {
          input.readOnly = true;
        }
        // small delay so focus moving to another cell clears+reapplies cleanly
        setTimeout(() => {
          if (!focusedCell || focusedCell.row !== row || focusedCell.col !== col) {
            return;
          }
          clearHighlights();
          focusedCell = null;
        }, 50);
      });

      // Double-tap detection for mobile keyboard
      cell.addEventListener("touchend", (event) => {
        if (!isMobileViewport() || givenMask[row][col]) {
          return;
        }
        const now = Date.now();
        const isDoubleTap = lastTapCell === cell && now - lastTapTime < 300;
        lastTapTime = now;
        lastTapCell = cell;

        if (isDoubleTap) {
          event.preventDefault();
          // Remove readonly on double-tap to show keyboard
          input.readOnly = false;
          input.focus();
        }
      });

      // Click handler for given cells (read-only inputs don't fire focus properly on click)
      if (givenMask[row][col]) {
        input.addEventListener("click", () => {
          focusedCell = { row, col };
          applyHighlights(row, col);
        });
        // Also add click handler to the cell div to handle clicks on the whole cell
        cell.addEventListener("click", () => {
          focusedCell = { row, col };
          applyHighlights(row, col);
        });
      } else if (!isMobileViewport()) {
        // On desktop, clicking input shows keyboard normally
        input.addEventListener("click", () => {
          focusedCell = { row, col };
          applyHighlights(row, col);
        });
      } else {
        // On mobile, single click just selects the cell (no keyboard)
        cell.addEventListener("click", () => {
          focusedCell = { row, col };
          applyHighlights(row, col);
        });
      }

      input.addEventListener("keydown", (event) => {
        if (givenMask[row][col]) {
          event.preventDefault();
          return;
        }

        const key = event.key;
        // Allow only digits, delete/backspace, navigation, and the N mode-toggle
        const isDigit = key >= "0" && key <= "9";
        const isEdit = key === "Backspace" || key === "Delete";
        const isNav = key === "Tab" || key.startsWith("Arrow") ||
                      key === "Home" || key === "End";
        const isModified = event.ctrlKey || event.metaKey || event.altKey;
        const isModeToggle = key === "n" || key === "N";
        if (!isDigit && !isEdit && !isNav && !isModified && !isModeToggle) {
          event.preventDefault();
          return;
        }

        if (inputMode === "notes") {
          if (key >= "1" && key <= "9") {
            event.preventDefault();
            if (currentBoard[row][col] !== 0) {
              setStatus("Clear the value first, then add notes for that cell.");
              return;
            }
            saveUndo();
            const digit = Number(key);
            if (userNotes[row][col].has(digit)) {
              userNotes[row][col].delete(digit);
            } else {
              userNotes[row][col].add(digit);
            }
            renderBoard();
            // keep focus on the same cell after re-render
            if (cellEls[row][col]) {
              cellEls[row][col].querySelector("input").focus();
            }
            return;
          }

          if (key === "Backspace" || key === "Delete") {
            event.preventDefault();
            saveUndo();
            userNotes[row][col].clear();
            renderBoard();
            if (cellEls[row][col]) {
              cellEls[row][col].querySelector("input").focus();
            }
          }
          return;
        }

        if (key >= "1" && key <= "9") {
          event.preventDefault();
          saveUndo();
          const placed = Number(key);
          currentBoard[row][col] = placed;
          userNotes[row][col].clear();
          erasePeerNotes(row, col, placed);
          renderBoard();
        } else if (key === "Backspace" || key === "Delete" || key === "0") {
          event.preventDefault();
          saveUndo();
          currentBoard[row][col] = 0;
          renderBoard();
        }

        if (isSolved(currentBoard) && !boardHasConflicts(currentBoard)) {
          setStatus("Great work. You solved the puzzle.");
          showCompletionModal();
        }
        updateDigitProgress();
      });

      cell.appendChild(input);
      gridEl.appendChild(cell);
      cellEls[row][col] = cell;
    }
  }

  updateDigitProgress();
  refreshConflicts();
  // restore highlights if a cell was focused before render
  if (focusedCell) {
    applyHighlights(focusedCell.row, focusedCell.col);
    const input = cellEls[focusedCell.row][focusedCell.col]?.querySelector("input");
    if (input && document.activeElement !== input) {
      input.focus();
    }
  }
}

function checkProgress() {
  refreshConflicts();
  if (boardHasConflicts(currentBoard)) {
    setStatus("Conflicts found. Cells highlighted in red need correction.");
    return;
  }

  if (isSolved(currentBoard)) {
    setStatus("Puzzle solved correctly.");
    return;
  }

  setStatus("No conflicts detected. Keep going.");
}

function applySingleStep() {
  if (boardHasConflicts(currentBoard)) {
    setStatus("Fix highlighted conflicts before asking for a hint.");
    return;
  }

  const step = findReasoningStep(currentBoard, solutionBoard);
  if (!step) {
    setStatus("No further reasoning steps available.");
    return;
  }

  currentBoard[step.row][step.col] = step.value;
  userNotes[step.row][step.col].clear();
  erasePeerNotes(step.row, step.col, step.value);
  stepHistory.push(step);
  renderBoard();
  renderSteps(stepHistory);

  if (isSolved(currentBoard)) {
    setStatus("Solved. Every reasoning step is listed on the right.");
  } else {
    setStatus(`Hint applied: ${step.type} at row ${step.row + 1}, column ${step.col + 1}.`);
  }
}

function solveAndExplainAll() {
  if (boardHasConflicts(currentBoard)) {
    setStatus("Fix highlighted conflicts before auto-solving.");
    return;
  }

  const steps = [];
  let guard = 0;

  while (!isSolved(currentBoard) && guard < 200) {
    guard += 1;
    const step = findReasoningStep(currentBoard, solutionBoard);
    if (!step) {
      break;
    }
    currentBoard[step.row][step.col] = step.value;
    userNotes[step.row][step.col].clear();
    erasePeerNotes(step.row, step.col, step.value);
    steps.push(step);
  }

  stepHistory = [...stepHistory, ...steps];
  renderBoard();
  renderSteps(stepHistory);

  if (isSolved(currentBoard)) {
    setStatus(`Solved with ${steps.length} additional explained steps.`);
    showCompletionModal();
  } else {
    setStatus("Solver paused before completion.");
  }
}

function startNewPuzzle() {
  const level = difficultyEl.value;
  const { puzzle, solved, clues } = generatePuzzle(level);

  puzzleBoard = cloneBoard(puzzle);
  currentBoard = cloneBoard(puzzle);
  solutionBoard = solved;
  givenMask = makeMask();
  stepHistory = [];
  userNotes = emptyNotes();
  undoStack = [];
  focusedCell = null;

  for (let row = 0; row < SIZE; row += 1) {
    for (let col = 0; col < SIZE; col += 1) {
      givenMask[row][col] = puzzle[row][col] !== 0;
    }
  }

  renderBoard();
  renderSteps([]);
  updateModeButton();
  updateCandidatesButton();
  updateHighlightGivensButton();
  setStatus(`New ${level} puzzle generated with ${clues} clues.`);
}

newPuzzleBtn.addEventListener("click", startNewPuzzle);
undoBtn.addEventListener("click", applyUndo);
resetBtn.addEventListener("click", resetPuzzle);
document.addEventListener("keydown", (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === "z") {
    event.preventDefault();
    applyUndo();
    return;
  }

  // N toggles Value / Notes mode from anywhere, including focused cells
  if (event.key === "n" || event.key === "N") {
    // Skip only for non-cell inputs (select, textarea)
    const tag = document.activeElement?.tagName;
    if (tag === "SELECT" || tag === "TEXTAREA") {
      return;
    }
    event.preventDefault();
    inputMode = inputMode === "value" ? "notes" : "value";
    updateModeButton();
    setStatus(
      inputMode === "value"
        ? "Value mode  [N to switch]"
        : "Notes mode  [N to switch]"
    );
  }
});
modeCheckbox.addEventListener("change", () => {
  inputMode = modeCheckbox.checked ? "notes" : "value";
  setStatus(
    inputMode === "value"
      ? "Value mode  [N to switch]"
      : "Notes mode  [N to switch]"
  );
});
candidatesBtn.addEventListener("click", () => {
  showCandidates = !showCandidates;
  updateCandidatesButton();
  renderBoard();
});
highlightGivensBtn.addEventListener("click", () => {
  highlightGivens = !highlightGivens;
  updateHighlightGivensButton();
  renderBoard();
});
checkBtn.addEventListener("click", checkProgress);
nextStepBtn.addEventListener("click", applySingleStep);
solveAllBtn.addEventListener("click", solveAndExplainAll);
completionNewBtn.addEventListener('click', () => {
  closeCompletionModal();
  startNewPuzzle();
});

completionCloseBtn.addEventListener('click', closeCompletionModal);

// Add click handlers to digit indicators for mobile-friendly input
const digitIndicators = document.querySelectorAll('.digit-indicator');
digitIndicators.forEach(indicator => {
  indicator.addEventListener('click', () => {
    const digit = parseInt(indicator.dataset.digit, 10);
    handleDigitClick(digit);
  });
});

updateModeButton();
updateCandidatesButton();
startNewPuzzle();
