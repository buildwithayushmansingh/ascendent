// auth.js — login / signup forms (uses api.js)
// Real accounts now: the Flask backend stores users in MongoDB Atlas.

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

// Already logged in? Skip the login page.
if (getToken()) {
  const u = getDemoUser();
  const next = (u.habits && u.habits.length > 0) ? 'dashboard.html' : 'onboarding.html';
  window.location.replace(next);
}

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('authMessage');
  const username = document.getElementById('email').value.trim();   // username or email
  const password = document.getElementById('password').value;

  if (!username || !password) {
    msg.textContent = 'Please enter both fields.';
    return;
  }

  msg.textContent = 'Logging in...';
  try {
    const { ok, data } = await apiFetch('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password })
    });

    if (!ok) {
      msg.textContent = data.message || 'Login failed.';
      return;
    }

    setSession(data.token, data.user.username, false);

    const user = getDemoUser();
    const target = (user.habits && user.habits.length > 0) ? 'dashboard.html' : 'onboarding.html';
    window.location.href = 'transition.html?next=' + target;
  } catch (err) {
    msg.textContent = 'Could not reach the server. Run: python3 app.py';
  }
});

document.getElementById('signupForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('authMessageRegister');
  const username = document.getElementById('signupUsername').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const password = document.getElementById('signupPassword').value;
  const confirmPassword = document.getElementById('signupConfirmPassword').value;

  if (password !== confirmPassword) {
    msg.textContent = 'Passwords do not match.';
    return;
  }

  msg.textContent = 'Creating your account...';
  try {
    const { ok, data } = await apiFetch('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });

    if (!ok) {
      msg.textContent = data.message || 'Could not create the account.';
      return;
    }

    setSession(data.token, data.user.username, true);   // true = brand new account
    window.location.href = 'transition.html?next=onboarding.html';
  } catch (err) {
    msg.textContent = 'Could not reach the server. Run: python3 app.py';
  }
});