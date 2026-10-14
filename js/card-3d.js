// =========================================================
// card-3d.js — cinematic entrance, physical 3D flip, hover tilt
// Vanilla JS. Load BEFORE card.js. card.js calls Card3D.init().
//
// Structure it drives (already in your HTML, nothing replaced):
//   .flip-container > #flipInner > #playerCard (front) + #futureSelfCard (back)
//
// One tiny spring simulation runs ONLY while something is moving,
// then stops (no permanent animation loop).
// =========================================================
(function () {
    'use strict';

    var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var CAN_HOVER = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    var THICK = 8;            // card thickness in px (edges)
    var INTRO_MS = 650;       // when the content reveal starts

    var container, inner, front, back, shadow;
    var fxFront, fxBack, shFront, shBack;
    var raf = 0, last = 0;
    var ready = false, flipLock = false, flipFrom = 0, flipTo = 0;
    var hoverX = 50, hoverY = 30;

    // ---------- spring helpers ----------
    function sp(x, t, k, d, eps) { return { x: x, v: 0, t: t, k: k, d: d, eps: eps || 0.02 }; }
    function stepSp(s, h) { s.v += (s.k * (s.t - s.x) - s.d * s.v) * h; s.x += s.v * h; }
    function still(s) { return Math.abs(s.v) < s.eps * 12 && Math.abs(s.t - s.x) < s.eps; }
    function clamp(n, a, b) { return Math.max(a, Math.min(b, n)); }

    // k = stiffness, d = damping.  Lower d = more bounce.
    var S = {
        tz: sp(0, 0, 55, 11, 0.05), ty: sp(0, 0, 70, 12, 0.05), tx: sp(0, 0, 90, 14, 0.05),
        rx: sp(0, 0, 60, 10), ry: sp(0, 0, 48, 9), rz: sp(0, 0, 55, 9),
        s: sp(1, 1, 70, 12, 0.0004),
        op: sp(1, 1, 140, 24, 0.002),
        fl: sp(0, 0, 100, 16, 0.05),                   // flip angle (deg) — restrained overshoot
        hx: sp(0, 0, 120, 18), hy: sp(0, 0, 120, 18), // hover tilt
        hz: sp(0, 0, 110, 17), hv: sp(0, 0, 90, 15, 0.002)
    };
    var KEYS = Object.keys(S);

    // ---------- rendering ----------
    function render() {
        var fl = S.fl.x;
        var span = flipTo - flipFrom;
        var p = span ? clamp((fl - flipFrom) / span, 0, 1) : 0;
        var pulse = Math.sin(Math.PI * p);                // 0 → 1 → 0 across the flip
        var dir = span >= 0 ? 1 : -1;

        var tz = S.tz.x + S.hz.x - 120 * pulse;           // card pulls back while turning
        var ty = S.ty.x - 12 * pulse;
        var rz = S.rz.x + dir * 3.5 * pulse;
        var sc = S.s.x - 0.035 * pulse;

        inner.style.setProperty('transform',
            'translate3d(' + S.tx.x + 'px,' + ty + 'px,' + tz + 'px) ' +
            'rotateX(' + (S.rx.x + S.hx.x) + 'deg) ' +
            'rotateY(' + (S.ry.x + S.hy.x) + 'deg) ' +
            'rotateZ(' + rz + 'deg) scale(' + sc + ') ' +
            'rotateY(' + fl + 'deg)', 'important');

        // opacity < 1 flattens the 3D scene, so it is only set during the entrance
        var o = clamp(S.op.x, 0, 1);
        inner.style.opacity = o >= 0.999 ? '' : o;

        // lighting: edge shading + moving specular highlight
        var rad = fl * Math.PI / 180;
        var c = Math.cos(rad);
        var shade = (1 - Math.abs(c)) * 0.62;
        shFront.style.opacity = shade;
        shBack.style.opacity = shade;

        var visible = c >= 0 ? fxFront : fxBack;
        var gp = 50 + 60 * Math.sin(rad) + (S.ry.x + S.hy.x) * 2.4;
        visible.style.setProperty('--gp', gp + '%');
        visible.style.setProperty('--gx', hoverX + '%');
        visible.style.setProperty('--gy', hoverY + '%');
        visible.style.setProperty('--hv', clamp(S.hv.x, 0, 1));
        // the glare band is faint at rest and strongest while the card moves
        visible.style.setProperty('--mv', clamp(0.15 + Math.abs(Math.sin(rad)) + S.hv.x * 0.45, 0.15, 1));

        // soft ground shadow follows depth / lift
        var depth = clamp(1 + tz / 1000, 0.45, 1.08);
        shadow.style.transform = 'scale(' + depth + ',' + depth + ')';
        shadow.style.opacity = clamp(S.op.x, 0, 1) * clamp(0.62 + ty / 700, 0.2, 0.7);

        // release the flip lock once the card is past the half-way point
        if (flipLock && ready && p > 0.55) flipLock = false;
    }

    function tick(now) {
        var dt = Math.min((now - last) / 1000, 1 / 30);
        last = now;
        var h = dt / 3, i, j;
        for (i = 0; i < 3; i++) for (j = 0; j < KEYS.length; j++) stepSp(S[KEYS[j]], h);
        render();

        var all = true;
        for (j = 0; j < KEYS.length; j++) if (!still(S[KEYS[j]])) { all = false; break; }

        if (all) {
            for (j = 0; j < KEYS.length; j++) { S[KEYS[j]].x = S[KEYS[j]].t; S[KEYS[j]].v = 0; }
            render();
            raf = 0;
            inner.classList.remove('animating');
            flipLock = false;
        } else {
            raf = requestAnimationFrame(tick);
        }
    }

    function kick() {
        if (!raf) { last = performance.now(); raf = requestAnimationFrame(tick); }
    }

    // ---------- DOM helpers ----------
    function el(cls) { var d = document.createElement('div'); d.className = cls; return d; }

    function build() {
        // 3D edges (thickness)
        ['e-l', 'e-r', 'e-t', 'e-b'].forEach(function (c) {
            var e = el('c3d-edge ' + c); e.setAttribute('aria-hidden', 'true'); inner.appendChild(e);
        });
        // lighting layers on both faces
        fxFront = el('c3d-fx'); shFront = el('c3d-shade');
        fxBack = el('c3d-fx'); shBack = el('c3d-shade');
        [fxFront, shFront, fxBack, shBack].forEach(function (n) { n.setAttribute('aria-hidden', 'true'); });
        front.appendChild(fxFront); front.appendChild(shFront);
        back.appendChild(fxBack); back.appendChild(shBack);
        // ground shadow
        shadow = el('c3d-shadow'); shadow.setAttribute('aria-hidden', 'true');
        container.insertBefore(shadow, inner);

        // radius for the edge strips
        var r = parseFloat(getComputedStyle(front).borderTopLeftRadius) || 24;
        inner.style.setProperty('--c3d-t', THICK + 'px');
        inner.style.setProperty('--c3d-r', r + 'px');

        // faces sit half the thickness away from the centre plane
        front.style.setProperty('transform', 'translateZ(' + THICK / 2 + 'px)', 'important');
        back.style.setProperty('transform', 'rotateY(180deg) translateZ(' + THICK / 2 + 'px)', 'important');

        inner.style.setProperty('transition', 'none', 'important');
        inner.classList.add('c3d');
    }

    // ---------- staggered content reveal (Web Animations API) ----------
    function reveal() {
        var parts = [
            '.card-top-row', '.pc-avatar-wrap', '.pc-hero-text', '.pc-xp',
            '.pc-stats', '.pc-week', '.badge-preview-row', '.pc-footer'
        ];
        parts.forEach(function (sel, i) {
            var n = front.querySelector(sel);
            if (!n) return;
            var from = sel === '.pc-avatar-wrap'
                ? { opacity: 0, transform: 'translate3d(0,0,60px) scale(.4) rotate(-25deg)' }
                : { opacity: 0, transform: 'translate3d(0,26px,40px) scale(.96)' };
            n.animate([from, { opacity: 1, transform: 'none' }], {
                duration: 720, delay: INTRO_MS + i * 85,
                easing: 'cubic-bezier(.2,1.3,.35,1)', fill: 'backwards'
            });
        });

        // delay the existing one-shot CSS animations (stat tiles, badges, chart bars)
        try {
            inner.getAnimations({ subtree: true }).forEach(function (a) {
                var t = a.effect && a.effect.getComputedTiming ? a.effect.getComputedTiming() : null;
                if (t && t.iterations !== Infinity && !a.transitionProperty) a.currentTime = -(INTRO_MS + 250);
            });
        } catch (e) { /* older browsers: animations simply play once */ }

        // replay the XP bar fill when the card is visible
        var xp = document.getElementById('frontXpFill');
        if (xp) {
            var reset = function () { xp.style.transition = 'none'; xp.style.width = '0%'; void xp.offsetWidth; xp.style.transition = ''; };
            reset(); setTimeout(reset, 180);
            setTimeout(function () { if (window.animateXPBar) window.animateXPBar('frontXpFill'); }, INTRO_MS + 400);
        }
    }

    // ---------- entrance ----------
    function enter() {
        S.tz.x = -760; S.ty.x = 150; S.rx.x = 62; S.ry.x = -48; S.rz.x = 12; S.s.x = 0.62; S.op.x = 0;
        S.op.t = 1;
        flipLock = true;
        render();
        reveal();
        kick();
        setTimeout(function () { flipLock = false; }, 1000);   // flip is allowed once the card has mostly landed
        setTimeout(function () { container.classList.add('c3d-float'); }, 1500);
    }

    // ---------- flip ----------
    function flip() {
        if (!ready || flipLock) return;
        var toBack = !inner.classList.contains('flipped');

        flipFrom = S.fl.x;
        flipTo = toBack ? 180 : 0;
        inner.classList.toggle('flipped', toBack);
        if (typeof window.updateFlipButton === 'function') window.updateFlipButton(toBack);

        // no hover tilt while turning
        S.hx.t = 0; S.hy.t = 0; S.hz.t = 0; S.hv.t = 0; S.tx.t = 0;

        if (REDUCED) {
            S.fl.x = S.fl.t = flipTo; S.fl.v = 0;
            flipFrom = flipTo;
            render();
            return;
        }
        inner.classList.add('animating');
        flipLock = true;
        S.fl.t = flipTo;
        kick();
    }

    // ---------- pointer (desktop hover) ----------
    function bindPointer() {
        if (!CAN_HOVER || REDUCED) return;

        container.addEventListener('pointermove', function (e) {
            if (e.pointerType && e.pointerType !== 'mouse') return;
            if (flipLock || Math.abs(S.fl.x - S.fl.t) > 6) return;   // not while the card is still turning
            var r = container.getBoundingClientRect();
            var nx = ((e.clientX - r.left) / r.width - 0.5) * 2;
            var ny = ((e.clientY - r.top) / r.height - 0.5) * 2;
            S.hy.t = nx * 9; S.hx.t = -ny * 8; S.tx.t = nx * 5;
            S.hz.t = 28; S.hv.t = 1;
            hoverX = (nx * 0.5 + 0.5) * 100;
            hoverY = (ny * 0.5 + 0.5) * 100;

            // keep the existing theme foil/shine variables alive
            var face = inner.classList.contains('flipped') ? back : front;
            face.style.setProperty('--foil-x', hoverX + '%');
            face.style.setProperty('--foil-y', hoverY + '%');
            kick();
        });

        container.addEventListener('pointerleave', function () {
            S.hy.t = 0; S.hx.t = 0; S.tx.t = 0; S.hz.t = 0; S.hv.t = 0;
            kick();
        });
    }

    // ---------- click / tap to flip ----------
    function bindClick() {
        var sx = 0, sy = 0;
        container.addEventListener('pointerdown', function (e) { sx = e.clientX; sy = e.clientY; });
        container.addEventListener('click', function (e) {
            if (e.target.closest('a, button, input, textarea, select, label, [role="button"]')) return;
            if (Math.abs(e.clientX - sx) > 8 || Math.abs(e.clientY - sy) > 8) return;      // it was a drag/scroll
            var sel = window.getSelection && window.getSelection().toString();
            if (sel) return;                                                               // user is selecting text
            flip();
        });
        var btn = document.getElementById('flipCardBtn');
        if (btn) btn.addEventListener('click', flip);
    }

    // ---------- init ----------
    function init() {
        container = document.querySelector('.flip-container');
        inner = document.getElementById('flipInner');
        front = document.getElementById('playerCard');
        back = document.getElementById('futureSelfCard');
        if (!container || !inner || !front || !back || inner.classList.contains('c3d')) return;

        build();
        bindClick();
        bindPointer();
        ready = true;

        if (inner.classList.contains('flipped')) { S.fl.x = S.fl.t = 180; flipFrom = flipTo = 180; }

        if (REDUCED) { render(); return; }
        enter();
    }

    window.Card3D = { init: init, flip: flip };
})();