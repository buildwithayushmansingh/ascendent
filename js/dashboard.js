// dashboard.js — Renders the mini player card and handles the Notes section
//
// Uses demo-data.js for now. Once the backend exists, loadMiniCard()
// should fetch from GET /api/user/card instead of getDemoUser().

document.getElementById('logoutBtn').addEventListener('click', logoutUser);

function loadMiniCard() {
  const user = getDemoUser();
  document.getElementById('greeting').textContent = `Hey ${user.username}! 🔥`;
  document.getElementById('statLevel').textContent = `${user.level} (${user.tier})`;
  document.getElementById('statStreak').textContent = `${user.currentStreak} days`;
  document.getElementById('statXP').textContent = `${user.xp} / ${user.xpToNextLevel}`;

  document.getElementById('heroAvatar').textContent = (user.username || '??').slice(0, 2).toUpperCase();
  document.getElementById('ringLevel').textContent = user.level;

  const circumference = 2 * Math.PI * 34;
  const percent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
  const ringFill = document.getElementById('xpRingFill');
  ringFill.style.strokeDasharray = `${circumference}`;
  ringFill.style.strokeDashoffset = `${circumference * (1 - percent / 100)}`;

  updateBossBattle(user);
}

function updateBossBattle(user) {
  const progressPercent = Math.min(100, Math.round((user.xp / user.xpToNextLevel) * 100));
  const hpRemaining = 100 - progressPercent;

  document.getElementById('bossHpFill').style.width = `${hpRemaining}%`;
  document.getElementById('bossHpText').textContent =
    hpRemaining <= 0 ? '🏆 Boss Defeated! New boss incoming...' : `${hpRemaining}% HP remaining`;
}

// ---- Notes section (stored in localStorage for now) ----
function loadNotes() {
  const notes = JSON.parse(localStorage.getItem('ascendent_notes') || '[]');
  const list = document.getElementById('notesList');
  list.innerHTML = '';
  notes.forEach((note) => {
    const li = document.createElement('li');
    li.textContent = note;
    list.appendChild(li);
  });
}

document.getElementById('saveNotesBtn').addEventListener('click', () => {
  const textarea = document.getElementById('notesArea');
  const text = textarea.value.trim();
  if (!text) return;

  const notes = JSON.parse(localStorage.getItem('ascendent_notes') || '[]');
  notes.unshift(text);
  localStorage.setItem('ascendent_notes', JSON.stringify(notes));

  textarea.value = '';
  loadNotes();
});

loadMiniCard();
loadNotes();
