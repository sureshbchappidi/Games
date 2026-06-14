# Multi-Game App Generation Instructions

Use this instruction set to generate each new game as a separate web app while keeping the same visual identity, architecture quality, and UX style used in Sudoku Reasoning Lab.

## 1) Goal
Build a standalone browser game application (for example Tic-Tac-Toe, Nonogram, Kakuro, Minesweeper) with:
- The same polished visual language
- The same theme selector behavior
- Mobile-first interaction quality
- PWA support (manifest + service worker)
- Clear, maintainable vanilla JavaScript

Each game must be generated in its own folder and run independently.

## 2) Required Output Structure (Per Game)
For each game app, generate this structure:
- games/[game-name]/index.html
- games/[game-name]/styles.css
- games/[game-name]/app.js
- games/[game-name]/manifest.json
- games/[game-name]/sw.js
- games/[game-name]/icons/icon-192.png
- games/[game-name]/icons/icon-512.png
- games/[game-name]/README.md

Optional when needed:
- games/[game-name]/assets/
- games/[game-name]/levels/
- games/[game-name]/data/

## 3) Visual Style Contract (Must Match Sudoku Family)
Use these design principles:
- Typography:
  - Primary: Space Grotesk
  - Secondary/mono accents: DM Mono
- Layout:
  - Rounded panels with visible border and subtle offset shadow
  - Warm, tactile board-game feel
  - Responsive shell with clean spacing and strong hierarchy
- Motion:
  - Subtle transitions (120-220ms)
  - Purposeful hover and press states
- Focus and interaction:
  - Clear focus state for keyboard users
  - No noisy animations
  - Touch targets at least 44px on mobile

## 4) Theme System (Required)
Implement a theme selector in top controls with localStorage persistence.

Theme key list:
- default (Warm Beige)
- forest (Forest Green)
- purple (Deep Purple)
- orange (Sunrise Orange)
- minimal (Minimalist)
- dark (Dark Slate)

Implementation rules:
- Use CSS custom properties for all theme colors.
- Apply theme using data-theme on documentElement.
- On startup, load saved theme from localStorage key: game-theme.
- If no saved theme exists, use default.

## 5) App Shell and UX Pattern
Every game should include:
- Header with title + short subtitle
- Top controls row:
  - Difficulty/size selector if applicable
  - Theme selector
  - New Game button
- Main game board area
- Secondary controls area (reset/hint/check/undo based on game type)
- Status line for user feedback
- Optional side panel for reasoning, tips, or move history

Interaction requirements:
- Full keyboard support where sensible
- Mobile-friendly controls
- Avoid accidental focus loss on control clicks
- Keep state transitions predictable and reversible (undo when possible)

## 6) Engineering Standards
- Use vanilla JavaScript (no framework unless requested).
- Keep code modular with small, named functions.
- Separate pure game logic from DOM rendering logic.
- Prevent magic numbers by using constants.
- Use clear state object(s) for current game data.
- Keep rendering idempotent and deterministic.
- Add short comments only for non-obvious logic.

## 7) PWA Requirements
- Provide valid manifest.json with:
  - name and short_name
  - start_url
  - display: standalone
  - theme_color and background_color
  - icon set 192 and 512
- Service worker strategy:
  - Network-first for core app shell files
  - Cache-first fallback for static assets
  - Versioned cache name for safe upgrades

## 8) Accessibility and Quality Gates
Must pass:
- All controls have accessible labels
- Color contrast is readable in all themes
- Keyboard navigation works
- Mobile layout works at <= 600px
- No console errors during normal gameplay

## 9) Game-Specific Requirements Template
When generating a specific game, include this section filled in:
- Game name:
- Core rules:
- Win/loss conditions:
- Difficulty model:
- Input model (mouse/touch/keyboard):
- Board size variants:
- Hints/explanations (if any):
- Undo support:
- Persistence (optional):

## 10) Generation Prompt Template
Use this exact prompt template for each new game:

Create a standalone [GAME NAME] web app in folder [FOLDER NAME] using vanilla HTML/CSS/JS.
Follow the Multi-Game App Generation Instructions strictly.
Implement:
- Complete playable game logic
- Responsive UI matching Sudoku family style
- Theme selector with the 6 predefined themes and localStorage persistence
- PWA support (manifest + service worker)
- Clean file structure and README with run instructions

Game-specific constraints:
[PASTE GAME RULES AND SPECIAL REQUIREMENTS]

Acceptance criteria:
- Fully playable on desktop and mobile
- Keyboard support where applicable
- No console errors
- Uses the same style language as Sudoku Reasoning Lab

## 11) Example Game Targets
Tic-Tac-Toe:
- Modes: player vs player, player vs AI
- AI levels: random, basic strategy, minimax
- Board: 3x3
- Features: score tracking, rematch, first-player toggle

Nonogram:
- Variable grid sizes (5x5, 10x10, 15x15)
- Row/column clues display
- Cell states: empty, filled, marked X
- Validation and progress checks
- Optional hint system

## 12) Better Idea: Shared Core Design Kit
Recommended evolution:
- Create a shared folder called game-ui-kit with:
  - theme.css (all theme tokens)
  - shell.css (layout, panels, buttons, forms)
  - pwa-base.js (common SW registration + theme bootstrapping)
- Each new game imports the shared kit and only adds game-specific CSS/JS.

Benefits:
- Faster generation
- Consistent visual quality
- Easier bug fixes across all games
- Smaller maintenance overhead

If you adopt this, generate each new game with only:
- game-specific board styles
- game-specific logic and data model
- small adapter layer to plug into shared shell
