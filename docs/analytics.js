const results = document.getElementById('results');

function show(data) {
  if (!data || data.length === 0) {
    results.innerHTML = "<p>No results found</p>";
    return;
  }

  let html = "<table border='1'><tr>";

  Object.keys(data[0]).forEach(col => {
    html += `<th>${col}</th>`;
  });

  html += "</tr>";

  data.forEach(row => {
    html += "<tr>";
    Object.values(row).forEach(val => {
      html += `<td>${val}</td>`;
    });
    html += "</tr>";
  });

  html += "</table>";
  results.innerHTML = html;
}

// Query functions
async function q1() {
  const res = await fetch('/api/analytics/q1');
  const data = await res.json();
  show(data.results);
}

async function q2() {
  const x = document.getElementById('x').value.trim();
  const y = document.getElementById('y').value.trim();

  const res = await fetch(`/api/analytics/q2?x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}`);
  const data = await res.json();
  show(data.results);
}

async function q3() {
  const user = document.getElementById('user').value.trim();

  const res = await fetch(`/api/analytics/q3?username=${encodeURIComponent(user)}`);
  const data = await res.json();
  show(data.results);
}

async function q4() {
  const date = document.getElementById('date').value;

  const res = await fetch(`/api/analytics/q4?date=${encodeURIComponent(date)}`);
  const data = await res.json();
  show(data.results);
}

async function q5() {
  const res = await fetch('/api/analytics/q5');
  const data = await res.json();
  show(data.results);
}

async function q6() {
  const res = await fetch('/api/analytics/q6');
  const data = await res.json();
  show(data.results);
}