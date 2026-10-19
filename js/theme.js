// theme.js — runs on EVERY page, before first paint
(function () {
    const root = document.documentElement;
    const THEMES = ['crimson', 'jade', 'void'];          // 'neon' = default (no attribute)
    const ACCENT_VARS = [
        '--accent', '--accent-bright', '--accent-cyan', '--border-bright',
        '--accent-rgb', '--accent-bright-rgb', '--accent-cyan-rgb', '--border-bright-rgb'
    ];

    function hexToRgb(hex) {
        if (!/^#[0-9a-f]{6}$/i.test(hex)) return null;
        return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16));
    }
    function mix(rgb, target, amount) {
        return rgb.map((c, i) => Math.round(c + (target[i] - c) * amount));
    }
    function toHex(rgb) {
        return '#' + rgb.map(c => Math.max(0, Math.min(255, c)).toString(16).padStart(2, '0')).join('');
    }
    function set(name, rgb) {
        root.style.setProperty(name, toHex(rgb));            // hex: transition.js and others parse this
        root.style.setProperty(name + '-rgb', rgb.join(', '));
    }

    function clearAccent() {
        ACCENT_VARS.forEach(v => root.style.removeProperty(v));
        delete root.dataset.accent;
    }

    function applyAccent(hex) {
        const rgb = hexToRgb(hex);
        if (!rgb) return clearAccent();
        root.dataset.accent = 'custom';
        set('--accent', mix(rgb, [0, 0, 0], 0.18));
        set('--accent-bright', rgb);
        set('--accent-cyan', mix(rgb, [255, 255, 255], 0.25));
        set('--border-bright', mix(rgb, [255, 255, 255], 0.08));
    }

    window.AscendentTheme = { applyAccent, clearAccent };

    // 1) THEME
    const savedTheme = localStorage.getItem('ascendent_theme');
    if (THEMES.includes(savedTheme)) root.setAttribute('data-theme', savedTheme);

    // 2) ACCENT — only if the user *deliberately* picked a custom one
    try {
        const s = JSON.parse(localStorage.getItem('ascendent_settings') || '{}');
        if (s.accentCustom === true) applyAccent(s.accent);
    } catch (e) { /* ignore */ }
})();