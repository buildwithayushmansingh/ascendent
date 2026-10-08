// theme.js — runs on EVERY page, before first paint
(function () {
    const root = document.documentElement;
    const THEMES = ['crimson', 'jade', 'void'];          // 'neon' = default
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
    function set(name, rgb) {
        root.style.setProperty(name, `rgb(${rgb.join(', ')})`);
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

    const savedTheme = localStorage.getItem('ascendent_theme');
    if (THEMES.includes(savedTheme)) root.setAttribute('data-theme', savedTheme);

    // accent sirf tab lagega jab user ne khud custom color chuna ho
    try {
        const s = JSON.parse(localStorage.getItem('ascendent_settings') || '{}');
        if (s.accentCustom === true) applyAccent(s.accent);
    } catch (e) { }
})();