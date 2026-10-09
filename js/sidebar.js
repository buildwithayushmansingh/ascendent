// =========================================================
// ASCENDENT SIDEBAR — one component for every page
// Edit the NAV list below to add/remove/rename links.
// =========================================================
(function () {
    const aside = document.getElementById('appSidebar');
    if (!aside) return;

    const svg = (d) =>
        `<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${d}</svg>`;

    const NAV = [
        { href: 'dashboard.html', label: 'Dashboard', icon: svg('<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/>') },
        { href: 'habits.html', label: 'Quests', icon: svg('<polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>') },
        { href: 'calendar.html', label: 'Calendar', icon: svg('<rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>') },
        { href: 'progress.html', label: 'Progress', icon: svg('<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>') },
        { divider: true },
        { href: 'achievements.html', label: 'Achievements', icon: svg('<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>') },
        { href: 'card.html', label: 'Player Card', icon: svg('<rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>') },
        { href: 'leaderboard.html', label: 'Leaderboard', icon: svg('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>') },
    ];

    const SETTINGS = { href: 'settings.html', label: 'Settings', icon: svg('<line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/>') };

    const page = window.location.pathname.split('/').pop() || 'dashboard.html';

    const link = (n) => `
    <a href="${n.href}" class="sb-link${n.href === page ? ' is-active' : ''}"${n.href === page ? ' aria-current="page"' : ''}>
      ${n.icon}<span>${n.label}</span>
    </a>`;

    aside.innerHTML = `
    <a href="dashboard.html" class="sb-brand">
      <span class="sb-brand-mark">✦</span><span>ASCENDENT</span>
    </a>

    <a href="settings.html" class="sb-user" aria-label="Open profile">
      <span class="sb-avatar" id="sidebarAvatar">AS</span>
      <span class="sb-user-info">
        <span class="sb-user-name" id="sidebarPlayerName">PLAYER</span>
        <span class="sb-user-meta">Level <b id="sidebarLevel">1</b> · 🔥 <b id="sidebarStreak">0</b></span>
      </span>
    </a>
    <div class="sb-xp"><div class="sb-xp-fill" id="sidebarXpFill"></div></div>
    <div class="sb-xp-text" id="sidebarXpText"></div>

    <nav class="sb-nav">
      ${NAV.map(n => n.divider ? '<div class="sb-divider"></div>' : link(n)).join('')}
    </nav>

    <div class="sb-bottom">${link(SETTINGS)}</div>
  `;

    // ---- fill player data ----
    if (typeof getDemoUser !== 'function') return;
    const user = getDemoUser();
    const $ = (id) => document.getElementById(id);

    $('sidebarPlayerName').textContent = (user.username || 'PLAYER').toUpperCase();
    $('sidebarAvatar').textContent = (user.username || 'PL').slice(0, 2).toUpperCase();
    $('sidebarLevel').textContent = user.level;
    $('sidebarStreak').textContent = user.currentStreak;
    $('sidebarXpText').textContent =
        `${user.xp.toLocaleString()} / ${user.xpToNextLevel.toLocaleString()} XP`;

    const pct = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
    requestAnimationFrame(() => { $('sidebarXpFill').style.width = pct + '%'; });

    if (typeof applyAvatarImage === 'function') applyAvatarImage('#sidebarAvatar');
})();