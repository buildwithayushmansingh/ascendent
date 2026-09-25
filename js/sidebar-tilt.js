// sidebar-tilt.js — Subtle cursor-based 3D tilt for the premium sidebar
// nav tiles. Skipped on touch devices and when reduced-motion is set.

(function () {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isCoarsePointer = window.matchMedia('(pointer: coarse)').matches;
    if (prefersReducedMotion || isCoarsePointer) return;

    document.querySelectorAll('.nav-tile').forEach((tile) => {
        tile.addEventListener('mousemove', (e) => {
            const rect = tile.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            // Kept deliberately subtle — a gentle reaction, not a dramatic spin.
            const rotateY = ((x / rect.width) - 0.5) * -8;  // ~ -4deg to 4deg
            const rotateX = ((y / rect.height) - 0.5) * 4;  // ~ -2deg to 2deg

            tile.style.transform =
                `translate3d(6px, 0, 0) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        });

        tile.addEventListener('mouseleave', () => {
            tile.style.transform = '';
        });
    });
})();