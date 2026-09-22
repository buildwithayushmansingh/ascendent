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

// Simulates logging an activity as complete or missed.
// This is where the real version will POST to /api/activity/log instead.
function logDemoActivity(status) {
  const user = getDemoUser();
  let xpEarned = 0;

  if (status === 'completed') {
    const multiplier = 1 + Math.min(user.currentStreak * 0.1, 1);
    xpEarned = Math.round(100 * multiplier);

    user.xp += xpEarned;
    user.currentStreak += 1;
    user.longestStreak = Math.max(user.longestStreak, user.currentStreak);

    while (user.xp >= user.xpToNextLevel) {
      user.xp -= user.xpToNextLevel;
      user.level += 1;
      user.xpToNextLevel = Math.round(user.xpToNextLevel * 1.2);
    }
  } else if (status === 'missed') {
    if (user.streakShields > 0) {
      user.streakShields -= 1;
    } else {
      user.currentStreak = 0;
    }
  }

  user.tier = getTierForLevel(user.level);
  user.title = getTitleForLevel(user.level);

  saveDemoUser(user);
  return { user, xpEarned };
}
// logoutUser() — logs the user out WITHOUT erasing their saved progress
// (habits, XP, level, notes, settings). Only the "who's logged in" flag
// is removed, so the next login skips onboarding and keeps everything.
function logoutUser() {
  localStorage.removeItem('ascendent_username');
  window.location.href = 'index.html';
}