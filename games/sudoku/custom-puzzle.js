// Custom Puzzle Creation Logic
let customPuzzleGrid = [];
let customCellInputs = [];
const modalEl = document.getElementById("custom-modal");
const createCustomBtn = document.getElementById("create-custom-btn");
const modalCloseBtn = document.getElementById("modal-close-btn");
const tabBtns = document.querySelectorAll(".tab-btn");
const manualTab = document.getElementById("manual-tab");
const uploadTab = document.getElementById("upload-tab");
const customGridEl = document.getElementById("custom-grid");
const previewGridEl = document.getElementById("preview-grid");
const clearCustomBtn = document.getElementById("clear-custom-btn");
const randomFillBtn = document.getElementById("random-fill-btn");
const startCustomBtn = document.getElementById("start-custom-btn");
const puzzleImageInput = document.getElementById("puzzle-image");
const uploadDropzone = document.getElementById("upload-dropzone");
const processImageBtn = document.getElementById("process-image-btn");
const uploadStatusEl = document.getElementById("upload-status");
const startFromUploadBtn = document.getElementById("start-from-upload-btn");
let uploadedImageFile = null;

// Initialize custom puzzle mode
function openCustomModal() {
  modalEl.classList.remove("hidden");
  if (customPuzzleGrid.length === 0) {
    initializeCustomGrid();
  }
}

function closeCustomModal() {
  modalEl.classList.add("hidden");
}

function initializeCustomGrid() {
  customPuzzleGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  createCustomGrid();
}

function createCustomGrid() {
  customGridEl.innerHTML = "";
  customCellInputs = [];
  
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "custom-cell";
      if ((Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0) {
        cell.classList.add("box-bg");
      }
      
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "1";
      input.inputMode = "numeric";
      input.value = customPuzzleGrid[r][c] || "";
      
      input.addEventListener("input", (e) => {
        const val = e.target.value.replace(/\D/g, "");
        const num = val === "" ? 0 : Math.min(9, parseInt(val));
        e.target.value = num === 0 ? "" : num;
        customPuzzleGrid[r][c] = num;
        cell.classList.toggle("filled", num !== 0);
      });
      
      cell.appendChild(input);
      customGridEl.appendChild(cell);
      customCellInputs.push(input);
    }
  }
}

function clearCustomGrid() {
  customPuzzleGrid = Array(9).fill(0).map(() => Array(9).fill(0));
  customCellInputs.forEach(input => {
    input.value = "";
    input.parentElement.classList.remove("filled");
  });
}

function randomFillCustomGrid() {
  clearCustomGrid();
  // Generate a random valid puzzle by starting with a solved board
  // and removing clues while keeping it solvable
  const solved = cloneBoard(customPuzzleGrid);
  const tempBoard = Array(9).fill(0).map(() => Array(9).fill(0));
  
  // Create a random valid solved board
  solveBoard(tempBoard);
  
  // Copy solved board and then remove random clues
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      customPuzzleGrid[r][c] = tempBoard[r][c];
    }
  }
  
  // Remove clues to create puzzle (keep around 30 clues for solvable puzzle)
  const cluesPerPuzzle = 30;
  let toRemove = 81 - cluesPerPuzzle;
  const positions = Array.from({length: 81}, (_, i) => i).sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < toRemove && i < positions.length; i++) {
    const pos = positions[i];
    const r = Math.floor(pos / 9);
    const c = pos % 9;
    customPuzzleGrid[r][c] = 0;
  }
  
  // Update UI
  customCellInputs.forEach((input, idx) => {
    const r = Math.floor(idx / 9);
    const c = idx % 9;
    const val = customPuzzleGrid[r][c];
    input.value = val === 0 ? "" : val;
    input.parentElement.classList.toggle("filled", val !== 0);
  });
}

function isValidPlacement(board, row, col, num) {
  // Check row
  for (let c = 0; c < 9; c++) {
    if (board[row][c] === num) return false;
  }
  // Check column
  for (let r = 0; r < 9; r++) {
    if (board[r][col] === num) return false;
  }
  // Check 3x3 box
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;
  for (let r = boxRow; r < boxRow + 3; r++) {
    for (let c = boxCol; c < boxCol + 3; c++) {
      if (board[r][c] === num) return false;
    }
  }
  return true;
}

async function startCustomPuzzle() {
  // Validate the puzzle has at least one clue
  const clueCount = customPuzzleGrid.flat().filter(n => n !== 0).length;
  if (clueCount === 0) {
    setStatus("Please enter at least one clue.");
    return;
  }
  
  // Check for immediate duplicates
  if (!isValidBoard(customPuzzleGrid)) {
    setStatus("Invalid puzzle: duplicate numbers in row/column/box.");
    return;
  }
  
  // Set up the puzzle
  puzzleBoard = cloneBoard(customPuzzleGrid);
  currentBoard = cloneBoard(customPuzzleGrid);
  
  // Try to generate a solution
  solutionBoard = emptyBoard();
  const tempBoard = cloneBoard(customPuzzleGrid);
  
  setStatus("Solving custom puzzle...");
  
  // Use a timeout to allow UI to update
  setTimeout(() => {
    if (solveBoard(tempBoard)) {
      solutionBoard = tempBoard;
      
      // Create givenMask
      givenMask = Array(9).fill(0).map(() => Array(9).fill(false));
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          givenMask[r][c] = customPuzzleGrid[r][c] !== 0;
        }
      }
      
      // Reset game state
      undoStack = [];
      userNotes = emptyNotes();
      stepHistory = [];
      showCandidates = false;
      highlightGivens = false;
      inputMode = "value";
      focusedCell = null;
      
      // Render and close modal
      renderBoard();
      renderSteps([]);
      updateModeButton();
      updateCandidatesButton();
      updateHighlightGivensButton();
      setStatus("Custom puzzle loaded! Solve it step by step.");
      closeCustomModal();
    } else {
      setStatus("Could not solve puzzle. Check for validity.");
    }
  }, 100);
}

function isValidBoard(board) {
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      if (board[r][c] !== 0) {
        const num = board[r][c];
        const temp = board[r][c];
        board[r][c] = 0;
        
        if (!isValidPlacement(board, r, c, num)) {
          board[r][c] = temp;
          return false;
        }
        
        board[r][c] = temp;
      }
    }
  }
  return true;
}

function emptyGrid() {
  return Array(9).fill(0).map(() => Array(9).fill(0));
}

function setUploadStatus(message, kind = "") {
  uploadStatusEl.textContent = message;
  uploadStatusEl.classList.remove("error", "success");
  if (kind) {
    uploadStatusEl.classList.add(kind);
  }
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load image."));
    };
    img.src = url;
  });
}

// Draw image cropped/scaled to a square canvas of targetSize
function loadImageToCanvas(img, targetSize = 900) {
  const canvas = document.createElement("canvas");
  canvas.width = targetSize;
  canvas.height = targetSize;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const iw = img.naturalWidth || img.width;
  const ih = img.naturalHeight || img.height;
  const srcSize = Math.min(iw, ih);
  const sx = Math.floor((iw - srcSize) / 2);
  const sy = Math.floor((ih - srcSize) / 2);
  ctx.drawImage(img, sx, sy, srcSize, srcSize, 0, 0, targetSize, targetSize);
  return canvas;
}

// Detect the actual Sudoku grid region within the canvas by finding
// the first/last rows and columns that contain a dense dark line.
// Returns { x, y, size } — the pixel-start and side-length of the grid.
function detectGridBounds(canvas) {
  const size = canvas.width;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const scanLimit = Math.floor(size * 0.25);  // only scan outer 25%
  const darkThresh = 100;
  const lineDensity = 0.25;  // ≥25% of pixels in a line must be dark

  function colDarkRatio(x) {
    const px = ctx.getImageData(x, 0, 1, size).data;
    let dark = 0;
    for (let i = 0; i < px.length; i += 4) {
      if ((px[i] + px[i+1] + px[i+2]) / 3 < darkThresh) dark++;
    }
    return dark / size;
  }

  function rowDarkRatio(y) {
    const px = ctx.getImageData(0, y, size, 1).data;
    let dark = 0;
    for (let i = 0; i < px.length; i += 4) {
      if ((px[i] + px[i+1] + px[i+2]) / 3 < darkThresh) dark++;
    }
    return dark / size;
  }

  let left = 0, top = 0, right = size, bottom = size;

  for (let x = 0; x < scanLimit; x++) {
    if (colDarkRatio(x) >= lineDensity) { left = x; break; }
  }
  for (let y = 0; y < scanLimit; y++) {
    if (rowDarkRatio(y) >= lineDensity) { top = y; break; }
  }
  for (let x = size - 1; x > size - scanLimit; x--) {
    if (colDarkRatio(x) >= lineDensity) { right = x; break; }
  }
  for (let y = size - 1; y > size - scanLimit; y--) {
    if (rowDarkRatio(y) >= lineDensity) { bottom = y; break; }
  }

  // Grid must be roughly square; fall back to full canvas if detection is off
  const w = right - left;
  const h = bottom - top;
  if (w < size * 0.5 || h < size * 0.5 || Math.abs(w - h) > size * 0.15) {
    return { x: 0, y: 0, size };
  }
  return { x: left, y: top, size: Math.round((w + h) / 2) };
}

// Prepare a single Sudoku cell for Tesseract.
// rawContrast=false (default): per-cell binary threshold (fast, accurate for most digits)
// rawContrast=true: enhanced grayscale sent to Tesseract as-is (lets Tesseract
//   apply its own internal threshold – better for thin-stroked 8, 6, 9, 4)
function prepareCellCanvas(srcCanvas, x, y, w, h, outSize = 160, rawContrast = false) {
  const out = document.createElement("canvas");
  out.width = outSize;
  out.height = outSize;
  const ctx = out.getContext("2d", { willReadFrequently: true });

  // White background, then draw the cell region scaled up
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, outSize, outSize);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  const pad = Math.floor(outSize * 0.04);
  ctx.drawImage(srcCanvas, x, y, w, h, pad, pad, outSize - pad * 2, outSize - pad * 2);

  const imgData = ctx.getImageData(0, 0, outSize, outSize);
  const data = imgData.data;

  // Convert to grayscale
  const gray = new Uint8Array(outSize * outSize);
  for (let i = 0, p = 0; i < data.length; i += 4, p++) {
    gray[p] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }

  if (rawContrast) {
    // Enhanced grayscale: stretch contrast but do NOT binarize.
    // Tesseract will apply its own internal threshold with more tonal information.
    const sorted = new Uint8Array(gray).sort();
    const lo = sorted[Math.floor(sorted.length * 0.05)];
    const hi = sorted[Math.floor(sorted.length * 0.95)];
    const range = hi - lo || 1;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const stretched = Math.round(Math.min(255, Math.max(0, (gray[p] - lo) * 255 / range)));
      data[i] = stretched;
      data[i + 1] = stretched;
      data[i + 2] = stretched;
      data[i + 3] = 255;
    }
  } else {
    // Per-cell contrast stretch + binary threshold (fast pass)
    const sorted = new Uint8Array(gray).sort();
    const lo = sorted[Math.floor(sorted.length * 0.05)];
    const hi = sorted[Math.floor(sorted.length * 0.95)];
    const range = hi - lo || 1;
    const inkThreshold = lo + range * 0.30;
    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const v = gray[p] < inkThreshold ? 0 : 255;
      data[i] = v;
      data[i + 1] = v;
      data[i + 2] = v;
      data[i + 3] = 255;
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return out;
}

// Return true if the cell region contains significant dark content (= likely has a digit)
function cellHasDigit(srcCanvas, x, y, w, h) {
  const data = srcCanvas.getContext("2d", { willReadFrequently: true }).getImageData(x, y, w, h).data;
  let dark = 0;
  for (let i = 0; i < data.length; i += 4) {
    const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    if (lum < 150) dark++;
  }
  return dark / (w * h) >= 0.018;
}

// Image upload and OCR – cell-by-cell, one Tesseract worker reused for all 81 cells
async function processImageUpload() {
  const file = uploadedImageFile || puzzleImageInput.files[0];
  if (!file) {
    setUploadStatus("Please select an image.", "error");
    return;
  }

  setUploadStatus("Loading image...");

  try {
    const image = await loadImageFromFile(file);
    const gridCanvas = loadImageToCanvas(image, 900);

    // Detect the actual grid region to correct for image borders/padding
    const bounds = detectGridBounds(gridCanvas);
    const cellW = bounds.size / 9;
    const cellH = bounds.size / 9;
    // Inset 10% on each side – enough to clear grid lines but not clip digits
    const insetX = Math.floor(cellW * 0.10);
    const insetY = Math.floor(cellH * 0.10);
    const cropW = Math.floor(cellW - insetX * 2);
    const cropH = Math.floor(cellH - insetY * 2);

    setUploadStatus("Starting OCR engine...");
    const worker = await Tesseract.createWorker("eng", 1);
    await worker.setParameters({
      tessedit_char_whitelist: "123456789",
      classify_bln_numeric_mode: "1",
      tessedit_pageseg_mode: "10"   // single-character mode
    });

    const grid = emptyGrid();
    let found = 0;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const x = Math.floor(bounds.x + c * cellW + insetX);
        const y = Math.floor(bounds.y + r * cellH + insetY);

        setUploadStatus(`Reading cells… ${Math.round(((r * 9 + c) / 81) * 100)}%`);

        if (!cellHasDigit(gridCanvas, x, y, cropW, cropH)) {
          continue;
        }

        const cellCanvas = prepareCellCanvas(gridCanvas, x, y, cropW, cropH, 160);
        const result = await worker.recognize(cellCanvas);
        let match = (result.data.text || "").match(/[1-9]/);
        let confidence = result.data.confidence || 0;

        // Second-chance pass: try the cell without contrast stretching
        // when the first pass has low/no confidence – helps with 8, 6, 9, 4
        if (!match || confidence < 40) {
          const cellCanvas2 = prepareCellCanvas(gridCanvas, x, y, cropW, cropH, 160, true);
          const result2 = await worker.recognize(cellCanvas2);
          const match2 = (result2.data.text || "").match(/[1-9]/);
          const conf2 = result2.data.confidence || 0;
          if (match2 && conf2 > confidence) {
            match = match2;
            confidence = conf2;
          }
        }

        if (match && confidence >= 20) {
          grid[r][c] = parseInt(match[0], 10);
          found++;
        }
      }
    }

    await worker.terminate();

    if (found < 5) {
      throw new Error(`Only detected ${found} clues. Try a clearer image cropped tightly to the puzzle grid.`);
    }

    customPuzzleGrid = grid;
    createPreviewGrid();
    setUploadStatus(
      `Detected ${found} clues. Review the grid and fix any errors, then click Confirm & Start.`,
      "success"
    );
    startFromUploadBtn.classList.remove("hidden");

  } catch (err) {
    setUploadStatus(`OCR failed: ${err.message}`, "error");
  }
}

function setUploadFile(file) {
  if (!file) return;

  if (!file.type.startsWith("image/")) {
    setUploadStatus("Please choose an image file.", "error");
    uploadedImageFile = null;
    return;
  }

  uploadedImageFile = file;
  setUploadStatus(`Selected image: ${file.name}`, "success");
}

function createPreviewGrid() {
  previewGridEl.innerHTML = "";
  
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement("div");
      cell.className = "custom-cell";
      if ((Math.floor(r / 3) + Math.floor(c / 3)) % 2 === 0) {
        cell.classList.add("box-bg");
      }
      
      const value = customPuzzleGrid[r][c];
      const input = document.createElement("input");
      input.type = "text";
      input.maxLength = "1";
      input.inputMode = "numeric";
      input.value = value || "";
      input.addEventListener("input", (e) => {
        const val = e.target.value.replace(/\D/g, "");
        const num = val === "" ? 0 : Math.min(9, parseInt(val, 10));
        e.target.value = num === 0 ? "" : String(num);
        customPuzzleGrid[r][c] = num;
        cell.classList.toggle("filled", num !== 0);
      });
      
      if (value !== 0) {
        cell.classList.add("filled");
      }
      
      cell.appendChild(input);
      previewGridEl.appendChild(cell);
    }
  }
}

// Event listeners
createCustomBtn.addEventListener("click", openCustomModal);
modalCloseBtn.addEventListener("click", closeCustomModal);

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    
    manualTab.classList.toggle("active", btn.dataset.tab === "manual");
    uploadTab.classList.toggle("active", btn.dataset.tab === "upload");
  });
});

clearCustomBtn.addEventListener("click", clearCustomGrid);
randomFillBtn.addEventListener("click", randomFillCustomGrid);
startCustomBtn.addEventListener("click", startCustomPuzzle);
processImageBtn.addEventListener("click", processImageUpload);
startFromUploadBtn.addEventListener("click", startCustomPuzzle);

puzzleImageInput.addEventListener("change", () => {
  setUploadFile(puzzleImageInput.files[0]);
});

uploadDropzone.addEventListener("click", () => {
  puzzleImageInput.click();
});

uploadDropzone.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    e.preventDefault();
    puzzleImageInput.click();
  }
});

uploadDropzone.addEventListener("dragover", (e) => {
  e.preventDefault();
  uploadDropzone.classList.add("drag-over");
});

uploadDropzone.addEventListener("dragleave", () => {
  uploadDropzone.classList.remove("drag-over");
});

uploadDropzone.addEventListener("drop", (e) => {
  e.preventDefault();
  uploadDropzone.classList.remove("drag-over");
  const droppedFile = e.dataTransfer?.files?.[0];
  setUploadFile(droppedFile);
});

// Close modal when clicking outside
modalEl.addEventListener("click", (e) => {
  if (e.target === modalEl) {
    closeCustomModal();
  }
});
