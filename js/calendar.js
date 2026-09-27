// calendar.js — Daily Activity History calendar.
//
// Data source: user.activityLog (the SAME array Dashboard/Habits/Progress
// already write to and read from) — so the calendar is always in sync with
// the rest of the app, with no separate/duplicate data system.
//
// TODO (backend phase): replace buildDayMap() with a fetch to
// GET /api/calendar?month=YYYY-MM and use its response shape directly —
// the rendering functions below already expect the same
// { "YYYY-MM-DD": { status, completion, totalTime, xp, activities, reason } }
// structure described in the calendar spec.

let calViewDate = new Date();
let calSelectedDateKey = null;

function dateKey(d) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Aggregate the flat activityLog into one entry per day.
function buildDayMap(log) {
  const map = {};
  log.forEach((entry) => {
    const key = dateKey(new Date(entry.date));
    if (!map[key]) map[key] = { completed: [], missed: [] };
    if (entry.status === 'completed') {
      map[key].completed.push(entry);
    } else {
      map[key].missed.push(entry);
    }
  });

  const result = {};
  Object.entries(map).forEach(([key, { completed, missed }]) => {
    const total = completed.length + missed.length;
    const completionPct = total ? Math.round((completed.length / total) * 100) : 0;
    let status = 'missed';
    if (completionPct === 100) status = 'completed';
    else if (completionPct > 0) status = 'partial';

    result[key] = {
      status,
      completion: completionPct,
      totalXP: completed.reduce((sum, e) => sum + (e.xpEarned || 0), 0),
      activities: completed.map(e => ({ name: e.category, xpEarned: e.xpEarned })),
      missedActivities: missed.map(e => ({ name: e.category, reason: e.reason })),
    };
  });
  return result;
}

function renderMonthlySummary(user, dayMap) {
  const entries = Object.values(dayMap);
  const completedDays = entries.filter(e => e.status === 'completed').length;
  const missedDays = entries.filter(e => e.status === 'missed').length;
  const partialDays = entries.filter(e => e.status === 'partial').length;
  const totalXP = entries.reduce((sum, e) => sum + e.totalXP, 0);

  document.getElementById('calSummary').innerHTML = `
    <div class="cal-sum-item"><span class="cal-sum-icon">✅</span><div><div class="cal-sum-value">${completedDays}</div><div class="cal-sum-label">Completed Days</div></div></div>
    <div class="cal-sum-item"><span class="cal-sum-icon">❌</span><div><div class="cal-sum-value">${missedDays}</div><div class="cal-sum-label">Missed Days</div></div></div>
    <div class="cal-sum-item"><span class="cal-sum-icon">🌓</span><div><div class="cal-sum-value">${partialDays}</div><div class="cal-sum-label">Partial Days</div></div></div>
    <div class="cal-sum-item"><span class="cal-sum-icon">🔥</span><div><div class="cal-sum-value">${user.currentStreak}</div><div class="cal-sum-label">Current Streak</div></div></div>
    <div class="cal-sum-item"><span class="cal-sum-icon">🏔️</span><div><div class="cal-sum-value">${user.longestStreak}</div><div class="cal-sum-label">Longest Streak</div></div></div>
    <div class="cal-sum-item"><span class="cal-sum-icon">✨</span><div><div class="cal-sum-value">${totalXP.toLocaleString()}</div><div class="cal-sum-label">XP This Month</div></div></div>
  `;
}

function renderCalendarGrid(dayMap) {
  const year = calViewDate.getFullYear();
  const month = calViewDate.getMonth();
  document.getElementById('calMonthLabel').textContent =
    calViewDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  const firstDay = new Date(year, month, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday-first grid
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const today = new Date();
  const todayKey = dateKey(today);

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push('<div class="cal-cell cal-cell-blank"></div>');

  for (let d = 1; d <= daysInMonth; d++) {
    const cellDate = new Date(year, month, d);
    const key = dateKey(cellDate);
    const info = dayMap[key];
    const isFuture = cellDate > today && key !== todayKey;
    const isToday = key === todayKey;

    let statusClass = 'cal-future';
    let icon = '';
    if (!isFuture) {
      if (info) {
        statusClass = `cal-${info.status}`;
        icon = info.status === 'completed' ? '✓' : info.status === 'missed' ? '×' : '';
      } else {
        statusClass = 'cal-none';
      }
    }

    const tooltip = isFuture
      ? 'Upcoming day'
      : info
        ? `${info.status} · ${info.completion}% · +${info.totalXP} XP`
        : 'No activity recorded';

    cells.push(`
      <button class="cal-cell ${statusClass} ${isToday ? 'cal-today' : ''}" data-key="${key}" title="${tooltip}">
        <span class="cal-cell-num">${d}</span>
        ${icon ? `<span class="cal-cell-icon">${icon}</span>` : ''}
        ${isToday ? '<span class="cal-today-ring"></span>' : ''}
      </button>
    `);
  }

  document.getElementById('calGrid').innerHTML = cells.join('');

  document.querySelectorAll('.cal-cell[data-key]').forEach((cell) => {
    cell.addEventListener('click', () => {
      document.querySelectorAll('.cal-cell').forEach(c => c.classList.remove('cal-selected'));
      cell.classList.add('cal-selected');
      calSelectedDateKey = cell.dataset.key;
      renderDailyPanel(dayMap);
    });
  });
}

function renderDailyPanel(dayMap) {
  const panel = document.getElementById('calDailyPanel');
  if (!calSelectedDateKey) return;

  const [y, m, d] = calSelectedDateKey.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  const dateLabel = date.toLocaleDateString('default', { month: 'short', day: 'numeric', year: 'numeric' });
  const dayLabel = date.toLocaleDateString('default', { weekday: 'long' });

  const today = new Date();
  const isFuture = date > today && calSelectedDateKey !== dateKey(today);
  const info = dayMap[calSelectedDateKey];

  let bodyHTML = '';

  if (isFuture) {
    bodyHTML = `
      <div class="cal-empty-state">
        <div class="cal-empty-icon">🔮</div>
        <div class="cal-status-badge cal-badge-future">UPCOMING DAY</div>
        <p>Activity data will appear here after the day is completed.</p>
      </div>
    `;
  } else if (!info) {
    bodyHTML = `
      <div class="cal-empty-state">
        <div class="cal-empty-icon">📭</div>
        <div class="cal-status-badge cal-badge-none">NO ACTIVITY RECORDED</div>
        <p>No activity was recorded for this day.</p>
      </div>
    `;
  } else if (info.status === 'completed' || info.status === 'partial') {
    bodyHTML = `
      <div class="cal-status-badge ${info.status === 'completed' ? 'cal-badge-completed' : 'cal-badge-partial'}">
        ${info.status === 'completed' ? '✓ COMPLETED' : `🌓 PARTIAL — ${info.completion}%`}
      </div>
      <h4 class="cal-section-title">Activities</h4>
      <ul class="cal-activity-list">
        ${info.activities.map(a => `<li>${a.name} <span>+${a.xpEarned} XP</span></li>`).join('') || '<li class="subtext">None completed</li>'}
      </ul>
      ${info.missedActivities.length ? `
        <h4 class="cal-section-title">Missed</h4>
        <ul class="cal-activity-list cal-activity-missed">
          ${info.missedActivities.map(a => `<li>${a.name}${a.reason ? ` <span>— ${a.reason}</span>` : ''}</li>`).join('')}
        </ul>
      ` : ''}
      <div class="cal-stat-row">
        <div><div class="cal-stat-value">${info.completion}%</div><div class="cal-stat-label">Completion</div></div>
        <div><div class="cal-stat-value">+${info.totalXP}</div><div class="cal-stat-label">XP Earned</div></div>
      </div>
    `;
  } else {
    bodyHTML = `
      <div class="cal-status-badge cal-badge-missed">× MISSED</div>
      <h4 class="cal-section-title">Missed Activities</h4>
      <ul class="cal-activity-list cal-activity-missed">
        ${info.missedActivities.map(a => `<li>${a.name}${a.reason ? ` <span>— ${a.reason}</span>` : ''}</li>`).join('')}
      </ul>
      <div class="cal-stat-row">
        <div><div class="cal-stat-value">0%</div><div class="cal-stat-label">Completion</div></div>
        <div><div class="cal-stat-value">0</div><div class="cal-stat-label">XP Earned</div></div>
      </div>
    `;
  }

  panel.innerHTML = `
    <div class="cal-daily-header">
      <div class="cal-daily-date">${dateLabel}</div>
      <div class="cal-daily-day">${dayLabel}</div>
    </div>
    ${bodyHTML}
  `;
  panel.classList.add('cal-panel-show');
}

function goToMonth(offset) {
  calViewDate.setMonth(calViewDate.getMonth() + offset);
  refreshCalendar();
}

function refreshCalendar() {
  const user = getDemoUser();
  const dayMap = buildDayMap(user.activityLog || []);
  renderMonthlySummary(user, dayMap);
  renderCalendarGrid(dayMap);
}

document.getElementById('calPrevBtn').addEventListener('click', () => goToMonth(-1));
document.getElementById('calNextBtn').addEventListener('click', () => goToMonth(1));
document.getElementById('calTodayBtn').addEventListener('click', () => {
  calViewDate = new Date();
  calSelectedDateKey = dateKey(new Date());
  refreshCalendar();
  const user = getDemoUser();
  renderDailyPanel(buildDayMap(user.activityLog || []));
});

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

refreshCalendar();