// leaderboard-data.js — real leaderboard and friends from the server (MongoDB).

// scope: 'global' or 'friends'. Returns { ok, players } or { ok:false, message }.
async function fetchLeaderboard(scope) {
  try {
    const { ok, data } = await apiFetch('/api/leaderboard?scope=' + encodeURIComponent(scope));
    if (!ok) return { ok: false, message: data.message || 'Could not load the leaderboard.' };
    return { ok: true, players: data.players };
  } catch (e) {
    return { ok: false, message: 'Could not reach the server. Check your internet.' };
  }
}

async function addFriend(username) {
  try {
    const { ok, data } = await apiFetch('/api/friends', {
      method: 'POST',
      body: JSON.stringify({ username })
    });
    return { ok, message: ok ? 'Friend added!' : (data.message || 'Could not add that friend.') };
  } catch (e) {
    return { ok: false, message: 'Could not reach the server. Check your internet.' };
  }
}

async function removeFriend(username) {
  try {
    const { ok, data } = await apiFetch('/api/friends/' + encodeURIComponent(username), { method: 'DELETE' });
    return { ok, message: ok ? 'Friend removed.' : (data.message || 'Could not remove that friend.') };
  } catch (e) {
    return { ok: false, message: 'Could not reach the server. Check your internet.' };
  }
}