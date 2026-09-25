// theme.js — Applies the saved theme before the page paints (no flash).
// Must be the FIRST script in <head>, before the stylesheet link.
(function () {
    var saved = localStorage.getItem('ascendent_theme');
    if (saved === 'crimson' || saved === 'jade') {
        document.documentElement.setAttribute('data-theme', saved);
    }
})();