// achievements.js — Phase 5: Achievement definitions + unlock checking

// checkAchievements() is called from habits.js after every completed quest.
// It's safe to call from anywhere — it just checks conditions and unlocks
// anything newly earned.

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

function checkAchievements(user) {
    const stats = getAchievementStats(user);

    user.unlockedAchievements = user.unlockedAchievements || [];

    let newlyUnlocked = false;

    ACHIEVEMENT_LIST.forEach((ach) => {
        const alreadyUnlocked =
            user.unlockedAchievements.includes(ach.id);

        if (!alreadyUnlocked && ach.check(user, stats)) {
            user.unlockedAchievements.push(ach.id);

            newlyUnlocked = true;

            if (typeof showAchievementToast === 'function') {
                setTimeout(() => {
                    showAchievementToast(ach.name);
                }, 600);
            }
        }
    });

    if (newlyUnlocked) {
        saveDemoUser(user);
    }

    return user;
}