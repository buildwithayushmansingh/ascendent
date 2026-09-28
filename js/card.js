// =========================================================
// ASCENDENT — PLAYER CARD
// Premium Player Card System
// =========================================================

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
    {
      icon: "🏆",
      name: "First Step",
      desc: "Completed your first activity"
    },
    {
      icon: "🔥",
      name: "7 Day Warrior",
      desc: "Maintained a 7-day streak"
    },
    {
      icon: "⚡",
      name: "14 Day Streak",
      desc: "Maintained a 14-day streak"
    },
    {
      icon: "🛡",
      name: "30 Day Challenger",
      desc: "Took on the 30-day challenge"
    },
    {
      icon: "👑",
      name: "Consistency Master",
      desc: "Sustained long-term consistency"
    },
    {
      icon: "💎",
      name: "XP Hunter",
      desc: "Earned massive XP milestones"
    }
  ],

  futureSelf: [
    {
      label: "30 Days",
      level: 10,
      xp: "9,800+",
      note: "30 Day Streak"
    },
    {
      label: "60 Days",
      level: 12,
      xp: "12,500+",
      note: "Consistency Master"
    },
    {
      label: "90 Days",
      level: 14,
      xp: "16,000+",
      note: "Elite Tier"
    }
  ]
};


// =========================================================
// SETTINGS
// =========================================================

const PREFERS_REDUCED_MOTION =
  window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

const IS_COARSE_POINTER =
  window.matchMedia(
    "(pointer: coarse)"
  ).matches;


// =========================================================
// THEMES
// =========================================================

const CARD_THEMES = [
  "holographic",
  "warrior",
  "cosmic",
  "minimal"
];

const CARD_THEME_STORAGE_KEY =
  "ascendent_card_theme";


function getSavedCardTheme() {
  const savedTheme =
    localStorage.getItem(
      CARD_THEME_STORAGE_KEY
    );

  return CARD_THEMES.includes(savedTheme)
    ? savedTheme
    : "holographic";
}


function applyCardTheme(theme) {

  if (!CARD_THEMES.includes(theme)) {
    theme = "holographic";
  }

  const frontCard =
    document.getElementById("playerCard");

  const backCard =
    document.getElementById("futureSelfCard");

  const flipInner =
    document.getElementById("flipInner");

  if (frontCard) {
    frontCard.dataset.cardTheme = theme;
  }

  if (backCard) {
    backCard.dataset.cardTheme = theme;
  }

  if (flipInner) {
    flipInner.dataset.cardTheme = theme;
  }

  // IMPORTANT:
  // Only theme buttons.
  document
    .querySelectorAll(
      ".card-theme-btn[data-card-theme]"
    )
    .forEach((button) => {

      const buttonTheme =
        button.dataset.cardTheme;

      const active =
        buttonTheme === theme;

      button.classList.toggle(
        "active",
        active
      );

      button.setAttribute(
        "aria-pressed",
        active ? "true" : "false"
      );
    });

  localStorage.setItem(
    CARD_THEME_STORAGE_KEY,
    theme
  );
}


function setupCardThemes() {

  applyCardTheme(
    getSavedCardTheme()
  );

  document
    .querySelectorAll(
      ".card-theme-btn[data-card-theme]"
    )
    .forEach((button) => {

      button.addEventListener(
        "click",
        () => {

          const theme =
            button.dataset.cardTheme;

          applyCardTheme(theme);

          showToast(
            `🎨 ${formatThemeName(theme)} theme applied`
          );
        }
      );
    });
}


function formatThemeName(theme) {

  if (!theme) {
    return "Theme";
  }

  return (
    theme.charAt(0).toUpperCase() +
    theme.slice(1)
  );
}


// =========================================================
// FRONT CARD
// =========================================================

function renderCard() {

  const data = SAMPLE_CARD_DATA;

  const cardEl =
    document.getElementById("playerCard");

  if (!cardEl) {
    return;
  }

  const currentTheme =
    getSavedCardTheme();

  cardEl.className =
    `player-card tier-${data.tier.toLowerCase()} flip-front`;

  cardEl.dataset.cardTheme =
    currentTheme;

  const xpPercent =
    Math.min(
      100,
      Math.round(
        (data.xp /
          data.xpToNextLevel) *
        100
      )
    );

  const previewBadges =
    data.badges.slice(0, 4);

  const extraCount =
    data.badges.length -
    previewBadges.length;

  cardEl.innerHTML = `

        <div class="tilt-wrapper">

            <!-- SPARKLES -->

            <span
                class="card-sparkle"
                style="top:12%;left:18%;animation-delay:0s;">
            </span>

            <span
                class="card-sparkle"
                style="top:70%;left:82%;animation-delay:.8s;">
            </span>

            <span
                class="card-sparkle"
                style="top:40%;left:90%;animation-delay:1.6s;">
            </span>

            <span
                class="card-sparkle"
                style="top:85%;left:12%;animation-delay:1.1s;">
            </span>


            <!-- TOP ROW -->

            <div class="card-top-row">

                <span class="identity-label">
                    ASCENDENT PLAYER
                </span>

                <span class="tier-pill">
                    ${data.tier.toUpperCase()} TIER
                </span>

            </div>


            <!-- CORNERS -->

            <div class="card-corner corner-tl"></div>
            <div class="card-corner corner-tr"></div>
            <div class="card-corner corner-bl"></div>
            <div class="card-corner corner-br"></div>


            <!-- IDENTITY -->

            <div class="card-identity-row">

                <div class="card-avatar">
                    ${data.initials}
                </div>

                <div>

                    <div class="card-name">
                        ${data.name}
                    </div>

                    <div class="card-username">
                        @${data.username}
                    </div>

                    <div class="card-title-pill">
                        ${data.title}
                    </div>

                </div>

            </div>


            <!-- LEVEL -->

            <div class="card-level-row">

                <span class="card-level-num">
                    LVL ${data.level}
                </span>

                <span class="card-level-next">
                    Next: Level ${data.nextLevel}
                </span>

            </div>


            <!-- XP LABEL -->

            <div
                style="
                    display:flex;
                    justify-content:space-between;
                    align-items:center;
                    font-size:11px;
                    color:var(--text-secondary);
                "
            >

                <span>XP</span>

                <span>
                    ${data.xp.toLocaleString()}
                    /
                    ${data.xpToNextLevel.toLocaleString()}
                </span>

            </div>


            <!-- XP BAR -->

            <div class="card-xp-bar-track">

                <div
                    class="card-xp-bar-fill"
                    id="frontXpFill"
                    style="width:0%;"
                    data-target="${xpPercent}"
                ></div>

            </div>


            <!-- STATS -->

            <div class="card-stats">

                <div
                    class="card-stat-tile stat-pop-in"
                    style="animation-delay:0ms;"
                >

                    <div class="stat-big">
                        ${data.currentStreak}
                    </div>

                    <div class="stat-small">
                        Current Streak
                    </div>

                </div>


                <div
                    class="card-stat-tile stat-pop-in"
                    style="animation-delay:80ms;"
                >

                    <div class="stat-big">
                        ${data.longestStreak}
                    </div>

                    <div class="stat-small">
                        Longest Streak
                    </div>

                </div>


                <div
                    class="card-stat-tile stat-pop-in"
                    style="animation-delay:160ms;"
                >

                    <div class="stat-big">
                        ${data.consistency}%
                    </div>

                    <div class="stat-small">
                        Consistency
                    </div>

                </div>

            </div>


            <!-- BADGES -->

            <div class="badge-preview-row">

                ${previewBadges.map(
    (badge, index) => `

                        <span
                            class="badge-circle badge-pop-in"
                            style="
                                animation-delay:
                                ${240 + index * 70}ms;
                            "
                            title="${badge.name}"
                        >
                            ${badge.icon}
                        </span>

                    `
  ).join("")}


                ${extraCount > 0
      ? `

                            <span
                                class="badge-circle badge-more badge-pop-in"
                            >
                                +${extraCount}
                            </span>

                        `
      : ""
    }

            </div>


            <!-- FOOTER -->

            <div class="card-footer-row">

                <span>
                    Card ${data.cardId}
                </span>

                <span>
                    30-Day Challenge:
                    ${data.challengeCurrent}/${data.challengeTotal}
                </span>

            </div>

        </div>
    `;

  animateXPBar("frontXpFill");

  applyAvatarImage(".card-avatar");

  applyCardTheme(currentTheme);
}


// =========================================================
// BACK CARD
// =========================================================

function renderBack() {

  const data = SAMPLE_CARD_DATA;

  const backEl =
    document.getElementById(
      "futureSelfCard"
    );

  if (!backEl) {
    return;
  }

  const currentTheme =
    getSavedCardTheme();

  backEl.className =
    `player-card tier-${data.tier.toLowerCase()} flip-back`;

  backEl.dataset.cardTheme =
    currentTheme;

  const challengePercent =
    Math.round(
      (data.challengeCurrent /
        data.challengeTotal) *
      100
    );

  backEl.innerHTML = `

        <div class="tilt-wrapper back-scroll">

            <div class="back-section-title">
                📊 Player Stats
            </div>

            <div class="stat-grid">

                <div class="stat-grid-item">
                    <span>Level</span>
                    <b>${data.level}</b>
                </div>

                <div class="stat-grid-item">
                    <span>Current XP</span>
                    <b>${data.xp.toLocaleString()}</b>
                </div>

                <div class="stat-grid-item">
                    <span>Next Level</span>
                    <b>${data.nextLevel}</b>
                </div>

                <div class="stat-grid-item">
                    <span>Current Streak</span>
                    <b>${data.currentStreak} days</b>
                </div>

                <div class="stat-grid-item">
                    <span>Longest Streak</span>
                    <b>${data.longestStreak} days</b>
                </div>

                <div class="stat-grid-item">
                    <span>Consistency</span>
                    <b>${data.consistency}%</b>
                </div>

                <div class="stat-grid-item">
                    <span>Activities Done</span>
                    <b>${data.completedActivities}</b>
                </div>

                <div class="stat-grid-item">
                    <span>Completion Rate</span>
                    <b>${data.completionRate}%</b>
                </div>

            </div>


            <div class="back-section-title">
                🏅 Achievements
            </div>

            <div class="achievement-mini-grid">

                ${data.badges.map(
    (badge) => `

                        <div class="achievement-mini">

                            <span class="achievement-mini-icon">
                                ${badge.icon}
                            </span>

                            <div>

                                <div class="achievement-mini-name">
                                    ${badge.name}
                                </div>

                                <div class="achievement-mini-desc">
                                    ${badge.desc}
                                </div>

                            </div>

                        </div>

                    `
  ).join("")}

            </div>


            <div class="back-section-title">
                📈 Progress
            </div>

            <div class="challenge-box">

                <div class="challenge-label">
                    ${data.currentChallenge}
                </div>

                <div class="card-xp-bar-track">

                    <div
                        class="card-xp-bar-fill"
                        id="challengeFill"
                        style="width:0%;"
                        data-target="${challengePercent}"
                    ></div>

                </div>

                <div class="challenge-count">
                    ${data.challengeCurrent}
                    /
                    ${data.challengeTotal}
                    Days
                </div>

            </div>


            <div class="mini-stats-row">

                <span>
                    Weekly XP:
                    <b>
                        ${data.weeklyXP.toLocaleString()}
                    </b>
                </span>

                <span>
                    Monthly XP:
                    <b>
                        ${data.monthlyXP.toLocaleString()}
                    </b>
                </span>

            </div>


            <div class="back-section-title">
                👤 Player Identity
            </div>

            <div class="identity-list">

                <div>
                    <span>Player</span>
                    <b>${data.name}</b>
                </div>

                <div>
                    <span>Username</span>
                    <b>@${data.username}</b>
                </div>

                <div>
                    <span>Role</span>
                    <b>${data.role}</b>
                </div>

                <div>
                    <span>Favorite Activity</span>
                    <b>${data.favoriteActivity}</b>
                </div>

                <div>
                    <span>Daily Goal</span>
                    <b>${data.dailyGoal} Activities</b>
                </div>

                <div>
                    <span>Member Since</span>
                    <b>${data.memberSince}</b>
                </div>

                <div>
                    <span>Card ID</span>
                    <b>${data.cardId}</b>
                </div>

            </div>


            <div class="back-section-title">

                🔮 Future Self

                <span class="sample-tag">
                    Sample Projection
                </span>

            </div>

            <p class="future-note">
                If you maintain your current consistency
                (${data.consistency}%):
            </p>


            ${data.futureSelf.map(
    (future) => `

                    <div class="future-row">

                        <span class="future-label">
                            ${future.label}
                        </span>

                        <span class="future-detail">
                            → Level ${future.level}
                            · ${future.xp} XP
                            · ${future.note}
                        </span>

                    </div>

                `
  ).join("")}


            <p class="future-footnote">
                Projection based on current activity pattern.
            </p>

        </div>
    `;

  animateXPBar("challengeFill");

  applyCardTheme(currentTheme);
}


// =========================================================
// XP ANIMATION
// =========================================================

function animateXPBar(id) {

  const el =
    document.getElementById(id);

  if (!el) {
    return;
  }

  const target =
    el.dataset.target;

  if (PREFERS_REDUCED_MOTION) {

    el.style.width =
      `${target}%`;

    return;
  }

  requestAnimationFrame(() => {

    setTimeout(() => {

      el.style.width =
        `${target}%`;

    }, 100);

  });
}


// =========================================================
// 3D TILT
// =========================================================

function attachTilt() {

  if (
    PREFERS_REDUCED_MOTION ||
    IS_COARSE_POINTER
  ) {
    return;
  }

  const flipInner =
    document.getElementById(
      "flipInner"
    );

  if (!flipInner) {
    return;
  }

  const wrappers =
    document.querySelectorAll(
      ".tilt-wrapper"
    );

  wrappers.forEach((wrapper) => {

    const cardEl =
      wrapper.closest(
        ".player-card"
      );

    wrapper.addEventListener(
      "mousemove",
      (event) => {

        if (
          flipInner.classList.contains(
            "card-enter"
          )
        ) {
          return;
        }

        if (
          flipInner.classList.contains(
            "animating"
          )
        ) {
          return;
        }

        const rect =
          wrapper.getBoundingClientRect();

        const x =
          event.clientX -
          rect.left;

        const y =
          event.clientY -
          rect.top;

        const rotateY =
          ((x / rect.width) - 0.5) *
          7;

        const rotateX =
          ((y / rect.height) - 0.5) *
          -7;

        flipInner.style.setProperty(
          "--card-rotate-x",
          `${rotateX}deg`
        );

        flipInner.style.setProperty(
          "--card-rotate-y",
          `${rotateY}deg`
        );

        if (cardEl) {

          cardEl.style.setProperty(
            "--foil-x",
            `${(x / rect.width) * 100}%`
          );

          cardEl.style.setProperty(
            "--foil-y",
            `${(y / rect.height) * 100}%`
          );
        }
      }
    );

    wrapper.addEventListener(
      "mouseleave",
      resetCardTilt
    );
  });
}


function resetCardTilt() {

  const flipInner =
    document.getElementById(
      "flipInner"
    );

  if (!flipInner) {
    return;
  }

  flipInner.style.setProperty(
    "--card-rotate-x",
    "0deg"
  );

  flipInner.style.setProperty(
    "--card-rotate-y",
    "0deg"
  );
}


// =========================================================
// FLIP
// =========================================================

function setupFlip() {

  const flipButton =
    document.getElementById(
      "flipCardBtn"
    );

  const flipInner =
    document.getElementById(
      "flipInner"
    );

  const frontEl =
    document.getElementById(
      "playerCard"
    );

  const backEl =
    document.getElementById(
      "futureSelfCard"
    );

  if (
    !flipButton ||
    !flipInner ||
    !frontEl ||
    !backEl
  ) {
    return;
  }

  let flipping = false;

  flipButton.addEventListener(
    "click",
    () => {

      if (flipping) {
        return;
      }

      const goingToBack =
        !flipInner.classList.contains(
          "flipped"
        );

      resetCardTilt();

      if (PREFERS_REDUCED_MOTION) {

        flipInner.classList.toggle(
          "flipped",
          goingToBack
        );

        updateFlipButton(
          goingToBack
        );

        return;
      }

      flipping = true;

      frontEl.classList.remove(
        "shine-burst"
      );

      backEl.classList.remove(
        "shine-burst"
      );

      void frontEl.offsetWidth;

      flipInner.classList.add(
        "animating"
      );

      flipInner.classList.toggle(
        "flipped",
        goingToBack
      );

      requestAnimationFrame(() => {

        frontEl.classList.add(
          "shine-burst"
        );

        backEl.classList.add(
          "shine-burst"
        );

      });

      const cleanup = () => {

        flipInner.classList.remove(
          "animating"
        );

        frontEl.classList.remove(
          "shine-burst"
        );

        backEl.classList.remove(
          "shine-burst"
        );

        flipping = false;
      };

      const transitionEnd =
        (event) => {

          if (
            event.propertyName !==
            "transform"
          ) {
            return;
          }

          flipInner.removeEventListener(
            "transitionend",
            transitionEnd
          );

          cleanup();
        };

      flipInner.addEventListener(
        "transitionend",
        transitionEnd
      );

      // Safety fallback
      setTimeout(() => {

        if (flipping) {

          flipInner.removeEventListener(
            "transitionend",
            transitionEnd
          );

          cleanup();
        }

      }, 950);

      updateFlipButton(
        goingToBack
      );
    }
  );
}


function updateFlipButton(isBack) {

  const button =
    document.getElementById(
      "flipCardBtn"
    );

  if (!button) {
    return;
  }

  button.innerHTML = isBack
    ? "↩️ Back to Player Card"
    : "🔮 View Future Self";
}


// =========================================================
// AMBIENT BACKGROUND
// =========================================================

function createAmbientBackground() {

  if (
    document.getElementById(
      "cardBgAmbient"
    )
  ) {
    return;
  }

  const container =
    document.createElement("div");

  container.id =
    "cardBgAmbient";

  container.className =
    "card-bg-ambient";

  container.setAttribute(
    "aria-hidden",
    "true"
  );

  if (!PREFERS_REDUCED_MOTION) {

    const wave =
      document.createElement("div");

    wave.className =
      "bg-wave";

    container.appendChild(
      wave
    );
  }

  for (
    let i = 0;
    i < 3;
    i++
  ) {

    const orb =
      document.createElement(
        "div"
      );

    orb.className =
      `bg-orb bg-orb-${i + 1}`;

    container.appendChild(
      orb
    );
  }

  if (!PREFERS_REDUCED_MOTION) {

    const particleCount =
      window.innerWidth < 600
        ? 14
        : 26;

    for (
      let i = 0;
      i < particleCount;
      i++
    ) {

      const particle =
        document.createElement(
          "div"
        );

      particle.className =
        "bg-particle";

      particle.style.left =
        `${Math.random() * 100}%`;

      particle.style.animationDelay =
        `${Math.random() * 8}s`;

      particle.style.animationDuration =
        `${9 + Math.random() * 9}s`;

      container.appendChild(
        particle
      );
    }
  }

  document.body.insertBefore(
    container,
    document.body.firstChild
  );
}


// =========================================================
// LOGOUT
// =========================================================

function setupLogout() {

  const logoutBtn =
    document.getElementById(
      "logoutBtn"
    );

  if (!logoutBtn) {
    return;
  }

  logoutBtn.addEventListener(
    "click",
    () => {

      localStorage.removeItem(
        "ascendent_user"
      );

      window.location.href =
        "index.html";
    }
  );
}


// =========================================================
// SHARE
// =========================================================

function setupShare() {

  const shareBtn =
    document.getElementById(
      "shareCardBtn"
    );

  if (!shareBtn) {
    return;
  }

  shareBtn.addEventListener(
    "click",
    async () => {

      const shareData = {

        title:
          "Ascendent Player Card",

        text:
          `${SAMPLE_CARD_DATA.name} — ${SAMPLE_CARD_DATA.title}`,

        url:
          window.location.href
      };

      if (navigator.share) {

        try {

          await navigator.share(
            shareData
          );

          return;

        } catch (error) {

          return;
        }
      }

      try {

        await navigator.clipboard.writeText(
          window.location.href
        );

        showToast(
          "🔗 Card link copied"
        );

      } catch (error) {

        showToast(
          "🔗 Share link copied"
        );
      }
    }
  );
}


// =========================================================
// DOWNLOAD
// =========================================================

function setupDownload() {

  const downloadBtn =
    document.getElementById(
      "downloadCardBtn"
    );

  if (!downloadBtn) {
    return;
  }

  downloadBtn.addEventListener(
    "click",
    () => {

      showToast(
        "⬇️ Card download coming once image export is built"
      );
    }
  );
}


// =========================================================
// PROFILE LINK
// =========================================================

function setupProfileLink() {

  const profileBtn =
    document.getElementById(
      "profileLinkBtn"
    );

  if (!profileBtn) {
    return;
  }

  profileBtn.addEventListener(
    "click",
    async () => {

      const profileUrl =
        `${window.location.origin}/profile/${SAMPLE_CARD_DATA.username}`;

      try {

        await navigator.clipboard.writeText(
          profileUrl
        );

        showToast(
          "👤 Profile link copied"
        );

      } catch (error) {

        showToast(
          `👤 ${SAMPLE_CARD_DATA.username}`
        );
      }
    }
  );
}


// =========================================================
// TOP AVATAR → SETTINGS
// =========================================================

function setupCardAvatarNavigation() {

  const avatar =
    document.getElementById(
      "cardPageAvatar"
    );

  if (!avatar) {
    return;
  }

  avatar.style.cursor =
    "pointer";

  avatar.addEventListener(
    "click",
    () => {

      window.location.href =
        "settings.html";
    }
  );

  avatar.addEventListener(
    "keydown",
    (event) => {

      if (
        event.key === "Enter" ||
        event.key === " "
      ) {

        event.preventDefault();

        window.location.href =
          "settings.html";
      }
    }
  );
}


// =========================================================
// TOAST
// =========================================================

function showToast(message) {

  const container =
    document.getElementById(
      "toastContainer"
    );

  if (!container) {
    return;
  }

  const toast =
    document.createElement(
      "div"
    );

  toast.className =
    "toast";

  toast.textContent =
    message;

  container.appendChild(
    toast
  );

  setTimeout(() => {

    toast.style.opacity =
      "0";

    toast.style.transform =
      "translateY(8px)";

    setTimeout(() => {

      toast.remove();

    }, 250);

  }, 2200);
}


// =========================================================
// KEYBOARD
// =========================================================

function setupKeyboardControls() {

  document.addEventListener(
    "keydown",
    (event) => {

      const active =
        document.activeElement;

      if (
        active &&
        (
          active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.isContentEditable
        )
      ) {
        return;
      }

      if (
        event.key.toLowerCase() === "f"
      ) {

        const button =
          document.getElementById(
            "flipCardBtn"
          );

        if (button) {
          button.click();
        }
      }
    }
  );
}


// =========================================================
// INITIALIZE
// =========================================================

function initializeCard() {

  createAmbientBackground();

  renderCard();

  renderBack();

  setupCardThemes();

  attachTilt();

  setupFlip();

  setupLogout();

  setupShare();

  setupDownload();

  setupProfileLink();

  setupCardAvatarNavigation();

  setupKeyboardControls();


  const flipInner =
    document.getElementById(
      "flipInner"
    );

  if (!flipInner) {
    return;
  }

  if (PREFERS_REDUCED_MOTION) {
    return;
  }

  requestAnimationFrame(() => {

    flipInner.classList.add(
      "card-enter"
    );

  });

  flipInner.addEventListener(
    "animationend",
    (event) => {

      if (
        event.animationName ===
        "cardEnterSmooth"
      ) {

        flipInner.classList.remove(
          "card-enter"
        );
      }
    },
    {
      once: true
    }
  );
}


// =========================================================
// START
// =========================================================

initializeCard();