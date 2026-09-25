// settings.js — Phase 7: all settings stored in localStorage for now
//
// TODO (backend phase): sync these to a real user preferences endpoint.

const SETTINGS_KEY = 'ascendent_settings';

function getSettings() {
    const stored = localStorage.getItem(SETTINGS_KEY);
    return stored ? JSON.parse(stored) : {
        accent: '#e8a33d',
        soundEnabled: false,
        achievementSoundEnabled: false,
        animationsEnabled: true,
        dailyQuestReminder: true,
        streakReminder: true,
        achievementNotif: true
    };
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyAccent(settings.accent);
}

function applyAccent(hex) {
    document.documentElement.style.setProperty('--accent-bright', hex);
}

// ---- Load current values into the form ----
const settings = getSettings();
const user = getDemoUser();

document.getElementById('settingsAvatar').value = (user.username || '??').slice(0, 2).toUpperCase();
document.getElementById('settingsDisplayName').value = user.username;
document.getElementById('settingsUsername').value = user.username;

document.getElementById('soundToggle').checked = settings.soundEnabled;
document.getElementById('achievementSoundToggle').checked = settings.achievementSoundEnabled;
document.getElementById('animationsToggle').checked = settings.animationsEnabled;
document.getElementById('dailyQuestToggle').checked = settings.dailyQuestReminder;
document.getElementById('streakReminderToggle').checked = settings.streakReminder;
document.getElementById('achievementNotifToggle').checked = settings.achievementNotif;

document.querySelectorAll('.swatch').forEach((sw) => {
    sw.classList.toggle('selected', sw.dataset.accent === settings.accent);
});
applyAccent(settings.accent);

// ---- Wire up changes ----
document.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
        sw.classList.add('selected');
        const current = getSettings();
        current.accent = sw.dataset.accent;
        saveSettings(current);
        showToast('Accent color updated');
    });
});

function wireToggle(id, key, label) {
    document.getElementById(id).addEventListener('change', (e) => {
        const current = getSettings();
        current[key] = e.target.checked;
        saveSettings(current);
        showToast(`${label} ${e.target.checked ? 'enabled' : 'disabled'}`);
    });
}

wireToggle('soundToggle', 'soundEnabled', 'Reward sounds');
wireToggle('achievementSoundToggle', 'achievementSoundEnabled', 'Achievement sounds');
wireToggle('animationsToggle', 'animationsEnabled', 'Animations');
wireToggle('dailyQuestToggle', 'dailyQuestReminder', 'Daily quest reminder');
wireToggle('streakReminderToggle', 'streakReminder', 'Streak reminder');
wireToggle('achievementNotifToggle', 'achievementNotif', 'Achievement notifications');

document.getElementById('saveProfileBtn').addEventListener('click', () => {
    const newName = document.getElementById('settingsDisplayName').value.trim();
    if (!newName) return;
    const u = getDemoUser();
    u.username = newName;
    saveDemoUser(u);
    showToast('Profile saved');
});

document.getElementById('changePasswordBtn').addEventListener('click', () => {
    showToast('Password change requires backend — coming later');
});

document.getElementById('deleteAccountBtn').addEventListener('click', () => {
    if (confirm('This will erase all local demo data. Continue?')) {
        localStorage.clear();
        window.location.href = 'index.html';
    }
});

function doLogout() {
    logoutUser();
}
document.getElementById('logoutBtn').addEventListener('click', doLogout);
document.getElementById('settingsLogoutBtn').addEventListener('click', doLogout);
// ---- Theme switching (Neon vs Ember) ----
// ---- Theme switching (Neon vs Crimson) ----
const THEME_KEY = 'ascendent_theme';

function getCurrentTheme() {
    return localStorage.getItem(THEME_KEY) || 'neon';
}

function applyTheme(theme) {
    if (theme === 'crimson' || theme === 'jade') {
        document.documentElement.setAttribute('data-theme', theme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
}

// Apply immediately on load too (theme.js already did this before paint,
// this just keeps settings.js consistent if it ever runs standalone)
applyTheme(getCurrentTheme());

document.querySelectorAll('.theme-card').forEach((card) => {
    card.classList.toggle('active', card.dataset.themeValue === getCurrentTheme());

    card.addEventListener('click', () => {
        const theme = card.dataset.themeValue;
        localStorage.setItem(THEME_KEY, theme);
        applyTheme(theme);
        document.querySelectorAll('.theme-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');
        const themeNames = { neon: '⚡ Arcane Neon', crimson: '⚔️ Crimson Circuit', jade: '🟢 Jade Protocol' };
        showToast(`${themeNames[theme]} theme activated`);
    });
});