// =========================================================
// card-themes.js — builds the decoration layers for the 4 card themes
//   arcade · realm · cyber · legend
// Runs once (from card.js → initializeCard). Every piece is hidden by CSS
// unless its theme is active, so switching theme is just an attribute change.
// Reads the real tier / numbers from the card DOM — nothing is hardcoded.
// =========================================================
(function () {
    'use strict';

    var TIERS = {
        bronze: { rank: 1, stars: 2, rar: 'R' },
        silver: { rank: 2, stars: 3, rar: 'SR' },
        gold: { rank: 3, stars: 4, rar: 'SSR' },
        platinum: { rank: 4, stars: 5, rar: 'SSR' },
        legendary: { rank: 5, stars: 5, rar: 'UR' }
    };

    function make(tag, cls, html) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (html) n.innerHTML = html;
        return n;
    }
    // stable pseudo-random numbers (so the layout never jumps between renders)
    function rnd(i, a, b) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; x -= Math.floor(x); return a + x * (b - a); }

    function heart() {
        var map = ['.XX...XX.', 'XXXX.XXXX', 'XXXXXXXXX', 'XXXXXXXXX', '.XXXXXXX.', '..XXXXX..', '...XXX...', '....X....'];
        var r = '';
        map.forEach(function (row, y) { for (var x = 0; x < row.length; x++) if (row[x] === 'X') r += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; });
        return '<svg viewBox="0 0 9 8" shape-rendering="crispEdges" fill="#ff3cac">' + r + '</svg>';
    }

    function bgHTML() {
        var i, out = '';
        // arcade
        var stars = '';
        for (i = 0; i < 16; i++) stars += '<i class="ar-star" style="left:' + rnd(i, 4, 96).toFixed(1) + '%;top:' + rnd(i + 40, 3, 70).toFixed(1) + '%;animation-delay:' + rnd(i + 9, 0, 1.6).toFixed(2) + 's"></i>';
        out += '<div class="t-arcade"><div class="ar-floor"></div>' + stars + '</div>';
        // realm
        var ff = '';
        for (i = 0; i < 12; i++) ff += '<i class="rm-ff" style="left:' + rnd(i + 5, 6, 94).toFixed(1) + '%;top:' + rnd(i + 70, 45, 96).toFixed(1) + '%;--dur:' + rnd(i, 6, 10).toFixed(1) + 's;--delay:' + rnd(i + 20, 0, 7).toFixed(1) + 's;--dx:' + rnd(i + 3, -30, 30).toFixed(0) + 'px"></i>';
        out += '<div class="t-realm"><div class="rm-stone"></div>' + ff + '</div>';
        // cyber
        out += '<div class="t-cyber"><div class="cy-glow"></div><div class="cy-hex"></div></div>';
        // legend
        var ls = '';
        for (i = 0; i < 9; i++) { var s = rnd(i + 11, 9, 19).toFixed(0); ls += '<i class="lg-star" style="left:' + rnd(i + 2, 5, 93).toFixed(1) + '%;top:' + rnd(i + 31, 4, 90).toFixed(1) + '%;width:' + s + 'px;height:' + s + 'px;animation-delay:' + rnd(i, 0, 2.4).toFixed(2) + 's"></i>'; }
        out += '<div class="t-legend"><div class="lg-rays"></div>' + ls + '</div>';
        return out;
    }

    function fgHTML(isFront, rarity) {
        var out = '';
        out += '<div class="t-arcade"><div class="ar-crt"></div><div class="ar-roll"></div>' +
            '<i class="ar-corner a"></i><i class="ar-corner b"></i><i class="ar-corner c"></i><i class="ar-corner d"></i></div>';
        out += '<div class="t-realm"><div class="rm-frame"></div>' +
            '<i class="rm-corner a"></i><i class="rm-corner b"></i><i class="rm-corner c"></i><i class="rm-corner d"></i>' +
            '<i class="rm-gem t"></i><i class="rm-gem b"></i></div>';
        out += '<div class="t-cyber">' +
            '<svg class="cy-frame" viewBox="0 0 400 570" preserveAspectRatio="none" aria-hidden="true">' +
            '<path d="M30 1.5H398.5V540L370 568.5H1.5V30Z" fill="none" stroke="#ff7a00" stroke-width="2" vector-effect="non-scaling-stroke"/>' +
            '<path d="M34 9H391V536L366 561H9V34Z" fill="none" stroke="rgba(255,122,0,.35)" stroke-width="1" vector-effect="non-scaling-stroke"/></svg>' +
            '<div class="cy-hazard t"></div><div class="cy-hazard b"></div><div class="cy-ruler l"></div><div class="cy-ruler r"></div><div class="cy-scan"></div></div>';
        out += '<div class="t-legend"><div class="lg-foil"></div><div class="lg-frame"></div>' +
            '<i class="lg-corner a"></i><i class="lg-corner b"></i><i class="lg-corner c"></i><i class="lg-corner d"></i>' +
            (isFront ? '<div class="lg-ssr">' + rarity + '</div>' : '') + '</div>';
        return out;
    }

    function runesSVG() {
        var d = '', i;
        for (i = 0; i < 8; i++) {
            var a = i * 45 * Math.PI / 180, x = 62 + 59 * Math.sin(a), y = 62 - 59 * Math.cos(a);
            d += '<rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="6" height="6" transform="rotate(45 ' + x + ' ' + y + ')" fill="#3ddc97" stroke="#ffd479" stroke-width="1"/>';
        }
        return '<svg class="th-x x-realm th-runes" viewBox="0 0 124 124" aria-hidden="true">' +
            '<circle cx="62" cy="62" r="59" fill="none" stroke="#ffd479" stroke-width="1.5" stroke-dasharray="1.5 7" stroke-linecap="round" opacity=".9"/>' +
            '<circle cx="62" cy="62" r="55" fill="none" stroke="rgba(255,212,121,.35)" stroke-width="1"/>' + d + '</svg>';
    }

    function reticleSVG() {
        return '<svg class="th-x x-cyber th-reticle" viewBox="0 0 130 130" aria-hidden="true">' +
            '<circle cx="65" cy="65" r="62" fill="none" stroke="#ff7a00" stroke-width="1.5" stroke-dasharray="14 8 3 8" opacity=".9"/>' +
            '<path d="M65 0v9M65 121v9M0 65h9M121 65h9" stroke="#ffd500" stroke-width="2"/></svg>';
    }

    function build() {
        var front = document.getElementById('playerCard');
        var back = document.getElementById('futureSelfCard');
        if (!front || !back || front.querySelector('.th-bg')) return;

        var pill = front.querySelector('.tier-pill');
        var tierKey = ((pill && pill.textContent) || 'bronze').trim().split(/\s+/)[0].toLowerCase();
        var t = TIERS[tierKey] || TIERS.bronze;

        [front, back].forEach(function (face, idx) {
            var isFront = idx === 0;
            face.insertBefore(make('div', 'th-bg', bgHTML()), face.firstChild);
            face.appendChild(make('div', 'th-fg', fgHTML(isFront, t.rar)));
        });

        // ----- extras that live inside the existing front layout -----
        var lives = make('div', 'th-x x-arcade th-lives', '<i>' + heart() + '</i><i>' + heart() + '</i><i>' + heart() + '</i>');
        var badgeRow = front.querySelector('.badge-preview-row');
        if (badgeRow) badgeRow.appendChild(lives);

        var avatarWrap = front.querySelector('.pc-avatar-wrap');
        if (avatarWrap) {
            avatarWrap.insertAdjacentHTML('beforeend', runesSVG());
            avatarWrap.insertAdjacentHTML('beforeend', reticleSVG());
        }

        var heroText = front.querySelector('.pc-hero-text');
        if (heroText) {
            var rank = '', stars = '', i;
            for (i = 1; i <= 5; i++) rank += '<i class="' + (i <= t.rank ? '' : 'off') + '"></i>';
            for (i = 1; i <= 5; i++) stars += '<i class="' + (i <= t.stars ? '' : 'off') + '">★</i>';
            heroText.appendChild(make('div', 'th-x x-cyber th-rank', rank + '<span>RANK ' + tierKey.toUpperCase() + '</span>'));
            heroText.appendChild(make('div', 'th-x x-legend th-stars', stars));
        }
    }

    window.CardThemeDeco = { build: build };
})();