const rentalForm = document.getElementById('rentalForm');
const rentalMessageBox = document.getElementById('rentalMessageBox');

const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');
if (!currentUser) {
  window.location.href = 'index.html';
}

function showRentalMessage(text, type = 'success') {
  rentalMessageBox.textContent = text;
  rentalMessageBox.className = `message ${type}`;
}

function parseFeatures(featureText) {
  return featureText
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

rentalForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  const payload = {
    username: currentUser.username,
    title: document.getElementById('rentalTitle').value.trim(),
    description: document.getElementById('rentalDescription').value.trim(),
    features: parseFeatures(document.getElementById('rentalFeatures').value),
    price: document.getElementById('rentalPrice').value.trim()
  };

  try {
    const response = await fetch('/api/rental', {   // ✅ matches your server
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showRentalMessage(data.message, 'error');
      return;
    }

    showRentalMessage('Rental posted successfully!', 'success');
    rentalForm.reset();

  } catch (err) {
    showRentalMessage('Server connection failed.', 'error');
  }
});