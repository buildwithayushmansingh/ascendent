// demo-data.js — Temporary in-browser data store (no backend yet)
//
// This simulates what the backend will eventually provide.
// Once the Flask backend is built, replace the functions below with
// real fetch() calls to the API, and delete this file.

const DEMO_KEY = 'ascendent_demo_user';

function getDemoUser() {
  const stored = localStorage.getItem(DEMO_KEY);
  if (stored) return JSON.parse(stored);

  // Default starting state for a brand new user
  const defaultUser = {
    username: localStorage.getItem('ascendent_username') || 'Player',
    level: 1,
    xp: 0,
    xpToNextLevel: 1000,
    currentStreak: 0,
    longestStreak: 0,
    streakShields: 1,
    badges: ['🥇 First Step', '🔥 7 Day Streak'],
    tier: 'Bronze',
    title: 'Rookie',
    cardId: '#' + Math.floor(1000 + Math.random() * 9000),
    habits: [],        // populated during onboarding — see Phase 3
    activityLog: [],   // every complete/miss event — powers Progress page (Phase 5)
    tierHistory: [{ tier: 'Bronze', level: 1, date: new Date().toISOString() }],
    unlockedAchievements: []  // achievement ids — powers Achievements page (Phase 5)
  };
  saveDemoUser(defaultUser);
  return defaultUser;
}

function saveDemoUser(user) {
  localStorage.setItem(DEMO_KEY, JSON.stringify(user));
}

// Tier/title lookup tables (mirrors what the backend will eventually calculate)
const TIERS = [
  { name: 'Bronze', minLevel: 1 },
  { name: 'Silver', minLevel: 10 },
  { name: 'Gold', minLevel: 20 },
  { name: 'Platinum', minLevel: 35 },
  { name: 'Legendary', minLevel: 50 }
];

const TITLES = [
  { name: 'Rookie', minLevel: 1 },
  { name: 'Grinder', minLevel: 10 },
  { name: 'Consistency Master', minLevel: 25 },
  { name: 'Legend', minLevel: 50 }
];

function getTierForLevel(level) {
  let tier = TIERS[0].name;
  for (const t of TIERS) if (level >= t.minLevel) tier = t.name;
  return tier;
}

function getTitleForLevel(level) {
  let title = TITLES[0].name;
  for (const t of TITLES) if (level >= t.minLevel) title = t.name;
  return title;
}

// ---------------------------------------------------------------
// Shared helpers (used by habits.js AND activity.js so the dashboard
// quick-log and the Quests page always behave the same way)
// ---------------------------------------------------------------

// Escapes text before it is put inside innerHTML (stops HTML injection)
function escapeHTML(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Local-date key like "2026-10-21"
function todayKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function yesterdayKey() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return todayKey(d);
}

// Streaks count DAYS, not clicks:
//  - already counted today  -> unchanged
//  - last done yesterday    -> +1
//  - older / never          -> starts again at 1
function nextStreak(current, lastKey) {
  if (!lastKey) return (current || 0) + 1;      // also handles older saved data
  if (lastKey === todayKey()) return current;
  if (lastKey === yesterdayKey()) return current + 1;
  return 1;
}

function isHabitDoneToday(habit) {
  return habit.lastCompletedDate === todayKey();
}

// Completes a habit for today. Returns what happened so the page can
// show the right animation. A habit can only be completed once per day.
function completeHabitToday(user, habit) {
  if (isHabitDoneToday(habit)) return { alreadyDone: true };

  const oldTier = user.tier;
  const today = todayKey();

  // --- habit level ---
  habit.xp += habit.xpPerComplete;
  habit.streak = nextStreak(habit.streak, habit.lastCompletedDate);
  habit.lastCompletedDate = today;
  habit.completed = true;
  while (habit.xp >= habit.xpToNextLevel) {
    habit.xp -= habit.xpToNextLevel;
    habit.level += 1;
    habit.xpToNextLevel = Math.round(habit.xpToNextLevel * 1.15);
  }

  // --- player level / overall streak ---
  user.xp += habit.xpPerComplete;
  user.currentStreak = nextStreak(user.currentStreak, user.lastCompletedDate);
  user.lastCompletedDate = today;
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

  return { alreadyDone: false, xpEarned: habit.xpPerComplete, playerLeveledUp, tierChanged };
}

// Logs a missed habit. With a shield the streak is kept; without it, reset.
function missHabit(user, habit, reason, useShield) {
  habit.missedReasons = habit.missedReasons || [];
  habit.missedReasons.push({ reason: reason || '', date: new Date().toISOString() });

  user.activityLog = user.activityLog || [];
  user.activityLog.push({
    date: new Date().toISOString(),
    category: habit.name,
    status: 'missed',
    reason: reason || ''
  });

  let shieldUsed = false;
  if (useShield && user.streakShields > 0) {
    user.streakShields -= 1;
    shieldUsed = true;
    // The shield "covers" the missed day, so the streak can continue tomorrow
    if (habit.lastCompletedDate !== todayKey()) habit.lastCompletedDate = yesterdayKey();
    if (user.lastCompletedDate !== todayKey()) user.lastCompletedDate = yesterdayKey();
  } else {
    habit.streak = 0;
    user.currentStreak = 0;
  }
  return { shieldUsed };
}
// logoutUser() — logs the user out WITHOUT erasing their saved progress
// (habits, XP, level, notes, settings). Only the "who's logged in" flag
// is removed, so the next login skips onboarding and keeps everything.
function logoutUser() {
  if (typeof clearSession === 'function') clearSession();   // removes the login token
  else localStorage.removeItem('ascendent_username');
  window.location.href = 'index.html';
}
// Custom avatar image (base64), stored separately from the main user object.
const AVATAR_KEY = 'ascendent_avatar_image';

function getAvatarImage() {
  return localStorage.getItem(AVATAR_KEY);
}

function saveAvatarImage(dataUrl) {
  localStorage.setItem(AVATAR_KEY, dataUrl);
}

// Applies the saved avatar image (if any) to any element matching the
// given selector, replacing its initials with a background image.
function applyAvatarImage(selector) {
  const img = getAvatarImage();
  if (!img) return;
  document.querySelectorAll(selector).forEach((el) => {
    el.style.backgroundImage = `url(${img})`;
    el.style.backgroundSize = 'cover';
    el.style.backgroundPosition = 'center';
    el.textContent = '';
  });
}
// ===== GLOBAL PROFILE AVATAR =====

function addGlobalProfileAvatar() {
  const topbars = document.querySelectorAll('.content-topbar');

  topbars.forEach((topbar) => {

    // Already added ho to duplicate mat banao
    if (topbar.querySelector('.global-profile-avatar')) return;

    const avatar = document.createElement('div');
    avatar.className = 'global-profile-avatar';
    avatar.id = 'globalProfileAvatar';

    const user = getDemoUser();
    avatar.textContent = (user.username || '??')
      .slice(0, 2)
      .toUpperCase();

    topbar.appendChild(avatar);

    // Saved profile image apply karo
    applyAvatarImage('#globalProfileAvatar');
  });
}


// Page load hote hi avatar add karo
// addGlobalProfileAvatar();