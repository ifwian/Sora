// Applies the saved appearance before the app renders, so there's no flash of the wrong theme.
// Kept as an external file (not inline) so the Content-Security-Policy can forbid inline scripts.
// Keep the storage keys in step with src/constants/appearance.js.
;(function () {
  try {
    var saved = JSON.parse(localStorage.getItem('sora-appearance') || 'null') || {}
    var mode = saved.mode || localStorage.getItem('sora-theme')
    var isDark = mode === 'dark' || (mode !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    var root = document.documentElement
    root.classList.toggle('dark', isDark)
    if (saved.palette) root.dataset.palette = saved.palette
    if (saved.radius) root.dataset.radius = saved.radius
    if (saved.textSize) root.dataset.text = saved.textSize
    // Sky shifts with local time. The account's time zone refines this after /me.
    var hour = new Date().getHours()
    root.dataset.skyPhase =
      hour >= 5 && hour < 9 ? 'dawn' : hour >= 9 && hour < 17 ? 'day' : hour >= 17 && hour < 20 ? 'dusk' : 'night'
  } catch {
    /* storage blocked or corrupt — fall back to the default look */
  }
})()
