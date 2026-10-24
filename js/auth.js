// auth.js — Handles login/signup forms
// Login talks to the Flask backend (app.py, port 5001).
// If this page is served by Flask (port 5001) we use a relative URL;
// if it is served from another port (e.g. python3 -m http.server 5500)
// we call the Flask server directly. app.py allows this with CORS.
const API_BASE = window.location.port === '5001' ? '' : 'http://localhost:5001';
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
    const res = await fetch(API_BASE + '/api/login', {
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
    const target = (user.habits && user.habits.length > 0) ? 'dashboard.html' : 'onboarding.html';
    window.location.href = 'transition.html?next=' + target;
  } catch (err) {
    document.getElementById('authMessage').textContent = 'Could not reach the server. Run: python3 app.py';
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
  window.location.href = 'transition.html?next=onboarding.html';
});