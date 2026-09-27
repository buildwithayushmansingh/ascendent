// theme.js
// Loads saved theme + saved accent BEFORE page paint.
// This file is loaded on every Ascendent page.

(function () {

    const root = document.documentElement;

    /* =========================
       THEME
    ========================= */

    const savedTheme = localStorage.getItem('ascendent_theme');

    if (
        savedTheme === 'crimson' ||
        savedTheme === 'jade' ||
        savedTheme === 'void'
    ) {
        root.setAttribute('data-theme', savedTheme);
    }

    /* =========================
       ACCENT
    ========================= */

    const SETTINGS_KEY = 'ascendent_settings';
    const storedSettings = localStorage.getItem(SETTINGS_KEY);

    if (!storedSettings) return;

    try {

        const settings = JSON.parse(storedSettings);
        const accent = settings.accent;

        if (!accent || accent === 'none') {

            // Neutral / no custom color
            root.dataset.accent = 'none';

            root.style.setProperty(
                '--accent-bright',
                '#9a9a9a'
            );

            root.style.setProperty(
                '--accent',
                '#555555'
            );

            root.style.setProperty(
                '--accent-cyan',
                '#b5b5b5'
            );

            root.style.setProperty(
                '--border-bright',
                '#707070'
            );

            return;
        }

        if (!/^#[0-9A-Fa-f]{6}$/.test(accent)) return;

        const r = parseInt(accent.slice(1, 3), 16);
        const g = parseInt(accent.slice(3, 5), 16);
        const b = parseInt(accent.slice(5, 7), 16);

        function mix(
            r1,
            g1,
            b1,
            r2,
            g2,
            b2,
            amount
        ) {
            return [
                Math.round(r1 + (r2 - r1) * amount),
                Math.round(g1 + (g2 - g1) * amount),
                Math.round(b1 + (b2 - b1) * amount)
            ];
        }

        function rgbString(rgb) {
            return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`;
        }

        // Dark accent
        const dark = mix(
            r, g, b,
            0, 0, 0,
            0.18
        );

        // Light accent
        const light = mix(
            r, g, b,
            255, 255, 255,
            0.25
        );

        // Border accent
        const border = mix(
            r, g, b,
            255, 255, 255,
            0.08
        );

        root.dataset.accent = 'custom';

        root.style.setProperty(
            '--accent-bright',
            accent
        );

        root.style.setProperty(
            '--accent',
            rgbString(dark)
        );

        root.style.setProperty(
            '--accent-cyan',
            rgbString(light)
        );

        root.style.setProperty(
            '--border-bright',
            rgbString(border)
        );

    } catch (error) {
        console.warn('Ascendent accent restore failed:', error);
    }

})();