// leaderboard.js — Gamified avatar+podium leaderboard (real players from the server)
// Data comes from leaderboard-data.js (GET /api/leaderboard, /api/friends).

let activeTab = 'global';

function levelBadgeColor(level) {
  if (level >= 20) return 'lb-badge-gold';
  if (level >= 12) return 'lb-badge-silver';
  return 'lb-badge-bronze';
}

function removeButton(player) {
  if (activeTab !== 'friends' || player.isCurrentPlayer) return '';
  return `<button class="lb-remove" data-user="${escapeHTML(player.username)}" title="Remove friend">✕</button>`;
}

function showMessage(text) {
  document.getElementById('lbSpotlight').innerHTML = `<div class="lb-empty">${escapeHTML(text)}</div>`;
  document.getElementById('leaderboardList').innerHTML = '';
}

async function renderLeaderboard() {
  const friendBar = document.getElementById('friendBar');
  friendBar.style.display = activeTab === 'friends' ? 'flex' : 'none';

  if (activeTab === 'squad') {
    showMessage('⚔️ Squads are coming soon. Team up with friends in a later update!');
    return;
  }

  showMessage('Loading...');
  const tabAtRequest = activeTab;
  const result = await fetchLeaderboard(activeTab);
  if (tabAtRequest !== activeTab) return;           // the player already switched tabs

  if (!result.ok) { showMessage(result.message); return; }
  const data = result.players;
  if (data.length === 0) { showMessage('No players yet. Complete a habit to get on the board!'); return; }

  const champion = data[0];
  const rest = data.slice(1);

  // Spotlight card for rank #1
  document.getElementById('lbSpotlight').innerHTML = `
    <div class="lb-crown">👑</div>
    <div class="lb-spotlight-avatar ${champion.isCurrentPlayer ? 'is-you' : ''}">
      ${escapeHTML(champion.username.slice(0, 2).toUpperCase())}
    </div>
    <div class="lb-spotlight-name">${escapeHTML(champion.username)}${champion.isCurrentPlayer ? ' <span class="you-tag">YOU</span>' : ''} ${removeButton(champion)}</div>
    <div class="lb-spotlight-title">Rank #${champion.rank} · Level ${champion.level}</div>
    <div class="lb-spotlight-stats">
      <div><span>${champion.xp.toLocaleString()}</span><small>XP</small></div>
      <div><span>🔥 ${champion.streak}</span><small>Streak</small></div>
      <div><span>${champion.consistency}%</span><small>Consistency</small></div>
    </div>
  `;

  const hint = (activeTab === 'friends' && data.length === 1)
    ? '<div class="lb-empty">Add a friend by username to compare progress.</div>' : '';

  document.getElementById('leaderboardList').innerHTML = rest.map((player, i) => {
    const bar = Math.min(100, Math.round(player.consistency));
    return `
      <div class="lb-row-v2 ${player.isCurrentPlayer ? 'is-you' : ''}" style="animation-delay:${i * 60}ms;">
        <span class="lb-rank-num">#${player.rank}</span>
        <div class="lb-avatar-v2">${escapeHTML(player.username.slice(0, 2).toUpperCase())}</div>
        <div class="lb-row-info">
          <div class="lb-row-name">${escapeHTML(player.username)}${player.isCurrentPlayer ? ' <span class="you-tag">YOU</span>' : ''} ${removeButton(player)}</div>
          <div class="lb-row-meta">
            <span class="lb-level-badge ${levelBadgeColor(player.level)}">Lv.${player.level}</span>
            <span class="lb-streak-chip">🔥 ${player.streak}d</span>
          </div>
        </div>
        <div class="lb-row-bar-wrap">
          <div class="lb-row-bar-track"><div class="lb-row-bar-fill" style="width:${bar}%;"></div></div>
          <span class="lb-row-bar-label">${player.consistency}%</span>
        </div>
        <span class="lb-row-xp">${player.xp.toLocaleString()} XP</span>
      </div>
    `;
  }).join('') + hint;
}

document.querySelectorAll('.lb-tab').forEach((tab) => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.lb-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    activeTab = tab.dataset.tab;
    renderLeaderboard();
  });
});

// ---- Friends: add / remove ----
const friendInput = document.getElementById('friendInput');
const friendMessage = document.getElementById('friendMessage');

async function handleAddFriend() {
  const name = friendInput.value.trim();
  if (!name) return;
  friendMessage.textContent = 'Adding...';
  const result = await addFriend(name);
  friendMessage.textContent = result.message;
  if (result.ok) {
    friendInput.value = '';
    renderLeaderboard();
  }
}

document.getElementById('friendAddBtn').addEventListener('click', handleAddFriend);
friendInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddFriend(); });

// Remove buttons are created dynamically, so listen on the page
document.addEventListener('click', async (e) => {
  const button = e.target.closest('.lb-remove');
  if (!button) return;
  const result = await removeFriend(button.dataset.user);
  friendMessage.textContent = result.message;
  renderLeaderboard();
});

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

renderLeaderboard();