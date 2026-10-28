// sync.js — cloud save.
// localStorage stays the fast copy that every page reads. This file:
//   1) pushes every change to the server (MongoDB) a moment after it happens,
//   2) pulls the server copy when you log in, or when another device saved newer data.
// Load it right AFTER api.js and demo-data.js.

(function () {
    const STATE_KEYS = {
        user: 'ascendent_demo_user',
        avatar: 'ascendent_avatar_image',
        notes: 'ascendent_notes',
        settings: 'ascendent_settings',
        theme: 'ascendent_theme',
        cardTheme: 'ascendent_card_theme'
    };
    const JSON_FIELDS = ['user', 'notes', 'settings'];
    const VERSION_KEY = 'ascendent_state_version';   // last server version we know
    const DIRTY_KEY = 'ascendent_state_dirty';       // "1" = changes not saved on the server yet
    const MAX_AVATAR_CHARS = 400000;                 // same limit as the server
    const PUSH_DELAY_MS = 600;

    // Keep the real functions, so our own bookkeeping never triggers a sync
    const rawSet = Storage.prototype.setItem;
    const rawRemove = Storage.prototype.removeItem;
    const syncedKeys = Object.values(STATE_KEYS);

    let applying = false;
    let timer = null;
    let chain = Promise.resolve();

    // ---------- small helpers ----------
    const getVersion = () => parseInt(localStorage.getItem(VERSION_KEY) || '0', 10) || 0;
    const setVersion = (v) => rawSet.call(localStorage, VERSION_KEY, String(v));
    const isDirty = () => localStorage.getItem(DIRTY_KEY) === '1';
    const setDirty = (d) => (d ? rawSet.call(localStorage, DIRTY_KEY, '1') : rawRemove.call(localStorage, DIRTY_KEY));
    const hasLocalPlayer = () => localStorage.getItem(STATE_KEYS.user) !== null;

    // Everything the server should keep, as one object
    function collectLocalState() {
        const state = {};
        for (const [name, key] of Object.entries(STATE_KEYS)) {
            const raw = localStorage.getItem(key);
            if (raw === null) continue;
            if (JSON_FIELDS.includes(name)) {
                try { state[name] = JSON.parse(raw); } catch (e) { /* broken data: skip it */ }
            } else if (name === 'avatar' && raw.length > MAX_AVATAR_CHARS) {
                continue;                                   // too big to sync (new photos are resized)
            } else {
                state[name] = raw;
            }
        }
        return state;
    }

    // Write the server copy into localStorage
    function applyServerState(state) {
        applying = true;
        try {
            for (const [name, key] of Object.entries(STATE_KEYS)) {
                const value = state ? state[name] : undefined;
                if (value !== undefined && value !== null) {
                    rawSet.call(localStorage, key, JSON_FIELDS.includes(name) ? JSON.stringify(value) : String(value));
                } else if (name === 'avatar' && (localStorage.getItem(key) || '').length > MAX_AVATAR_CHARS) {
                    continue;                                 // keep a big local photo the server could not take
                } else {
                    rawRemove.call(localStorage, key);
                }
            }
        } finally {
            applying = false;
        }
    }

    // ---------- pushing ----------
    // Result: 'ok' | 'conflict' | 'skip' | 'error'
    async function doPush() {
        if (!getToken()) return 'skip';
        const state = collectLocalState();
        if (!state.user) return 'skip';                 // nothing worth saving yet

        const sent = JSON.stringify(state);
        const r = await apiFetch('/api/state', {
            method: 'PUT',
            body: JSON.stringify({ state, base_version: getVersion() })
        });

        if (r.ok) {
            setVersion(r.data.version);
            // Only mark as saved if nothing changed while we were sending
            if (JSON.stringify(collectLocalState()) === sent) {
                setDirty(false);
                // The server keeps XP, level and streaks for itself: take its version of the player
                if (r.data.user && JSON.stringify(r.data.user) !== JSON.stringify(state.user)) {
                    applying = true;
                    try { rawSet.call(localStorage, STATE_KEYS.user, JSON.stringify(r.data.user)); } finally { applying = false; }
                }
            }
            return 'ok';
        }
        if (r.status === 409) return 'conflict';
        return 'error';
    }

    function pushNow() {
        clearTimeout(timer);
        chain = chain.then(doPush).catch(() => 'error');
        return chain;
    }

    async function pullAndApply(reloadAfter) {
        const r = await apiFetch('/api/state');
        if (!r.ok || !r.data.state) return false;
        applyServerState(r.data.state);
        setVersion(r.data.version || 0);
        setDirty(false);
        if (reloadAfter) window.location.reload();
        return true;
    }

    // Called by the hooks below after every change to a synced key
    function onLocalChange(key) {
        if (applying || !syncedKeys.includes(key) || !getToken()) return;
        setDirty(true);
        clearTimeout(timer);
        timer = setTimeout(async () => {
            try {
                if ((await pushNow()) === 'conflict') await pullAndApply(true);
            } catch (e) { /* offline: the dirty flag will retry on the next page */ }
        }, PUSH_DELAY_MS);
    }

    Storage.prototype.setItem = function (key, value) {
        rawSet.call(this, key, value);
        if (this === localStorage) onLocalChange(key);
    };
    Storage.prototype.removeItem = function (key) {
        rawRemove.call(this, key);
        if (this === localStorage) onLocalChange(key);
    };

    // ---------- public functions ----------

    // Right after login: bring this browser up to date with the server.
    window.syncOnLogin = async function () {
        try {
            const r = await apiFetch('/api/state');
            if (!r.ok) return;

            if (isDirty() && hasLocalPlayer()) {          // unsaved changes from last time: save them first
                if ((await pushNow()) === 'conflict') await pullAndApply(false);
                return;
            }
            if (r.data.state) {
                applyServerState(r.data.state);             // the server copy wins
                setVersion(r.data.version || 0);
                setDirty(false);
            } else if (hasLocalPlayer()) {
                await pushNow();                            // first upload of existing local progress
            }
        } catch (e) { /* server offline: keep the local data */ }
    };
    // After the server changed the player (complete / miss a habit): store its answer
    window.syncApplyUser = function (user, version) {
        applying = true;
        try {
            rawSet.call(localStorage, STATE_KEYS.user, JSON.stringify(user));
            setVersion(version);
        } finally {
            applying = false;
        }
    };
    // Before logout: make sure everything is saved (waits at most 4 seconds)
    window.syncNow = async function () {
        clearTimeout(timer);
        if (!isDirty() || !getToken()) return;
        await Promise.race([pushNow(), new Promise((resolve) => setTimeout(() => resolve('timeout'), 4000))]);
    };

    // On every app page: save leftovers, and check if another device saved newer data.
    async function bootSync() {
        const page = window.location.pathname.split('/').pop() || 'index.html';
        if (page === 'index.html' || !getToken()) return;
        try {
            if (isDirty() && hasLocalPlayer()) {
                if ((await pushNow()) === 'conflict') { await pullAndApply(true); return; }
            }
            const r = await apiFetch('/api/state');
            if (!r.ok) return;

            if (r.data.state === null) {
                if (hasLocalPlayer()) await pushNow();      // account created before cloud save existed
                return;
            }
            const serverVersion = r.data.version || 0;
            if (serverVersion !== getVersion() && !isDirty()) {
                applyServerState(r.data.state);
                setVersion(serverVersion);
                window.location.reload();                   // show the newer data
            }
        } catch (e) { /* offline: keep working with the local copy */ }
    }

    bootSync();
})();
