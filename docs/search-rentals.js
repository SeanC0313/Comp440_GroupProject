const currentUser = JSON.parse(sessionStorage.getItem('currentUser') || 'null');

if (!currentUser) {
  window.location.href = 'index.html';
}

const form = document.getElementById('searchForm');
const results = document.getElementById('resultsSection');
const searchMessageBox = document.getElementById('searchMessageBox');

const reviewSection = document.getElementById('reviewSection');
const reviewForm = document.getElementById('reviewForm');
const reviewMessageBox = document.getElementById('reviewMessageBox');
const selectedRentalIdText = document.getElementById('selectedRentalId');
const selectedRentalTitleText = document.getElementById('selectedRentalTitle');
const reviewScore = document.getElementById('reviewScore');
const reviewRemark = document.getElementById('reviewRemark');

let selectedRentalId = null;

function showMessage(box, text, type = 'success') {
  box.textContent = text;
  box.className = `message ${type}`;
}

function clearMessage(box) {
  box.textContent = '';
  box.className = 'message hidden';
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function showReviewSection(rental) {
  selectedRentalId = rental.rentalID;
  selectedRentalIdText.textContent = rental.rentalID;
  selectedRentalTitleText.textContent = rental.title || '-';
  reviewSection.classList.remove('hidden');
  reviewForm.reset();
  clearMessage(reviewMessageBox);
  reviewSection.scrollIntoView({ behavior: 'smooth' });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  clearMessage(searchMessageBox);
  clearMessage(reviewMessageBox);
  reviewSection.classList.add('hidden');
  selectedRentalId = null;
  selectedRentalIdText.textContent = '-';
  selectedRentalTitleText.textContent = '-';
  results.innerHTML = '';

  const feature = document.getElementById('featureQuery').value.trim();

  if (!feature) {
    showMessage(searchMessageBox, 'Please type a feature first.', 'error');
    return;
  }

  try {
    const res = await fetch(`/api/rentals/search?feature=${encodeURIComponent(feature)}`);
    const data = await res.json();

    if (!res.ok) {
      showMessage(searchMessageBox, data.message || 'Search failed.', 'error');
      return;
    }

    const rentals = data.rentals || [];

    if (rentals.length === 0) {
      results.innerHTML = '<p>No rentals matched that feature.</p>';
      return;
    }

    let html = `
  <table style="width: 100%; border-collapse: collapse;">
    <thead>
      <tr>
        <th style="border: 1px solid #d1d5db; padding: 10px;">ID</th>
        <th style="border: 1px solid #d1d5db; padding: 10px;">Posted By</th>
        <th style="border: 1px solid #d1d5db; padding: 10px;">Title</th>
        <th style="border: 1px solid #d1d5db; padding: 10px;">Description</th>
        <th style="border: 1px solid #d1d5db; padding: 10px;">Features</th>
        <th style="border: 1px solid #d1d5db; padding: 10px;">Price</th>
        <th style="border: 1px solid #d1d5db; padding: 10px;">Action</th>
      </tr>
    </thead>
    <tbody>
`;


    rentals.forEach((rental) => {
  html += `
    <tr>
      <td style="border: 1px solid #d1d5db; padding: 10px;">${escapeHtml(rental.rentalID)}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px;">${escapeHtml(rental.username)}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px;">${escapeHtml(rental.title)}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px;">${escapeHtml(rental.description)}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px;">${escapeHtml(rental.features)}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px;">$${escapeHtml(rental.price)}</td>
      <td style="border: 1px solid #d1d5db; padding: 10px;">
        <button
          type="button"
          class="secondary-btn review-btn"
          data-id="${escapeHtml(rental.rentalID)}"
          data-title="${escapeHtml(rental.title)}"
        >
          Review This Rental
        </button>
      </td>
    </tr>
  `;
});


    html += `
        </tbody>
      </table>
    `;

    results.innerHTML = html;

    document.querySelectorAll('.review-btn').forEach((button) => {
  button.addEventListener('click', () => {
    const rental = {
      rentalID: button.dataset.id,
      title: button.dataset.title
    };

    showReviewSection(rental);
  });
});

  } catch (error) {
    showMessage(searchMessageBox, 'Could not connect to the server.', 'error');
  }
});

reviewForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  clearMessage(reviewMessageBox);

  if (!selectedRentalId) {
    showMessage(reviewMessageBox, 'Please select a rental first.', 'error');
    return;
  }

  const payload = {
    username: currentUser.username,
    rentalID: selectedRentalId,
    score: reviewScore.value,
    remark: reviewRemark.value.trim()
  };

  if (!payload.score) {
    showMessage(reviewMessageBox, 'Please choose a rating.', 'error');
    return;
  }

  try {
    const response = await fetch('/api/review', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      showMessage(reviewMessageBox, data.message || 'Could not submit review.', 'error');
      return;
    }

    showMessage(reviewMessageBox, 'Review submitted successfully.', 'success');
    reviewForm.reset();
  } catch (error) {
    showMessage(reviewMessageBox, 'Server connection failed.', 'error');
  }
});

