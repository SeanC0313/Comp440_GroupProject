const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');

if (!currentUser) {
  window.location.href = 'index.html';
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) element.textContent = value || '-';
}

if (currentUser) {
  setText('displayUsername', currentUser.username);
  setText('displayFirstName', currentUser.firstName);
  setText('displayLastName', currentUser.lastName);
  setText('displayEmail', currentUser.email);
  setText('displayPhone', currentUser.phone);
}

document.getElementById('logoutBtn').addEventListener('click', () => {
  sessionStorage.removeItem('currentUser');
  window.location.href = 'index.html';
});
