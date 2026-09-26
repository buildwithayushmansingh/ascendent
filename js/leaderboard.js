// leaderboard.js — Gamified avatar+podium leaderboard (v2 layout)
// Data source unchanged: getLeaderboardData() from leaderboard-data.js

let activeTab = 'global';

function levelBadgeColor(level) {
  if (level >= 20) return 'lb-badge-gold';
  if (level >= 12) return 'lb-badge-silver';
  return 'lb-badge-bronze';
}

function renderLeaderboard() {
  const data = getLeaderboardData(activeTab);
  const champion = data[0];
  const rest = data.slice(1);

  // Spotlight card for rank #1
  document.getElementById('lbSpotlight').innerHTML = `
    <div class="lb-crown">👑</div>
    <div class="lb-spotlight-avatar ${champion.isCurrentPlayer ? 'is-you' : ''}">
      ${champion.name.slice(0, 2).toUpperCase()}
    </div>
    <div class="lb-spotlight-name">${champion.name}${champion.isCurrentPlayer ? ' <span class="you-tag">YOU</span>' : ''}</div>
    <div class="lb-spotlight-title">Rank #1 · Level ${champion.level}</div>
    <div class="lb-spotlight-stats">
      <div><span>${champion.xp.toLocaleString()}</span><small>XP</small></div>
      <div><span>🔥 ${champion.streak}</span><small>Streak</small></div>
      <div><span>${champion.consistency}%</span><small>Consistency</small></div>
    </div>
  `;

  document.getElementById('leaderboardList').innerHTML = rest.map((player, i) => {
    const rank = i + 2;
    const xpForRing = Math.min(100, Math.round((player.consistency)));
    return `
      <div class="lb-row-v2 ${player.isCurrentPlayer ? 'is-you' : ''}" style="animation-delay:${i * 60}ms;">
        <span class="lb-rank-num">#${rank}</span>
        <div class="lb-avatar-v2">${player.name.slice(0, 2).toUpperCase()}</div>
        <div class="lb-row-info">
          <div class="lb-row-name">${player.name}${player.isCurrentPlayer ? ' <span class="you-tag">YOU</span>' : ''}</div>
          <div class="lb-row-meta">
            <span class="lb-level-badge ${levelBadgeColor(player.level)}">Lv.${player.level}</span>
            <span class="lb-streak-chip">🔥 ${player.streak}d</span>
          </div>
        </div>
        <div class="lb-row-bar-wrap">
          <div class="lb-row-bar-track"><div class="lb-row-bar-fill" style="width:${xpForRing}%;"></div></div>
          <span class="lb-row-bar-label">${player.consistency}%</span>
        </div>
        <span class="lb-row-xp">${player.xp.toLocaleString()} XP</span>
      </div>
    `;
  }).join('');
}

document.querySelectorAll('.lb-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    renderLeaderboard();
  });
});

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

renderLeaderboard();