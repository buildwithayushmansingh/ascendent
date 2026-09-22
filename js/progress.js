// progress.js — Phase 5: Analytics computed from user.activityLog

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getLastNDays(n) {
    const days = [];
    for (let i = n - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        days.push(d);
    }
    return days;
}

function isSameDay(dateA, dateB) {
    return dateA.toDateString() === dateB.toDateString();
}

function renderProgress() {
    const user = getDemoUser();
    const log = user.activityLog || [];
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const thisWeekLog = log.filter(e => new Date(e.date) >= oneWeekAgo);
    const weeklyXP = thisWeekLog.filter(e => e.status === 'completed').reduce((sum, e) => sum + (e.xpEarned || 0), 0);

    document.getElementById('weeklyXPStat').textContent = weeklyXP;
    document.getElementById('currentStreakStat').textContent = `${user.currentStreak} days`;
    document.getElementById('bestStreakStat').textContent = `${user.longestStreak} days`;

    // Heatmap: count of completed activities per day, last 7 days
    const days = getLastNDays(7);
    document.getElementById('heatmapRow').innerHTML = days.map((day) => {
        const count = log.filter(e => e.status === 'completed' && isSameDay(new Date(e.date), day)).length;
        const level = count === 0 ? 0 : count === 1 ? 1 : count === 2 ? 2 : 3;
        return `
      <div class="heatmap-cell heat-${level}" title="${count} completed">
        <span class="heatmap-day-label">${DAY_LABELS[(day.getDay() + 6) % 7]}</span>
      </div>
    `;
    }).join('');

    // Weekly recap
    const completedThisWeek = thisWeekLog.filter(e => e.status === 'completed');
    if (completedThisWeek.length === 0) {
        document.getElementById('weeklyRecap').innerHTML = `<p class="subtext">No activity logged yet this week. Complete a quest to see your recap!</p>`;
    } else {
        const categoryCounts = {};
        completedThisWeek.forEach(e => { categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1; });
        const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];

        document.getElementById('weeklyRecap').innerHTML = `
      <p>✨ <b>+${weeklyXP} XP</b> this week</p>
      <p>🎯 <b>${completedThisWeek.length}</b> activities completed</p>
      <p>🏔️ <b>${user.longestStreak} day</b> best streak</p>
      <p>💡 Most active: <b>${topCategory[0]}</b> (${topCategory[1]}x)</p>
    `;
    }

    // Category progress (from habits array — always current, not just this week)
    const habits = user.habits || [];
    document.getElementById('categoryProgress').innerHTML = habits.length === 0
        ? `<p class="subtext">No habits tracked yet.</p>`
        : habits.map((h) => {
            const pct = Math.min(100, Math.round((h.xp / h.xpToNextLevel) * 100));
            return `
          <div class="category-progress-row">
            <span class="category-progress-label">${h.icon} ${h.name} — Lv.${h.level}</span>
            <div class="card-xp-bar-track"><div class="card-xp-bar-fill" style="width:${pct}%;"></div></div>
          </div>
        `;
        }).join('');

    // Excuse history
    const excuses = log.filter(e => e.status === 'missed').slice().reverse();
    document.getElementById('excuseHistory').innerHTML = excuses.length === 0
        ? `<p class="subtext">No missed days yet — keep it up!</p>`
        : excuses.slice(0, 8).map(e => `
        <div class="excuse-row">
          <span>${e.category}</span>
          <span class="excuse-reason">${e.reason || 'No reason given'}</span>
          <span class="excuse-date">${new Date(e.date).toLocaleDateString()}</span>
        </div>
      `).join('');

    // Card evolution timeline
    const tierHistory = user.tierHistory || [];
    document.getElementById('cardEvolution').innerHTML = tierHistory.map(t => `
    <div class="evolution-row">
      <span class="evolution-tier">${t.tier}</span>
      <span class="subtext">reached at Level ${t.level} — ${new Date(t.date).toLocaleDateString()}</span>
    </div>
  `).join('');
}

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

renderProgress();