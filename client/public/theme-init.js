// Applies the saved theme before the app renders, so there's no flash of the wrong theme.
// Kept as an external file (not inline) so the Content-Security-Policy can forbid inline scripts.
;(function () {
  try {
    var stored = localStorage.getItem('sora-theme')
    var isDark = stored === 'dark' || (stored !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    document.documentElement.classList.toggle('dark', isDark)
  } catch {
    /* storage blocked — fall back to the default (light) theme */
  }
})()
