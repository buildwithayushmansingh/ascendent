// habits.js — Phase 3: Habits list, Complete/Miss modals, Add/Edit/Delete
//
// TODO (backend phase): replace saveDemoUser() calls with real API requests.

let activeHabitId = null;
let selectedMissReason = null;
let editingHabitId = null;

function renderHeroStats(user) {
    const habits = user.habits || [];
    const total = habits.length;
    const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
    const avgLevel = total ? Math.round(habits.reduce((sum, h) => sum + h.level, 0) / total) : 0;

    document.getElementById('habitHeroStats').innerHTML = `
    <div class="hh-stat"><span class="hh-icon">📋</span><div><div class="hh-value">${total}</div><div class="hh-label">Active Quests</div></div></div>
    <div class="hh-stat"><span class="hh-icon">🔥</span><div><div class="hh-value">${bestStreak}</div><div class="hh-label">Best Streak</div></div></div>
    <div class="hh-stat"><span class="hh-icon">⭐</span><div><div class="hh-value">${avgLevel}</div><div class="hh-label">Avg. Level</div></div></div>
  `;
}

function renderHabitList() {
    const user = getDemoUser();
    const container = document.getElementById('habitList');

    renderHeroStats(user);

    if (!user.habits || user.habits.length === 0) {
        container.innerHTML = `
      <div class="coming-soon-panel">
        <div class="coming-soon-icon">📋</div>
        <h3>No habits yet</h3>
        <p>Click "New Bounty" to create your first quest.</p>
      </div>
    `;
        return;
    }

    container.innerHTML = user.habits.map((habit) => {
        const xpPercent = Math.min(100, Math.round((habit.xp / habit.xpToNextLevel) * 100));
        return `
      <div class="habit-card-v2">
        <div class="hc-top">
          <div class="hc-ring" style="--pct:${xpPercent};">
            <div class="hc-ring-inner">${habit.icon || '⭐'}</div>
          </div>
          <button class="hc-icon-btn hc-edit" data-id="${habit.id}" title="Edit">✏️</button>
          <button class="hc-icon-btn hc-delete" data-id="${habit.id}" title="Delete">🗑️</button>
        </div>

        <div class="hc-name">${habit.name}</div>
        <div class="hc-meta">Lv.${habit.level} • ${habit.target}min • ${habit.frequency}x/wk</div>

        <div class="hc-streak-chip">🔥 ${habit.streak} day streak</div>

        <div class="hc-actions">
          <button class="hc-action-btn hc-complete" data-id="${habit.id}">✅</button>
          <button class="hc-action-btn hc-miss" data-id="${habit.id}">❌</button>
        </div>
      </div>
    `;
    }).join('');

    document.querySelectorAll('.hc-complete').forEach(btn =>
        btn.addEventListener('click', () => openCompleteModal(btn.dataset.id)));
    document.querySelectorAll('.hc-miss').forEach(btn =>
        btn.addEventListener('click', () => openMissModal(btn.dataset.id)));
    document.querySelectorAll('.hc-edit').forEach(btn =>
        btn.addEventListener('click', () => openHabitForm(btn.dataset.id)));
    document.querySelectorAll('.hc-delete').forEach(btn =>
        btn.addEventListener('click', () => deleteHabit(btn.dataset.id)));
}

function getHabit(id) {
    return getDemoUser().habits.find(h => h.id === id);
}

// ---- Complete Quest modal ----
function openCompleteModal(id) {
    activeHabitId = id;
    const habit = getHabit(id);
    document.getElementById('completeModalBody').innerHTML = `
    <p style="font-size:1.1rem; margin-bottom:4px;">${habit.icon} <b>${habit.name}</b></p>
    <p class="subtext">${habit.target} minutes • ${habit.difficulty} difficulty</p>
    <p style="color:var(--accent-bright); font-size:1.3rem; font-family:'Cinzel',serif; margin-top:12px;">+${habit.xpPerComplete} XP</p>
  `;
    document.getElementById('completeModal').classList.add('open');
}

document.getElementById('confirmCompleteBtn').addEventListener('click', () => {
    const user = getDemoUser();
    const habit = user.habits.find(h => h.id === activeHabitId);
    if (!habit) return;

    const oldTier = user.tier;

    habit.xp += habit.xpPerComplete;
    habit.streak += 1;
    habit.completed = true;

    while (habit.xp >= habit.xpToNextLevel) {
        habit.xp -= habit.xpToNextLevel;
        habit.level += 1;
        habit.xpToNextLevel = Math.round(habit.xpToNextLevel * 1.15);
    }

    // Reflect into the overall player card too
    user.xp += habit.xpPerComplete;
    user.currentStreak += 1;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);

    let playerLeveledUp = false;
    while (user.xp >= user.xpToNextLevel) {
        user.xp -= user.xpToNextLevel;
        user.level += 1;
        user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.2);
        playerLeveledUp = true;
    }
    user.tier = getTierForLevel(user.level);
    user.title = getTitleForLevel(user.level);
    const tierChanged = user.tier !== oldTier;

    user.activityLog = user.activityLog || [];
    user.activityLog.push({
        date: new Date().toISOString(),
        category: habit.name,
        status: 'completed',
        xpEarned: habit.xpPerComplete
    });

    if (tierChanged) {
        user.tierHistory = user.tierHistory || [];
        user.tierHistory.push({ tier: user.tier, level: user.level, date: new Date().toISOString() });
    }

    saveDemoUser(user);
    checkAchievements(user);

    const confirmBtn = document.getElementById('confirmCompleteBtn');
    spawnFloatingXP(habit.xpPerComplete, confirmBtn);
    closeModals();

    // Layered reward feedback — each one is short and non-blocking
    showToast(`STREAK +1 🔥 (${habit.streak} days)`);
    if (playerLeveledUp) setTimeout(() => showLevelUpOverlay(user.level), 300);
    if (tierChanged) setTimeout(() => showTierUpgradeOverlay(user.tier), playerLeveledUp ? 2100 : 300);

    renderHabitList();
});

// ---- Missed Activity modal ----
function openMissModal(id) {
    activeHabitId = id;
    selectedMissReason = null;
    document.getElementById('missImpactBox').style.display = 'none';
    document.querySelectorAll('.reason-tile').forEach(t => t.classList.remove('selected'));
    document.getElementById('missModal').classList.add('open');
}

document.querySelectorAll('.reason-tile').forEach((tile) => {
    tile.addEventListener('click', () => {
        document.querySelectorAll('.reason-tile').forEach(t => t.classList.remove('selected'));
        tile.classList.add('selected');
        selectedMissReason = tile.dataset.reason;

        const user = getDemoUser();
        const habit = getHabit(activeHabitId);
        const impactText = user.streakShields > 0
            ? `Your ${habit.streak}-day streak would break — but you have ${user.streakShields} Streak Shield available.`
            : `Your ${habit.streak}-day streak will reset to 0. No shields available.`;

        document.getElementById('missImpactText').textContent = impactText;
        document.getElementById('useShieldBtn').style.display = user.streakShields > 0 ? 'block' : 'none';
        document.getElementById('missImpactBox').style.display = 'block';
    });
});

function finalizeMiss(useShield) {
    const user = getDemoUser();
    const habit = user.habits.find(h => h.id === activeHabitId);
    if (!habit) return;

    habit.missedReasons = habit.missedReasons || [];
    habit.missedReasons.push({ reason: selectedMissReason, date: new Date().toISOString() });

    user.activityLog = user.activityLog || [];
    user.activityLog.push({
        date: new Date().toISOString(),
        category: habit.name,
        status: 'missed',
        reason: selectedMissReason
    });

    if (useShield && user.streakShields > 0) {
        user.streakShields -= 1;
        showToast('🛡 Streak Shield used — your streak is safe.');
    } else {
        habit.streak = 0;
        user.currentStreak = 0;
        showToast('Streak reset. Tomorrow is a new quest.');
    }

    saveDemoUser(user);
    closeModals();
    renderHabitList();
}
document.getElementById('useShieldBtn').addEventListener('click', () => finalizeMiss(true));
document.getElementById('confirmMissBtn').addEventListener('click', () => finalizeMiss(false));

// ---- Add / Edit Habit modal ----
document.getElementById('addHabitBtn').addEventListener('click', () => openHabitForm(null));

function openHabitForm(id) {
    editingHabitId = id;
    const isEdit = Boolean(id);
    document.getElementById('habitFormTitle').textContent = isEdit ? 'Edit Habit' : 'Add Habit';

    if (isEdit) {
        const habit = getHabit(id);
        document.getElementById('habitNameInput').value = habit.name;
        document.getElementById('habitIconInput').value = habit.icon;
        document.getElementById('habitTargetInput').value = habit.target;
        document.getElementById('habitFrequencyInput').value = habit.frequency;
        document.getElementById('habitDifficultyInput').value = habit.difficulty;
    } else {
        document.getElementById('habitNameInput').value = '';
        document.getElementById('habitIconInput').value = '⭐';
        document.getElementById('habitTargetInput').value = 30;
        document.getElementById('habitFrequencyInput').value = 5;
        document.getElementById('habitDifficultyInput').value = 'Normal';
    }

    document.getElementById('saveHabitBtn').textContent = isEdit ? 'Save Changes' : 'Create Habit';
    document.getElementById('habitFormModal').classList.add('open');
}

document.getElementById('saveHabitBtn').addEventListener('click', () => {
    const name = document.getElementById('habitNameInput').value.trim();
    if (!name) return;

    const difficultySelect = document.getElementById('habitDifficultyInput');
    const difficulty = difficultySelect.value;
    const xpPerComplete = Number(difficultySelect.selectedOptions[0].dataset.xp);

    const user = getDemoUser();

    if (editingHabitId) {
        const habit = user.habits.find(h => h.id === editingHabitId);
        habit.name = name;
        habit.icon = document.getElementById('habitIconInput').value || '⭐';
        habit.target = Number(document.getElementById('habitTargetInput').value);
        habit.frequency = Number(document.getElementById('habitFrequencyInput').value);
        habit.difficulty = difficulty;
        habit.xpPerComplete = xpPerComplete;
    } else {
        user.habits.push({
            id: name.toLowerCase().replace(/\s+/g, '-') + '-' + Date.now(),
            name,
            icon: document.getElementById('habitIconInput').value || '⭐',
            target: Number(document.getElementById('habitTargetInput').value),
            frequency: Number(document.getElementById('habitFrequencyInput').value),
            difficulty,
            xpPerComplete,
            level: 1,
            xp: 0,
            xpToNextLevel: 100,
            streak: 0,
            completed: false,
            missedReasons: []
        });
    }

    saveDemoUser(user);
    closeModals();
    renderHabitList();
});

function deleteHabit(id) {
    if (!confirm('Delete this habit? This cannot be undone.')) return;
    const user = getDemoUser();
    user.habits = user.habits.filter(h => h.id !== id);
    saveDemoUser(user);
    renderHabitList();
}

// ---- Modal close handling ----
function closeModals() {
    document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('open'));
}

document.querySelectorAll('[data-close-modal]').forEach(btn =>
    btn.addEventListener('click', closeModals));

document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeModals();
    });
});

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

renderHabitList();