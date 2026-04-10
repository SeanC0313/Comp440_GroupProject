const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const showLoginBtn = document.getElementById('showLoginBtn');
const showSignupBtn = document.getElementById('showSignupBtn');
const messageBox = document.getElementById('messageBox');

function showMessage(text, type = 'success') {
  messageBox.textContent = text;
  messageBox.className = `message ${type}`;
}

function clearMessage() {
  messageBox.textContent = '';
  messageBox.className = 'message hidden';
}

function switchTab(tab) {
  clearMessage();

  if (tab === 'login') {
    loginForm.classList.remove('hidden');
    signupForm.classList.add('hidden');
    showLoginBtn.classList.add('active');
    showSignupBtn.classList.remove('active');
  } else {
    signupForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    showSignupBtn.classList.add('active');
    showLoginBtn.classList.remove('active');
  }
}

showLoginBtn.addEventListener('click', () => switchTab('login'));
showSignupBtn.addEventListener('click', () => switchTab('signup'));

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizePhone(phone) {
  return phone.replace(/\D/g, '');
}

signupForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();

  const payload = {
    username: document.getElementById('signupUsername').value.trim(),
    password: document.getElementById('signupPassword').value,
    confirmPassword: document.getElementById('confirmPassword').value,
    firstName: document.getElementById('firstName').value.trim(),
    lastName: document.getElementById('lastName').value.trim(),
    email: document.getElementById('email').value.trim(),
    phone: normalizePhone(document.getElementById('phone').value)
  };

  if (!payload.username || !payload.password || !payload.confirmPassword || !payload.firstName ||
      !payload.lastName || !payload.email || !payload.phone) {
    showMessage('Please complete all sign up fields.', 'error');
    return;
  }

  if (payload.password !== payload.confirmPassword) {
    showMessage('Passwords do not match.', 'error');
    return;
  }

  if (!isValidEmail(payload.email)) {
    showMessage('Please enter a valid email address.', 'error');
    return;
  }

 if (!/^\d{10,15}$/.test(payload.phone)) {
  showMessage('Please enter a valid phone number.', 'error');
  return;
}

  try {
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Sign up failed.', 'error');
      return;
    }

    showMessage('Account created successfully. You can now log in.', 'success');
    signupForm.reset();
    switchTab('login');
  } catch (error) {
    // Demo mode fallback so the page still works before backend is connected
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');

    const duplicate = demoUsers.find(user =>
      user.username === payload.username ||
      user.email === payload.email ||
      user.phone === payload.phone
    );

    if (duplicate) {
      showMessage('Duplicate username, email, or phone detected.', 'error');
      return;
    }

    demoUsers.push({
      username: payload.username,
      password: payload.password,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone
    });

    localStorage.setItem('demoUsers', JSON.stringify(demoUsers));
    showMessage('Demo sign up worked locally. Connect backend later.', 'success');
    signupForm.reset();
    switchTab('login');
  }
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  clearMessage();

  const username = document.getElementById('loginUsername').value.trim();
  const password = document.getElementById('loginPassword').value;

  if (!username || !password) {
    showMessage('Please enter your username and password.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(data.message || 'Login failed.', 'error');
      return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(data.user || { username }));
    window.location.href = 'dashboard.html';
  } catch (error) {
    // Demo mode fallback before real backend is connected
    const demoUsers = JSON.parse(localStorage.getItem('demoUsers') || '[]');
    const matchedUser = demoUsers.find(user => user.username === username && user.password === password);

    if (!matchedUser) {
      showMessage('Invalid username or password.', 'error');
      return;
    }

    sessionStorage.setItem('currentUser', JSON.stringify(matchedUser));
    window.location.href = 'dashboard.html';
  }
});
