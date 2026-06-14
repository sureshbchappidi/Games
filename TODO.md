# Sudoku Reasoning Lab - TODO & Issues

## Known Issues (In Progress)

### 1. Mobile Double-Tap Not Opening Keyboard
- **Status**: Not fixed yet
- **Description**: On mobile devices, double-tapping a cell should open the keyboard for typing, but it's not working
- **Expected Behavior**: Single tap = select cell (no keyboard), Double tap = show keyboard
- **Attempted Solutions**:
  - `touchstart` event → didn't work
  - `touchend` with sync focus → still not working
- **Next Steps**: May need to investigate iOS-specific gesture handling or alternative approaches like long-press

### 2. Desktop Browser - Focus Lost on Digit Button Click
- **Status**: Not fully fixed
- **Description**: When clicking digit indicators (1-9) on desktop, the cell focus is still lost intermittently
- **Expected Behavior**: Click digit → digit enters cell → cell stays focused → can continue typing
- **Attempted Solutions**:
  - Added `pointerdown` preventDefault → partial fix
  - Added `input.isConnected` check in blur handler → didn't fully resolve
  - Restored focus after renderBoard → still losing focus sometimes
- **Root Cause**: Timing race between renderBoard's DOM destruction, blur events, and focus restoration
- **Next Steps**: May need to refactor to avoid full DOM re-render, or use a more robust focus management system

---

## Completed Features

- ✅ Sudoku puzzle generator (4 difficulties)
- ✅ Backtracking solver with reasoning engine
- ✅ Interactive 9×9 grid with editable cells
- ✅ Dual-mode input (Value/Notes toggle)
- ✅ Undo system (Ctrl+Z, up to 100 steps)
- ✅ Keyboard navigation (arrows, N toggle)
- ✅ Custom puzzle creation (manual + OCR)
- ✅ PWA support (offline play, home screen install)
- ✅ Mobile responsive design
- ✅ Digit progress indicators with checkmarks
- ✅ Completion celebration modal
- ✅ Mobile digit entry via clicking indicators
- ✅ Value mode: click same digit to clear, different digit to replace
- ✅ Notes mode: multiple candidates in one cell
- ✅ Smooth zoom highlight on focused cell (no blinking cursor)
- ✅ Mobile: single tap selects, no keyboard auto-show
- ✅ Desktop: digit buttons work with keyboard
- ✅ GitHub Pages deployment

---

## Future Enhancements

- [ ] Statistics/progress tracking
- [ ] Difficulty rating of puzzles
- [ ] Leaderboard/achievements
- [ ] Share puzzle links
- [ ] Dark mode
- [ ] Sound effects toggle
- [ ] Hint system improvements
- [ ] Performance optimizations
- [ ] Accessibility improvements (ARIA labels)
- [ ] Multi-language support
