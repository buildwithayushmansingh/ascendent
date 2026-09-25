// card.js — Player Card
// Frontend prototype using SAMPLE_CARD_DATA
// Rewritten for a smooth, premium flip + gamified page background,
// while preserving all existing IDs, data structure, and functionality.

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
    { icon: "🏆", name: "First Step", desc: "Completed your first activity" },
    { icon: "🔥", name: "7 Day Warrior", desc: "Maintained a 7-day streak" },
    { icon: "⚡", name: "14 Day Streak", desc: "Maintained a 14-day streak" },
    { icon: "🛡", name: "30 Day Challenger", desc: "Took on the 30-day challenge" },
    { icon: "👑", name: "Consistency Master", desc: "Sustained long-term consistency" },
    { icon: "💎", name: "XP Hunter", desc: "Earned massive XP milestones" }
  ],

  futureSelf: [
    { label: "30 Days", level: 10, xp: "9,800+", note: "30 Day Streak" },
    { label: "60 Days", level: 12, xp: "12,500+", note: "Consistency Master" },
    { label: "90 Days", level: 14, xp: "16,000+", note: "Elite Tier" }
  ]
};

// Read once — used everywhere to decide whether to run decorative motion.
const PREFERS_REDUCED_MOTION =
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const IS_COARSE_POINTER =
  window.matchMedia("(pointer: coarse)").matches;


// =========================================================
// FRONT CARD
// =========================================================

function renderCard() {
  const data = SAMPLE_CARD_DATA;
  const cardEl = document.getElementById("playerCard");
  if (!cardEl) return;

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
        <span>XP</span>
        <span>${data.xp.toLocaleString()} / ${data.xpToNextLevel.toLocaleString()}</span>
      </div>

      <div class="card-xp-bar-track">
        <div class="card-xp-bar-fill" id="frontXpFill" style="width:0%;" data-target="${xpPercent}"></div>
      </div>

      <div class="card-stats">
        <div class="card-stat-tile stat-pop-in" style="animation-delay:0ms;">
          <div class="stat-big">${data.currentStreak}</div>
          <div class="stat-small">Current Streak</div>
        </div>
        <div class="card-stat-tile stat-pop-in" style="animation-delay:80ms;">
          <div class="stat-big">${data.longestStreak}</div>
          <div class="stat-small">Longest Streak</div>
        </div>
        <div class="card-stat-tile stat-pop-in" style="animation-delay:160ms;">
          <div class="stat-big">${data.consistency}%</div>
          <div class="stat-small">Consistency</div>
        </div>
      </div>

      <div class="badge-preview-row">
        ${previewBadges.map((b, i) => `
          <span class="badge-circle badge-pop-in" style="animation-delay:${240 + i * 70}ms;" title="${b.name}">${b.icon}</span>
        `).join("")}
        ${extraCount > 0 ? `<span class="badge-circle badge-more badge-pop-in" style="animation-delay:${240 + previewBadges.length * 70}ms;">+${extraCount}</span>` : ""}
      </div>

      <div class="card-footer-row">
        <span>Card ${data.cardId}</span>
        <span>${data.currentChallenge.split(" ")[0]}-Day Challenge: ${data.challengeCurrent}/${data.challengeTotal}</span>
      </div>
    </div>
  `;

  animateXPBar("frontXpFill");
}


// =========================================================
// BACK CARD
// =========================================================

function renderBack() {
  const data = SAMPLE_CARD_DATA;
  const backEl = document.getElementById("futureSelfCard");
  if (!backEl) return;

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
        `).join("")}
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
      `).join("")}
      <p class="future-footnote">Projection based on current activity pattern.</p>
    </div>
  `;

  animateXPBar("challengeFill");
}


// =========================================================
// XP BAR ANIMATION
// =========================================================

function animateXPBar(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const target = el.dataset.target;

  if (PREFERS_REDUCED_MOTION) {
    el.style.width = `${target}%`;
    return;
  }

  requestAnimationFrame(() => {
    setTimeout(() => { el.style.width = `${target}%`; }, 100);
  });
}


// =========================================================
// TILT EFFECT — disabled on touch devices and during
// flip/entrance, and skipped entirely under reduced motion.
// =========================================================

function attachTilt() {
  if (PREFERS_REDUCED_MOTION || IS_COARSE_POINTER) return;

  const flipInner = document.getElementById("flipInner");

  document.querySelectorAll(".tilt-wrapper").forEach((wrapper) => {
    wrapper.addEventListener("mousemove", (e) => {
      if (flipInner.classList.contains("animating") || flipInner.classList.contains("card-enter")) {
        return;
      }
      const rect = wrapper.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const rotateY = ((x / rect.width) - 0.5) * 8;
      const rotateX = ((y / rect.height) - 0.5) * -8;
      wrapper.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    wrapper.addEventListener("mouseleave", () => {
      wrapper.style.transform = "rotateX(0deg) rotateY(0deg)";
    });
  });
}


// =========================================================
// FLIP CARD — simplified single-arc rotation (no scale
// bounce), glow now lives on .flip-inner so it never
// competes with the tier's own box-shadow animation.
// =========================================================

function setupFlip() {
  const flipButton = document.getElementById("flipCardBtn");
  const flipInner = document.getElementById("flipInner");
  const frontEl = document.getElementById("playerCard");
  const backEl = document.getElementById("futureSelfCard");

  if (!flipButton || !flipInner || !frontEl || !backEl) return;

  flipButton.addEventListener("click", () => {
    if (flipInner.classList.contains("animating")) return;

    const goingToBack = !flipInner.classList.contains("flipped");

    // Reduced motion: swap instantly, no 3D flourish, no shine, no glow.
    if (PREFERS_REDUCED_MOTION) {
      flipInner.classList.toggle("flipped", goingToBack);
      return;
    }

    const direction = goingToBack ? "to-back" : "to-front";

    // Reset shine so it can restart cleanly on every flip.
    frontEl.classList.remove("shine-burst");
    backEl.classList.remove("shine-burst");
    void frontEl.offsetWidth; // force reflow so the animation restarts

    flipInner.classList.add("animating", direction);

    requestAnimationFrame(() => {
      frontEl.classList.add("shine-burst");
      backEl.classList.add("shine-burst");
    });

    const handleFlipEnd = (event) => {
      if (event.animationName !== "smoothFlipBack" && event.animationName !== "smoothFlipFront") {
        return;
      }
      flipInner.classList.remove("animating", direction);
      flipInner.classList.toggle("flipped", goingToBack);
      frontEl.classList.remove("shine-burst");
      backEl.classList.remove("shine-burst");
      flipInner.removeEventListener("animationend", handleFlipEnd);
    };

    flipInner.addEventListener("animationend", handleFlipEnd);
  });
}


// =========================================================
// AMBIENT PAGE BACKGROUND — a few CSS-driven drifting glow
// orbs + floating particles. No canvas, no animation loop:
// everything moves via CSS transforms/opacity only, so it's
// effectively free on the main thread. Skipped entirely
// under reduced motion (a static, non-animated version is
// still inserted so the page doesn't look empty).
// =========================================================

function createAmbientBackground() {
  if (document.getElementById("cardBgAmbient")) return; // avoid duplicates

  const container = document.createElement("div");
  container.id = "cardBgAmbient";
  container.className = "card-bg-ambient";
  container.setAttribute("aria-hidden", "true");

  for (let i = 0; i < 3; i++) {
    const orb = document.createElement("div");
    orb.className = `bg-orb bg-orb-${i + 1}`;
    container.appendChild(orb);
  }

  if (!PREFERS_REDUCED_MOTION) {
    const particleCount = window.innerWidth < 600 ? 8 : 14;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "bg-particle";
      particle.style.left = `${Math.random() * 100}%`;
      particle.style.animationDelay = `${Math.random() * 8}s`;
      particle.style.animationDuration = `${10 + Math.random() * 8}s`;
      container.appendChild(particle);
    }
  }

  document.body.insertBefore(container, document.body.firstChild);
}


// =========================================================
// LOGOUT / SHARE / DOWNLOAD / PROFILE LINK
// =========================================================

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (!logoutBtn) return;
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("ascendent_user");
    window.location.href = "index.html";
  });
}

function setupShare() {
  const shareBtn = document.getElementById("shareCardBtn");
  if (!shareBtn) return;
  shareBtn.addEventListener("click", () => {
    showToast("🔗 Share link copied (placeholder — backend needed for real links)");
  });
}

function setupDownload() {
  const downloadBtn = document.getElementById("downloadCardBtn");
  if (!downloadBtn) return;
  downloadBtn.addEventListener("click", () => {
    showToast("⬇️ Card download coming once backend image export is built");
  });
}

function setupProfileLink() {
  const profileBtn = document.getElementById("profileLinkBtn");
  if (!profileBtn) return;
  profileBtn.addEventListener("click", () => {
    showToast(`👤 ascendent.app/${SAMPLE_CARD_DATA.username} (placeholder)`);
  });
}


// =========================================================
// INITIALIZE PLAYER CARD
// =========================================================

function initializeCard() {
  createAmbientBackground();

  renderCard();
  renderBack();

  attachTilt();
  setupFlip();

  setupLogout();
  setupShare();
  setupDownload();
  setupProfileLink();

  const flipInner = document.getElementById("flipInner");
  if (!flipInner) return;

  // Reduced motion: skip the entrance flourish entirely so the
  // 'card-enter' class never gets stuck (it would otherwise block
  // the tilt guard forever, since no animationend would ever fire).
  if (PREFERS_REDUCED_MOTION) return;

  requestAnimationFrame(() => {
    flipInner.classList.add("card-enter");
  });

  flipInner.addEventListener("animationend", (event) => {
    if (event.animationName === "cardEnterSmooth") {
      flipInner.classList.remove("card-enter");
    }
  }, { once: true });
}


// =========================================================
// START
// =========================================================

initializeCard();