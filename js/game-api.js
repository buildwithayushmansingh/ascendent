// game-api.js — XP, levels, streaks and achievements are calculated by the SERVER,
// so they cannot be edited in the browser. These functions ask the server to
// complete or miss a habit, then store the answer in the browser.
// Load after sync.js (needs api.js and sync.js).

async function runGameAction(path, body) {
    // 1) make sure the server already knows about habits you just created or edited
    if (typeof syncNow === 'function') {
        try { await syncNow(); } catch (e) { /* offline: the request below will say so */ }
    }

    // 2) ask the server
    let res;
    try {
        res = await apiFetch(path, { method: 'POST', body: JSON.stringify(body || {}) });
    } catch (e) {
        return { ok: false, message: 'Could not reach the server. Check your internet and try again.' };
    }
    if (!res.ok) {
        return { ok: false, message: res.data.message || 'Something went wrong. Please try again.' };
    }

    // 3) keep the server's answer as the browser copy
    if (typeof syncApplyUser === 'function') syncApplyUser(res.data.user, res.data.version);
    return { ok: true, ...res.data };
}

function completeHabitOnServer(habitId) {
    return runGameAction('/api/habits/' + encodeURIComponent(habitId) + '/complete');
}

function missHabitOnServer(habitId, reason, useShield) {
    return runGameAction('/api/habits/' + encodeURIComponent(habitId) + '/miss', { reason, useShield: !!useShield });
}

// Toasts for achievements the server just unlocked
function showNewAchievements(list) {
    (list || []).forEach((ach, i) => {
        setTimeout(() => {
            if (typeof showAchievementToast === 'function') showAchievementToast(ach.name);
        }, 600 + i * 1200);
    });
}