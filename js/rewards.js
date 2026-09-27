// rewards.js — Reusable reward animations (XP gain, Level Up, Streak,
// Tier Upgrade, Achievement) + a lightweight CSS-only confetti burst.
// Shared across habits.js, activity.js, achievements.js.

function ensureToastContainer() {
    let container = document.getElementById('toastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toastContainer';
        container.className = 'toast-container';
        document.body.appendChild(container);
    }
    return container;
}

function animationsAreEnabled() {
    const stored = localStorage.getItem('ascendent_settings');
    if (!stored) return true;
    return JSON.parse(stored).animationsEnabled !== false;
}

// Bouncy, glowing toast — same call signature as before (showToast(text)),
// now with a spring entrance and a soft pulsing border.
function showToast(text) {
    const container = ensureToastContainer();
    const toast = document.createElement('div');
    toast.className = 'game-toast';
    toast.textContent = text;
    container.appendChild(toast);
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 2000);
}

// Lightweight confetti burst — small colored pieces that pop outward and
// fall, pure CSS animation (transform/opacity only), auto-cleans itself.
function spawnConfettiBurst(originX, originY) {
    if (!animationsAreEnabled()) return;

    const x = originX ?? window.innerWidth / 2;
    const y = originY ?? window.innerHeight / 2;
    const colors = ['var(--accent-bright)', 'var(--accent-cyan)', 'var(--accent)', '#ffffff'];
    const pieceCount = window.innerWidth < 600 ? 14 : 24;

    const burst = document.createElement('div');
    burst.className = 'confetti-burst';
    burst.style.left = `${x}px`;
    burst.style.top = `${y}px`;

    for (let i = 0; i < pieceCount; i++) {
        const piece = document.createElement('span');
        piece.className = 'confetti-piece';
        const angle = (i / pieceCount) * 360 + (Math.random() * 20 - 10);
        const distance = 60 + Math.random() * 90;
        const dx = Math.cos((angle * Math.PI) / 180) * distance;
        const dy = Math.sin((angle * Math.PI) / 180) * distance;
        piece.style.setProperty('--dx', `${dx}px`);
        piece.style.setProperty('--dy', `${dy}px`);
        piece.style.background = colors[i % colors.length];
        piece.style.animationDelay = `${Math.random() * 0.08}s`;
        burst.appendChild(piece);
    }

    document.body.appendChild(burst);
    setTimeout(() => burst.remove(), 1200);
}

// Full-screen (but non-blocking) "LEVEL UP!" moment
function showLevelUpOverlay(newLevel) {
    if (!animationsAreEnabled()) return;
    const overlay = document.createElement('div');
    overlay.className = 'reward-overlay';
    overlay.innerHTML = `
    <div class="reward-burst"></div>
    <div class="reward-overlay-content">
      <div class="reward-overlay-title reward-title-bounce">LEVEL UP!</div>
      <div class="reward-overlay-sub">You reached Level ${newLevel}</div>
    </div>
  `;
    document.body.appendChild(overlay);
    spawnConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.4);
    setTimeout(() => overlay.remove(), 1700);
}

// Full-screen "PLAYER CARD UPGRADED" moment for tier changes
function showTierUpgradeOverlay(tierName) {
    if (!animationsAreEnabled()) return;
    const overlay = document.createElement('div');
    overlay.className = 'reward-overlay';
    overlay.innerHTML = `
    <div class="reward-burst"></div>
    <div class="reward-overlay-content">
      <div class="reward-overlay-title reward-title-bounce">PLAYER CARD UPGRADED</div>
      <div class="reward-overlay-sub">Welcome to ${tierName} tier</div>
    </div>
  `;
    document.body.appendChild(overlay);
    spawnConfettiBurst(window.innerWidth / 2, window.innerHeight * 0.4);
    setTimeout(() => overlay.remove(), 1700);
}

// Achievement unlock — richer than a plain toast: a ribbon-style banner
// that slides in from the top with its own confetti pop.
function showAchievementToast(name) {
    if (!animationsAreEnabled()) {
        showToast(`🏆 New Achievement: ${name}`);
        return;
    }
    const banner = document.createElement('div');
    banner.className = 'achievement-banner';
    banner.innerHTML = `
    <span class="achievement-banner-icon">🏆</span>
    <div>
      <div class="achievement-banner-title">Achievement Unlocked</div>
      <div class="achievement-banner-name">${name}</div>
    </div>
  `;
    document.body.appendChild(banner);
    spawnConfettiBurst(window.innerWidth / 2, 90);
    setTimeout(() => banner.classList.add('show'), 10);
    setTimeout(() => {
        banner.classList.remove('show');
        setTimeout(() => banner.remove(), 400);
    }, 2600);
}
// Floating "+XX XP" number that rises and fades near a given element
function spawnFloatingXP(amount, anchorEl) {
    if (!animationsAreEnabled()) return;
    const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
    const el = document.createElement('div');
    el.className = 'floating-xp';
    el.textContent = `+${amount} XP`;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}