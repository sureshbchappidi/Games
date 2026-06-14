const THEMES = ["default", "forest", "purple", "orange", "minimal", "dark"];

export function initTheme(selectorId = "theme-selector", storageKey = "game-theme") {
  const selector = document.getElementById(selectorId);
  if (!selector) return;

  const saved = localStorage.getItem(storageKey) || "default";
  const safeTheme = THEMES.includes(saved) ? saved : "default";
  document.documentElement.setAttribute("data-theme", safeTheme);
  selector.value = safeTheme;

  selector.addEventListener("change", (event) => {
    const nextTheme = THEMES.includes(event.target.value) ? event.target.value : "default";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem(storageKey, nextTheme);
  });
}
