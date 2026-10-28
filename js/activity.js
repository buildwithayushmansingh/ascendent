// activity.js — Handles the Mark Complete / Mark Missed buttons on the
// dashboard's quick-log widget. Uses the same reward engine as habits.js
// (see js/rewards.js) so feedback feels consistent across the app.
let logInProgress = false;

async function logActivity(status) {
  if (logInProgress) return;
  const habit = getSelectedHabit(getDemoUser());

  if (!habit) {
    showToast('Add a habit in Quests first.');
    return;
  }

  logInProgress = true;
  document.getElementById('excuseBox').style.display = 'none';

  try {
    if (status === 'completed') {
      const result = await completeHabitOnServer(habit.id);
      if (!result.ok) { showToast(result.message); return; }
      if (result.alreadyDone) { showToast(`${habit.name} is already done today ✅`); return; }

      const user = getDemoUser();   // now holds the server's answer
      spawnFloatingXP(result.xpEarned, document.getElementById('markComplete'));
      showToast(`STREAK 🔥 (${user.currentStreak} days)`);
      if (result.playerLeveledUp) setTimeout(() => showLevelUpOverlay(user.level), 300);
      if (result.tierChanged) setTimeout(() => showTierUpgradeOverlay(user.tier), result.playerLeveledUp ? 2100 : 300);
      showNewAchievements(result.newAchievements);
    } else {
      const reasonInput = document.getElementById('excuseReason');
      const reason = reasonInput.value.trim();
      const result = await missHabitOnServer(habit.id, reason, getDemoUser().streakShields > 0);
      if (!result.ok) { showToast(result.message); return; }
      reasonInput.value = '';

      showToast(result.shieldUsed
        ? '🛡 Streak Shield used — your streak is safe.'
        : 'Logged as missed. Streak reset.');
      showNewAchievements(result.newAchievements);
    }

    document.getElementById('dashboardMessage').textContent = '';
    loadMiniCard();
  } finally {
    logInProgress = false;
  }
}
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