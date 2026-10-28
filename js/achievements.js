// achievements.js — Phase 5: Achievement definitions + unlock checking

// ACHIEVEMENT_LIST is used to DISPLAY achievements. The unlocking itself is
// done by the server (game_rules.py) - keep both lists in the same order.

const ACHIEVEMENT_LIST = [
    {
        id: 'first-step',
        name: 'First Step',
        description: 'Complete your first habit.',
        icon: '👣',
        check: (user, stats) => stats.totalCompleted >= 1
    },

    {
        id: 'seven-day-warrior',
        name: '7 Day Warrior',
        description: 'Maintain a 7-day streak.',
        icon: '🔥',
        check: (user) => user.longestStreak >= 7
    },

    {
        id: 'consistent',
        name: 'Consistent',
        description: 'Complete 25 activities.',
        icon: '🎯',
        check: (user, stats) => stats.totalCompleted >= 25
    },

    {
        id: 'month-master',
        name: 'Month Master',
        description: 'Maintain a 30-day streak.',
        icon: '🗓️',
        check: (user) => user.longestStreak >= 30
    },

    {
        id: 'legend',
        name: 'Legend',
        description: 'Reach Level 50.',
        icon: '👑',
        check: (user) => user.level >= 50
    }
];

function getAchievementStats(user) {
    const log = user.activityLog || [];

    return {
        totalCompleted: log.filter(
            (e) => e.status === 'completed'
        ).length
    };
}

// The SERVER unlocks achievements (see game_rules.py) after every completed or
// missed habit. This function is kept so older code still works; it does nothing.
function checkAchievements(user) {
    return user;
}