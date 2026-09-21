// auth.js — Handles login/signup forms
// Login talks to the real Flask backend at /api/login (same server now,
// no CORS needed since everything runs from one Flask app).

const authShell = document.getElementById('authShell');

function goToRegister(e) {
  if (e) e.preventDefault();
  authShell.classList.add('right-panel-active');
}

function goToLogin(e) {
  if (e) e.preventDefault();
  authShell.classList.remove('right-panel-active');
}

document.getElementById('showSignup').addEventListener('click', goToRegister);
document.getElementById('showLoginBtn').addEventListener('click', goToLogin);
document.getElementById('showLoginInline').addEventListener('click', goToLogin);

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  if (!username || !password) {
    document.getElementById('authMessage').textContent = 'Please enter both fields.';
    return;
  }

  try {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (!data.success) {
      document.getElementById('authMessage').textContent = data.message;
      return;
    }

    localStorage.setItem('ascendent_username', data.username);

    const user = getDemoUser();
    window.location.href = (user.habits && user.habits.length > 0) ? 'dashboard.html' : 'onboarding.html';
  } catch (err) {
    document.getElementById('authMessage').textContent = 'Could not reach the server.';
  }
});

document.getElementById('signupForm').addEventListener('submit', (e) => {
  e.preventDefault();
  const username = document.getElementById('signupUsername').value;
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (!username) {
    document.getElementById('authMessageRegister').textContent = 'Please enter a username.';
    return;
  }

  if (password !== confirmPassword) {
    document.getElementById('authMessageRegister').textContent = 'Passwords do not match.';
    return;
  }

  // Signup stays frontend-only for now (no backend account creation yet)
  localStorage.setItem('ascendent_username', username);
  window.location.href = 'onboarding.html';
});