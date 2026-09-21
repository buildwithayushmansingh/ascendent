// activity.js — Handles the Mark Complete / Mark Missed buttons on the
// dashboard's quick-log widget. Uses the same reward engine as habits.js
// (see js/rewards.js) so feedback feels consistent across the app.

function logActivity(status) {
  const user = getDemoUser();
  const oldTier = user.tier;
  let xpEarned = 0;
  let playerLeveledUp = false;

  if (status === 'completed') {
    const multiplier = 1 + Math.min(user.currentStreak * 0.1, 1);
    xpEarned = Math.round(100 * multiplier);

    user.xp += xpEarned;
    user.currentStreak += 1;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);

    while (user.xp >= user.xpToNextLevel) {
      user.xp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.2);
      playerLeveledUp = true;
    }
  } else if (status === 'missed') {
    if (user.streakShields > 0) {
      user.streakShields -= 1;
    } else {
      user.currentStreak = 0;
    }
  }

  user.tier = getTierForLevel(user.level);
  user.title = getTitleForLevel(user.level);
  const tierChanged = user.tier !== oldTier;

  saveDemoUser(user);
  document.getElementById('excuseBox').style.display = 'none';

  if (status === 'completed') {
    spawnFloatingXP(xpEarned, document.getElementById('markComplete'));
    showToast(`STREAK +1 🔥 (${user.currentStreak} days)`);
    if (playerLeveledUp) setTimeout(() => showLevelUpOverlay(user.level), 300);
    if (tierChanged) setTimeout(() => showTierUpgradeOverlay(user.tier), playerLeveledUp ? 2100 : 300);
    document.getElementById('dashboardMessage').textContent = '';
  } else {
    showToast('Logged as missed.');
    document.getElementById('dashboardMessage').textContent = '';
  }

  loadMiniCard();
}

document.getElementById('markComplete').addEventListener('click', () => {
  logActivity('completed');
});

document.getElementById('markMissed').addEventListener('click', () => {
  document.getElementById('excuseBox').style.display = 'flex';
});

document.getElementById('submitExcuse').addEventListener('click', () => {
  logActivity('missed');
});