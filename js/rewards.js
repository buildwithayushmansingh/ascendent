// rewards.js — Phase 4: Reusable reward animations (XP gain, Level Up,
// Streak, Tier Upgrade). Shared across habits.js and activity.js.
//
// Every function here is non-blocking — they animate and auto-remove
// themselves, and never intercept clicks (pointer-events: none).

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

// Simple toast for streak/achievement style messages
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
    }, 1800);
}

// Floating "+XX XP" number that rises and fades near a given element
function spawnFloatingXP(amount, anchorEl) {
    const rect = anchorEl ? anchorEl.getBoundingClientRect() : { left: window.innerWidth / 2, top: window.innerHeight / 2, width: 0 };
    const el = document.createElement('div');
    el.className = 'floating-xp';
    el.textContent = `+${amount} XP`;
    el.style.left = `${rect.left + rect.width / 2}px`;
    el.style.top = `${rect.top}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1200);
}

function animationsAreEnabled() {
    const stored = localStorage.getItem('ascendent_settings');
    if (!stored) return true;
    return JSON.parse(stored).animationsEnabled !== false;
}

// Full-screen (but non-blocking) "LEVEL UP!" moment
function showLevelUpOverlay(newLevel) {
    if (!animationsAreEnabled()) return;
    const overlay = document.createElement('div');
    overlay.className = 'reward-overlay';
    overlay.innerHTML = `
    <div class="reward-burst"></div>
    <div class="reward-overlay-content">
      <div class="reward-overlay-title">LEVEL UP!</div>
      <div class="reward-overlay-sub">You reached Level ${newLevel}</div>
    </div>
  `;
    document.body.appendChild(overlay);
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
      <div class="reward-overlay-title">PLAYER CARD UPGRADED</div>
      <div class="reward-overlay-sub">Welcome to ${tierName} tier</div>
    </div>
  `;
    document.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 1700);
}

// Alias for achievement unlocks (reused in Phase 5)
function showAchievementToast(name) {
    showToast(`🏆 New Achievement: ${name}`);
}