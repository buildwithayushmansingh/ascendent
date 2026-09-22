// card.js — Player Card, rendered entirely from SAMPLE_CARD_DATA.
//
// This is a frontend prototype: real backend/user data isn't available
// yet, so every value on the card comes from the SAMPLE_CARD_DATA object
// below instead of being hardcoded into the HTML. When the backend
// exists, replace the SAMPLE_CARD_DATA assignment with a real
// GET /api/user/card fetch that returns the same shape — every render
// function below already reads from a single `data` object, so nothing
// else needs to change.

const SAMPLE_CARD_DATA = {
  name: "Ayushman Singh",
  username: "ayushmansinghrajput3019",
  initials: "AS",
  title: "Consistency Warrior",
  role: "Consistency Player / Habit Builder",
  tier: "Gold",
  cardId: "ASC-001293",

  level: 8,
  nextLevel: 9,
  xp: 7640,
  xpToNextLevel: 10000,

  currentStreak: 27,
  longestStreak: 41,
  consistency: 86,

  completedActivities: 156,
  completedHabits: 124,
  totalTasks: 145,
  completionRate: 86,

  currentChallenge: "30-Day Consistency Challenge",
  challengeCurrent: 24,
  challengeTotal: 30,

  weeklyXP: 1240,
  monthlyXP: 5680,
  favoriteActivity: "Coding",
  dailyGoal: 3,
  memberSince: "September 2026",

  badges: [
    { icon: '🏆', name: 'First Step', desc: 'Completed your first activity' },
    { icon: '🔥', name: '7 Day Warrior', desc: 'Maintained a 7-day streak' },
    { icon: '⚡', name: '14 Day Streak', desc: 'Maintained a 14-day streak' },
    { icon: '🛡', name: '30 Day Challenger', desc: 'Took on the 30-day challenge' },
    { icon: '👑', name: 'Consistency Master', desc: 'Sustained long-term consistency' },
    { icon: '💎', name: 'XP Hunter', desc: 'Earned massive XP milestones' }
  ],

  futureSelf: [
    { label: '30 Days', level: 10, xp: '9,800+', note: '30 Day Streak' },
    { label: '60 Days', level: 12, xp: '12,500+', note: 'Consistency Master' },
    { label: '90 Days', level: 14, xp: '16,000+', note: 'Elite Tier' }
  ]
};

// ============== FRONT ==============
function renderCard() {
  const data = SAMPLE_CARD_DATA;
  const cardEl = document.getElementById('playerCard');
  cardEl.className = `player-card tier-${data.tier.toLowerCase()} flip-front`;

  const xpPercent = Math.min(100, Math.round((data.xp / data.xpToNextLevel) * 100));
  const previewBadges = data.badges.slice(0, 4);
  const extraCount = data.badges.length - previewBadges.length;

  cardEl.innerHTML = `
    <div class="tilt-wrapper">
      <div class="card-top-row">
        <span class="identity-label">ASCENDENT PLAYER</span>
        <span class="tier-pill">${data.tier.toUpperCase()} TIER</span>
      </div>

      <div class="card-corner corner-tl"></div>
      <div class="card-corner corner-tr"></div>
      <div class="card-corner corner-bl"></div>
      <div class="card-corner corner-br"></div>

      <div class="card-identity-row">
        <div class="card-avatar">${data.initials}</div>
        <div>
          <div class="card-name">${data.name}</div>
          <div class="card-username">@${data.username}</div>
          <div class="card-title-pill">${data.title}</div>
        </div>
      </div>

      <div class="card-level-row">
        <span class="card-level-num">LVL ${data.level}</span>
        <span class="card-level-next">Next: Level ${data.nextLevel}</span>
      </div>

      <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary);">
        <span>XP</span><span>${data.xp.toLocaleString()} / ${data.xpToNextLevel.toLocaleString()}</span>
      </div>
      <div class="card-xp-bar-track">
        <div class="card-xp-bar-fill" id="frontXpFill" style="width:0%;" data-target="${xpPercent}"></div>
      </div>

      <div class="card-stats">
        <div class="card-stat-tile">
          <div class="stat-big">${data.currentStreak}</div>
          <div class="stat-small">Current Streak</div>
        </div>
        <div class="card-stat-tile">
          <div class="stat-big">${data.longestStreak}</div>
          <div class="stat-small">Longest Streak</div>
        </div>
        <div class="card-stat-tile">
          <div class="stat-big">${data.consistency}%</div>
          <div class="stat-small">Consistency</div>
        </div>
      </div>

      <div class="badge-preview-row">
        ${previewBadges.map(b => `<span class="badge-circle" title="${b.name}">${b.icon}</span>`).join('')}
        ${extraCount > 0 ? `<span class="badge-circle badge-more">+${extraCount}</span>` : ''}
      </div>

      <div class="card-footer-row">
        <span>Card ${data.cardId}</span>
        <span>${data.currentChallenge.split(' ')[0]}-Day Challenge: ${data.challengeCurrent}/${data.challengeTotal}</span>
      </div>
    </div>
  `;

  animateXPBar('frontXpFill');
}

// ============== BACK (Player Profile + Achievements + Progress + Future Self) ==============
function renderBack() {
  const data = SAMPLE_CARD_DATA;
  const backEl = document.getElementById('futureSelfCard');
  backEl.className = `player-card tier-${data.tier.toLowerCase()} flip-back`;

  const challengePercent = Math.round((data.challengeCurrent / data.challengeTotal) * 100);

  backEl.innerHTML = `
    <div class="tilt-wrapper back-scroll">
      <div class="back-section-title">📊 Player Stats</div>
      <div class="stat-grid">
        <div class="stat-grid-item"><span>Level</span><b>${data.level}</b></div>
        <div class="stat-grid-item"><span>Current XP</span><b>${data.xp.toLocaleString()}</b></div>
        <div class="stat-grid-item"><span>Next Level</span><b>${data.nextLevel}</b></div>
        <div class="stat-grid-item"><span>Current Streak</span><b>${data.currentStreak} days</b></div>
        <div class="stat-grid-item"><span>Longest Streak</span><b>${data.longestStreak} days</b></div>
        <div class="stat-grid-item"><span>Consistency</span><b>${data.consistency}%</b></div>
        <div class="stat-grid-item"><span>Activities Done</span><b>${data.completedActivities}</b></div>
        <div class="stat-grid-item"><span>Completion Rate</span><b>${data.completionRate}%</b></div>
      </div>

      <div class="back-section-title">🏅 Achievements</div>
      <div class="achievement-mini-grid">
        ${data.badges.map(b => `
          <div class="achievement-mini">
            <span class="achievement-mini-icon">${b.icon}</span>
            <div>
              <div class="achievement-mini-name">${b.name}</div>
              <div class="achievement-mini-desc">${b.desc}</div>
            </div>
          </div>
        `).join('')}
      </div>

      <div class="back-section-title">📈 Progress</div>
      <div class="challenge-box">
        <div class="challenge-label">${data.currentChallenge}</div>
        <div class="card-xp-bar-track">
          <div class="card-xp-bar-fill" id="challengeFill" style="width:0%;" data-target="${challengePercent}"></div>
        </div>
        <div class="challenge-count">${data.challengeCurrent} / ${data.challengeTotal} Days</div>
      </div>
      <div class="mini-stats-row">
        <span>Weekly XP: <b>${data.weeklyXP.toLocaleString()}</b></span>
        <span>Monthly XP: <b>${data.monthlyXP.toLocaleString()}</b></span>
      </div>

      <div class="back-section-title">👤 Player Identity</div>
      <div class="identity-list">
        <div><span>Player</span><b>${data.name}</b></div>
        <div><span>Username</span><b>@${data.username}</b></div>
        <div><span>Role</span><b>${data.role}</b></div>
        <div><span>Favorite Activity</span><b>${data.favoriteActivity}</b></div>
        <div><span>Daily Goal</span><b>${data.dailyGoal} Activities</b></div>
        <div><span>Member Since</span><b>${data.memberSince}</b></div>
        <div><span>Card ID</span><b>${data.cardId}</b></div>
      </div>

      <div class="back-section-title">🔮 Future Self <span class="sample-tag">Sample Projection</span></div>
      <p class="future-note">If you maintain your current consistency (${data.consistency}%):</p>
      ${data.futureSelf.map(f => `
        <div class="future-row">
          <span class="future-label">${f.label}</span>
          <span class="future-detail">→ Level ${f.level} · ${f.xp} XP · ${f.note}</span>
        </div>
      `).join('')}
      <p class="future-footnote">Projection based on current activity pattern.</p>
    </div>
  `;

  animateXPBar('challengeFill');
}

function animateXPBar(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.dataset.target;
  requestAnimationFrame(() => {
    setTimeout(() => { el.style.width = `${target}%`; }, 100);
  });
}

// ============== Tilt effect (lightweight, no libraries) ==============
function attachTilt() {
  document.querySelectorAll('.tilt-wrapper').forEach((wrapper) => {
    wrapper.addEventListener('mousemove', (e) => {
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    wrapper.addEventListener('mouseleave', () => {
      wrapper.style.transform = 'rotateX(0deg) rotateY(0deg)';
    });
  });
}

// ============== Flip / buttons ==============
document.getElementById('flipCardBtn').addEventListener('click', () => {
  document.getElementById('flipInner').classList.toggle('flipped');
});

document.getElementById('logoutBtn').addEventListener('click', logoutUser);
document.getElementById('shareCardBtn').addEventListener('click', () => {
  showToast('🔗 Share link copied (placeholder — backend needed for real links)');
});

document.getElementById('downloadCardBtn').addEventListener('click', () => {
  showToast('⬇️ Card download coming once backend image export is built');
});

document.getElementById('profileLinkBtn').addEventListener('click', () => {
  showToast(`👤 ascendent.app/${SAMPLE_CARD_DATA.username} (placeholder)`);
});

renderCard();
renderBack();
attachTilt();