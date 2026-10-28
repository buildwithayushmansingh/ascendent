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

// The app's "day". The SERVER decides streak days in this timezone, so the browser
// only uses it to show things like the "Done" button (same default as the server).
const APP_TIMEZONE = 'Asia/Kolkata';

// Date key like "2026-10-21" in the app timezone
function todayKey(date = new Date()) {
  return date.toLocaleDateString('en-CA', { timeZone: APP_TIMEZONE });
}

function yesterdayKey() {
  return todayKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
}

function isHabitDoneToday(habit) {
  return habit.lastCompletedDate === todayKey();
}

// NOTE: completing / missing a habit (XP, levels, streaks, shields, achievements)
// is calculated on the SERVER. See js/game-api.js.
// logoutUser() — logs the user out WITHOUT erasing their saved progress
// (habits, XP, level, notes, settings). Only the "who's logged in" flag
// is removed, so the next login skips onboarding and keeps everything.
async function logoutUser() {
  // 1) make sure everything is saved on the server
  try { if (typeof syncNow === 'function') await syncNow(); } catch (e) { /* offline */ }
  const unsaved = localStorage.getItem('ascendent_state_dirty') === '1';

  // 2) log out; clean this browser only if nothing is left unsaved
  if (typeof clearSession === 'function') clearSession();
  else localStorage.removeItem('ascendent_username');
  if (!unsaved && typeof wipeLocalData === 'function') wipeLocalData();

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