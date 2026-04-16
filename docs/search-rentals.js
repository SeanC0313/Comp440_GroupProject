const form = document.getElementById('searchForm');
const results = document.getElementById('resultsSection');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const feature = document.getElementById('featureQuery').value;

  const res = await fetch(`/api/rentals/search?feature=${feature}`);
  const data = await res.json();

  if (!res.ok) {
    results.innerHTML = `<p>${data.message}</p>`;
    return;
  }

  const rentals = data.rentals;

  if (rentals.length === 0) {
    results.innerHTML = `<p>No results found</p>`;
    return;
  }

  let html = `
    <table border="1">
      <tr>
        <th>ID</th>
        <th>Title</th>
        <th>Description</th>
        <th>Features</th>
        <th>Price</th>
      </tr>
  `;

  rentals.forEach(r => {
    html += `
      <tr>
        <td>${r.rentalID}</td>
        <td>${r.title}</td>
        <td>${r.description}</td>
        <td>${r.features}</td>
        <td>$${r.price}</td>
      </tr>
    `;
  });

  html += `</table>`;
  results.innerHTML = html;
});