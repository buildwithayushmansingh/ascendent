// api.js — talks to the Flask backend, keeps the login token, and guards the pages.
// Load this FIRST on every page (before theme.js).

// If the page is served by Flask (port 5001) use a relative URL,
// otherwise call the Flask server directly (app.py allows this with CORS).
const API_BASE = window.location.port === '5001' ? '' : 'http://localhost:5001';

const TOKEN_KEY = 'ascendent_token';
const OWNER_KEY = 'ascendent_data_owner';
const VERIFIED_KEY = 'ascendent_verified';

function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}

// Saves the login. Browser data (habits, XP ...) still lives in localStorage
// until Phase 2, so when a DIFFERENT account logs in on this browser we clear
// the old data, otherwise two accounts would share the same progress.
function setSession(token, username, isNewAccount) {
    const owner = localStorage.getItem(OWNER_KEY);
    const switched = owner && owner !== username.toLowerCase();

    if (isNewAccount || switched) {
        localStorage.removeItem(TOKEN_KEY);   // so clearing the old data is never synced to the server
        Object.keys(localStorage)
            .filter((k) => k.startsWith('ascendent_'))
            .forEach((k) => localStorage.removeItem(k));
    }

    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(OWNER_KEY, username.toLowerCase());
    localStorage.setItem('ascendent_username', username);
    sessionStorage.setItem(VERIFIED_KEY, '1');
}

function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem('ascendent_username');
    sessionStorage.removeItem(VERIFIED_KEY);
}
// Removes everything this site saved in the browser (used on logout, after the
// data is safely stored on the server).
function wipeLocalData() {
    Object.keys(localStorage)
        .filter((k) => k.startsWith('ascendent_'))
        .forEach((k) => localStorage.removeItem(k));
    sessionStorage.removeItem(VERIFIED_KEY);
}
// fetch() helper: adds the token, returns { ok, status, data }.
// If the server says the token is no longer valid, the user goes back to login.
async function apiFetch(path, options = {}) {
    const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    const res = await fetch(API_BASE + path, { ...options, headers });
    let data = {};
    try { data = await res.json(); } catch (e) { /* empty body */ }

    if (res.status === 401 && token && !path.startsWith('/api/auth/')) {
        clearSession();
        window.location.replace('index.html');
    }
    return { ok: res.ok, status: res.status, data };
}

// Page guard: every page except index.html needs a login.
(function guardPage() {
    const page = window.location.pathname.split('/').pop() || 'index.html';
    if (page === 'index.html') return;

    if (!getToken()) {
        window.location.replace('index.html');
        return;
    }

    // Check once per browser session that the token is still valid.
    if (!sessionStorage.getItem(VERIFIED_KEY)) {
        apiFetch('/api/auth/me').then((r) => {
            if (r.ok) {
                sessionStorage.setItem(VERIFIED_KEY, '1');
            } else if (r.status === 401) {
                clearSession();
                window.location.replace('index.html');
            }
        }).catch(() => { /* server offline: stay on the page */ });
    }
})();