// leaderboard.js — Phase 6: Tabs, podium, rankings, current-player highlight

let activeTab = 'global';

function renderLeaderboard() {
  const data = getLeaderboardData(activeTab);
  const top3 = data.slice(0, 3);
  const rest = data.slice(3);

  // Podium — order visually as 2nd, 1st, 3rd
  const podiumOrder = [top3[1], top3[0], top3[2]].filter(Boolean);
  const podiumRankMap = [2, 1, 3];

  document.getElementById('podium').innerHTML = podiumOrder.map((player, i) => {
    if (!player) return '';
    const rank = podiumRankMap[i];
    return `
      <div class="podium-spot podium-rank-${rank} ${player.isCurrentPlayer ? 'is-you' : ''}">
        <div class="podium-medal">${rank === 1 ? '🥇' : rank === 2 ? '🥈' : '🥉'}</div>
        <div class="podium-avatar">${player.name.slice(0, 2).toUpperCase()}</div>
        <div class="podium-name">${player.name}${player.isCurrentPlayer ? ' (You)' : ''}</div>
        <div class="podium-level">Lv.${player.level}</div>
        <div class="podium-pillar"></div>
      </div>
    `;
  }).join('');

  document.getElementById('leaderboardList').innerHTML = rest.map((player, i) => `
    <div class="lb-row ${player.isCurrentPlayer ? 'is-you' : ''}">
      <span class="lb-rank">#${i + 4}</span>
      <span class="lb-avatar">${player.name.slice(0, 2).toUpperCase()}</span>
      <span class="lb-name">${player.name}${player.isCurrentPlayer ? ' <span class="you-tag">YOU</span>' : ''}</span>
      <span class="lb-level">Lv.${player.level}</span>
      <span class="lb-xp">${player.xp.toLocaleString()} XP</span>
      <span class="lb-streak">🔥 ${player.streak}</span>
      <span class="lb-consistency">${player.consistency}%</span>
    </div>
  `).join('');
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