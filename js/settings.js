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

function hexToRgb(hex) {
    if (!hex || !/^#[0-9A-Fa-f]{6}$/.test(hex)) {
        return null;
    }

    return {
        r: parseInt(hex.slice(1, 3), 16),
        g: parseInt(hex.slice(3, 5), 16),
        b: parseInt(hex.slice(5, 7), 16)
    };
}

function rgbToHex(r, g, b) {
    return '#' + [r, g, b]
        .map(value => Number(value).toString(16).padStart(2, '0'))
        .join('')
        .toUpperCase();
}

function mixHex(hex, target, amount) {
    const a = hexToRgb(hex);
    const b = hexToRgb(target);

    if (!a || !b) return hex;

    const r = Math.round(a.r + (b.r - a.r) * amount);
    const g = Math.round(a.g + (b.g - a.g) * amount);
    const bVal = Math.round(a.b + (b.b - a.b) * amount);

    return rgbToHex(r, g, bVal);
}

function applyAccent(accent) {
    const root = document.documentElement;

    // NONE = neutral grayscale accent
    if (!accent || accent === 'none') {
        root.dataset.accent = 'none';

        root.style.setProperty('--accent-bright', '#9a9a9a');
        root.style.setProperty('--accent', '#555555');
        root.style.setProperty('--accent-cyan', '#b5b5b5');
        root.style.setProperty('--border-bright', '#707070');

        return;
    }

    const rgb = hexToRgb(accent);
    if (!rgb) return;

    root.dataset.accent = 'custom';

    root.style.setProperty('--accent-bright', accent);
    root.style.setProperty('--accent', mixHex(accent, '#000000', 0.18));
    root.style.setProperty('--accent-cyan', mixHex(accent, '#ffffff', 0.25));
    root.style.setProperty('--border-bright', mixHex(accent, '#ffffff', 0.08));
}

function saveSettings(settings) {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    applyAccent(settings.accent);
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

function updateAccentSelection(accent) {
    document.querySelectorAll('.swatch').forEach((sw) => {
        sw.classList.toggle(
            'selected',
            sw.dataset.accent === accent
        );
    });
}
const rgbR = document.getElementById('accentR');
const rgbG = document.getElementById('accentG');
const rgbB = document.getElementById('accentB');
const rgbHex = document.getElementById('accentHex');
const rgbPreview = document.getElementById('rgbPreview');

function updateCustomRgbAccent(save = true) {
    const r = Number(rgbR.value);
    const g = Number(rgbG.value);
    const b = Number(rgbB.value);

    const hex = rgbToHex(r, g, b);

    document.getElementById('accentRValue').textContent = r;
    document.getElementById('accentGValue').textContent = g;
    document.getElementById('accentBValue').textContent = b;

    rgbHex.value = hex;

    rgbPreview.style.background = hex;
    rgbPreview.style.boxShadow = `0 0 22px ${hex}`;

    applyAccent(hex);

    if (save) {
        const current = getSettings();
        current.accent = hex;
        saveSettings(current);

        updateAccentSelection(hex);
    }
}

[rgbR, rgbG, rgbB].forEach((slider) => {
    slider.addEventListener('input', () => {
        updateCustomRgbAccent(true);
    });
});

document.getElementById('applyRgbAccent').addEventListener('click', () => {
    const value = rgbHex.value.trim().toUpperCase();

    if (!/^#[0-9A-F]{6}$/.test(value)) {
        showToast('Enter a valid HEX color');
        return;
    }

    const rgb = hexToRgb(value);

    rgbR.value = rgb.r;
    rgbG.value = rgb.g;
    rgbB.value = rgb.b;

    updateCustomRgbAccent(true);

    showToast('Custom RGB accent applied');
});

rgbHex.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('applyRgbAccent').click();
    }
});
function updateRgbControls(hex) {
    const rgb = hexToRgb(hex);
    if (!rgb) return;

    document.getElementById('accentR').value = rgb.r;
    document.getElementById('accentG').value = rgb.g;
    document.getElementById('accentB').value = rgb.b;

    document.getElementById('accentRValue').textContent = rgb.r;
    document.getElementById('accentGValue').textContent = rgb.g;
    document.getElementById('accentBValue').textContent = rgb.b;

    document.getElementById('accentHex').value = rgbToHex(
        rgb.r,
        rgb.g,
        rgb.b
    );

    document.getElementById('rgbPreview').style.background = hex;
    document.getElementById('rgbPreview').style.boxShadow =
        `0 0 20px ${hex}`;
}

updateAccentSelection(settings.accent);
applyAccent(settings.accent);

if (settings.accent !== 'none') {
    updateRgbControls(settings.accent);
}

// Preset colors + None
document.querySelectorAll('.swatch').forEach((sw) => {
    sw.addEventListener('click', () => {

        const accent = sw.dataset.accent;

        const current = getSettings();
        current.accent = accent;

        saveSettings(current);
        updateAccentSelection(accent);

        if (accent !== 'none') {
            updateRgbControls(accent);
        }

        showToast(
            accent === 'none'
                ? 'Custom accent disabled'
                : 'Accent color updated'
        );
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
    if (theme === 'crimson' || theme === 'jade' || theme === 'void') {
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
        const themeNames = { neon: '⚡ Arcane Neon', crimson: '⚔️ Crimson Circuit', jade: '🟢 Jade Protocol', void: '⚫ Pure Void' };
        showToast(`${themeNames[theme]} theme activated`);
    });
});
// ---- Settings rail tab switching (new "Command Deck" layout) ----
document.querySelectorAll('.rail-item').forEach((btn) => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.rail-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.settings-panel-v2').forEach(p => p.classList.remove('active'));
        btn.classList.add('active');
        document.querySelector(`[data-panel-content="${btn.dataset.panel}"]`).classList.add('active');
    });
});

// ---- Hero banner (name + initials) ----
document.getElementById('settingsHeroName').textContent = user.username;
document.getElementById('settingsHeroAvatar').textContent = (user.username || '??').slice(0, 2).toUpperCase();
// ---- Avatar image upload ----
document.getElementById('avatarUploadBtn').addEventListener('click', () => {
    document.getElementById('avatarFileInput').click();
});

document.getElementById('avatarFileInput').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
        saveAvatarImage(reader.result);
        applyAvatarImage('.u-avatar, .dash-avatar, .card-avatar');
        showToast('📷 Profile photo updated');
    };
    reader.readAsDataURL(file);
});

// Apply saved avatar on this page load too
applyAvatarImage('.u-avatar');