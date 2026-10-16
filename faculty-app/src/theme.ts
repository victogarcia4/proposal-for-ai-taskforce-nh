export type Theme = "light" | "dark";
const KEY = "nhf-theme";

// Light is the default; the viewer's choice is a per-browser convenience only.
export function initialTheme(): Theme {
  try {
    return localStorage.getItem(KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light";
  }
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(KEY, theme);
  } catch { /* Storage may be blocked; the toggle still works for this visit. */ }
}
