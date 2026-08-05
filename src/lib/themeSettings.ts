export function applyStoredSettings() {
  if (typeof window === 'undefined') return;
  const theme    = localStorage.getItem('evolve_settings_theme') || 'dark';
  const fontSize = localStorage.getItem('evolve_settings_font')  || 'normal';
  const root     = document.documentElement;

  // ── Font Scale ──────────────────────────────────────────────────────────────
  const scale: Record<string, string> = { normal: '100%', large: '112.5%', xlarge: '125%' };
  root.style.setProperty('--evolve-font-scale', scale[fontSize] || '100%');

  // ── Theme Classes ────────────────────────────────────────────────────────────
  root.classList.remove('evolve-theme-dark', 'evolve-theme-light', 'evolve-theme-minimalist');
  root.classList.add(`evolve-theme-${theme}`);
}
