// card.js — Renders the full player card and the Future Self flip card
//
// Uses getDemoUser() from demo-data.js for now. Once the backend exists,
// renderCard() should fetch from GET /api/user/card instead.

function renderCard() {
  const user = getDemoUser();

  const cardEl = document.getElementById('playerCard');
  cardEl.className = `player-card tier-${user.tier.toLowerCase()} flip-front`;

  const xpPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
  const initials = (user.username || '??').slice(0, 2).toUpperCase();

  const unlockedIds = user.unlockedAchievements || [];
  const unlockedBadgesHTML = {
    count: unlockedIds.length,
    html: unlockedIds.length
      ? unlockedIds.map(id => {
        const ach = ACHIEVEMENT_LIST.find(a => a.id === id);
        return ach ? `<span class="badge-pill">${ach.icon} ${ach.name}</span>` : '';
      }).join('')
      : `<span class="badge-pill">No badges yet</span>`
  };

  cardEl.innerHTML = `
    <div class="card-banner"></div>
    <div style="display:flex; align-items:center; gap:14px; margin-bottom:16px;">
      <div class="card-avatar">${initials}</div>
      <div>
        <div style="font-weight:600; font-size:18px;">${user.username}</div>
        <div style="color:#c8a8ff;">Level ${user.level} — ${user.title}</div>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; font-size:12px; color:#9a8ac0;">
      <span>XP</span><span>${user.xp} / ${user.xpToNextLevel}</span>
    </div>
    <div class="card-xp-bar-track">
      <div class="card-xp-bar-fill" style="width:${xpPercent}%;"></div>
    </div>

    <div class="card-stats">
      <div class="card-stat-tile">
        <div style="font-size:18px; font-weight:bold;">${user.currentStreak}</div>
        <div style="font-size:11px; color:#9a8ac0;">Day streak</div>
      </div>
      <div class="card-stat-tile">
        <div style="font-size:18px; font-weight:bold;">${unlockedBadgesHTML.count}</div>
        <div style="font-size:11px; color:#9a8ac0;">Badges</div>
      </div>
      <div class="card-stat-tile">
        <div style="font-size:18px; font-weight:bold;">${user.tier}</div>
        <div style="font-size:11px; color:#9a8ac0;">Tier</div>
      </div>
    </div>

    <div class="badges-row">${unlockedBadgesHTML.html}</div>

    <div style="font-size:11px; color:#6a5a90; margin-top:12px;">Card ${user.cardId}</div>
  `;

  renderFutureSelf(user);
}

function renderFutureSelf(user) {
  const progressRate = user.xp / user.xpToNextLevel;
  const projected30 = Math.round(user.level + progressRate * 3);
  const projected90 = Math.round(user.level + progressRate * 9);
  const consistencyPercent = Math.min(100, Math.round(progressRate * 100));

  document.getElementById('futureSelfCard').innerHTML = `
    <h3 style="margin-top:0;">🔮 Your Future Self</h3>
    <p style="color:#9a8ac0; font-size:13px;">If you maintain your current consistency:</p>
    <p><b>30 Days →</b> ~Level ${projected30}</p>
    <p><b>90 Days →</b> ~Level ${projected90}</p>
    <p style="margin-top:16px; color:#4dd4c4;">Current consistency: ${consistencyPercent}%</p>
  `;
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  localStorage.clear();
  window.location.href = 'index.html';
});

document.getElementById('flipCardBtn').addEventListener('click', () => {
  document.getElementById('flipInner').classList.toggle('flipped');
});

renderCard();
// Phase 5: Share/Download/Profile Link — frontend placeholders for now.
// TODO (backend phase): wire these up to real share/export endpoints.

document.getElementById('shareCardBtn').addEventListener('click', () => {
  showToast('🔗 Share link copied (placeholder — backend needed for real links)');
});

document.getElementById('downloadCardBtn').addEventListener('click', () => {
  showToast('⬇️ Card download coming once backend image export is built');
});

document.getElementById('profileLinkBtn').addEventListener('click', () => {
  const user = getDemoUser();
  showToast(`👤 ascendent.app/${user.username} (placeholder)`);
});