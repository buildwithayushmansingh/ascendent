// leaderboard-data.js — Phase 6: Mock leaderboard data
//
// TODO (backend phase): replace MOCK_PLAYERS with a real GET /api/leaderboard call.

const MOCK_PLAYERS = {
  global: [
    { name: 'ShadowDev', level: 24, xp: 18200, streak: 21, consistency: 96 },
    { name: 'CodeKnight', level: 22, xp: 16850, streak: 18, consistency: 91 },
    { name: 'PixelWarrior', level: 21, xp: 15700, streak: 14, consistency: 88 },
    { name: 'NightOwl', level: 19, xp: 13400, streak: 12, consistency: 84 },
    { name: 'IronWill', level: 17, xp: 11900, streak: 9, consistency: 80 },
    { name: 'QuestRunner', level: 15, xp: 10200, streak: 8, consistency: 77 },
    { name: 'ByteMonk', level: 13, xp: 8700, streak: 6, consistency: 72 }
  ],
  friends: [
    { name: 'CodeKnight', level: 22, xp: 16850, streak: 18, consistency: 91 },
    { name: 'IronWill', level: 17, xp: 11900, streak: 9, consistency: 80 },
    { name: 'QuestRunner', level: 15, xp: 10200, streak: 8, consistency: 77 }
  ],
  squad: [
    { name: 'ShadowDev', level: 24, xp: 18200, streak: 21, consistency: 96 },
    { name: 'ByteMonk', level: 13, xp: 8700, streak: 6, consistency: 72 }
  ]
};

// Builds the current player's own entry from real demo-data, for insertion
// into whichever mock list is being displayed.
function getCurrentPlayerEntry() {
  const user = getDemoUser();
  const log = user.activityLog || [];
  const totalDays = log.length || 1;
  const completedDays = log.filter(e => e.status === 'completed').length;
  const consistency = Math.round((completedDays / totalDays) * 100);

  return {
    name: user.username,
    level: user.level,
    xp: user.xp + (user.level - 1) * 1000,
    streak: user.currentStreak,
    consistency,
    isCurrentPlayer: true
  };
}

function getLeaderboardData(tab) {
  const list = [...(MOCK_PLAYERS[tab] || [])];
  list.push(getCurrentPlayerEntry());
  return list.sort((a, b) => b.level - a.level || b.xp - a.xp);
}