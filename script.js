// ===== LOGIN =====
function login() {
  const role = document.getElementById("role").value;
  const user = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value.trim();

  if (role === "admin" && user === "admin" && pass === "1234") {
    localStorage.setItem("loggedInUser", "admin");
    window.location.href = "home.html";
  } else if (role === "student" && user && pass) {
    localStorage.setItem("loggedInUser", user);
    window.location.href = "home.html";
  } else {
    alert("Invalid credentials!");
  }
}

// ===== LOGOUT =====
function logout() {
  localStorage.removeItem("loggedInUser");
  window.location.href = "index.html";
}

// ===== MAIN =====
let items = JSON.parse(localStorage.getItem("lostFoundItems")) || [];

// Add a new item
function addItem() {
  const name = document.getElementById("name").value.trim();
  const desc = document.getElementById("desc").value.trim();
  const place = document.getElementById("place").value.trim();
  const type = document.getElementById("type").value;
  const photo = document.getElementById("photo").files[0];
  const user = localStorage.getItem("loggedInUser");

  if (!name || !desc || !place) {
    alert("Please fill all fields!");
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    const newItem = {
      id: Date.now(),
      name,
      desc,
      place,
      type,
      user,
      photo: e.target.result,
      returned: false,
      time: new Date().toLocaleString()
    };
    items.push(newItem);
    localStorage.setItem("lostFoundItems", JSON.stringify(items));
    alert("Item added successfully!");
    displayItems();
    clearForm();
  };
  if (photo) reader.readAsDataURL(photo);
  else reader.onload({ target: { result: "" } });
}

// Display items
function displayItems() {
  const lostDiv = document.getElementById("lostItems");
  const foundDiv = document.getElementById("foundItems");
  if (!lostDiv || !foundDiv) return;

  lostDiv.innerHTML = "";
  foundDiv.innerHTML = "";

  const user = localStorage.getItem("loggedInUser");

  items.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";
    if (item.returned) card.classList.add("returned");

    // Only show "Mark as Returned" if the logged-in user uploaded it
    const canMark = user === item.user;

    card.innerHTML = `
      <img src="${item.photo || ''}" alt="">
      <strong>${item.type}:</strong> ${item.name}<br>
      <strong>Location:</strong> ${item.place}<br>
      <strong>Description:</strong> ${item.desc}<br>
      <small>Reported by: ${item.user}</small><br>
      <small>${item.time}</small><br>
      ${
        item.returned
          ? `<span class="returned-label">✅ Returned</span>`
          : (canMark
              ? `<button onclick="markReturned(${item.id})">✅ Mark as Returned</button>`
              : ``)
      }
      ${user === 'admin' ? `<button onclick="deleteItem(${item.id})">🗑️ Delete</button>` : ''}
    `;

    if (item.type === "Lost") lostDiv.appendChild(card);
    else foundDiv.appendChild(card);
  });
}

// Mark as Returned (only uploader can do this)
function markReturned(id) {
  const index = items.findIndex(i => i.id === id);
  const currentUser = localStorage.getItem("loggedInUser");
  if (index !== -1) {
    if (items[index].user !== currentUser) {
      alert("You can only mark your own items as returned.");
      return;
    }
    items[index].returned = true;
    localStorage.setItem("lostFoundItems", JSON.stringify(items));
    alert("Item marked as returned ✅");
    displayItems();
  }
}

// Admin can delete any item
function deleteItem(id) {
  if (!confirm("Delete this item?")) return;
  items = items.filter(i => i.id !== id);
  localStorage.setItem("lostFoundItems", JSON.stringify(items));
  displayItems();
}

function clearForm() {
  ["name", "desc", "place", "photo"].forEach(id => {
    document.getElementById(id).value = "";
  });
}

// Search items
function searchItem(type) {
  const query = document.getElementById(type === "Lost" ? "searchLost" : "searchFound").value.toLowerCase();
  const filtered = items.filter(i =>
    i.type === type &&
    (i.name.toLowerCase().includes(query) ||
      i.desc.toLowerCase().includes(query) ||
      i.place.toLowerCase().includes(query))
  );
  displayFiltered(filtered, type);
}

function displayFiltered(filtered, type) {
  const div = document.getElementById(type === "Lost" ? "lostItems" : "foundItems");
  div.innerHTML = "";
  const user = localStorage.getItem("loggedInUser");
  filtered.forEach(item => {
    const card = document.createElement("div");
    card.className = "item-card";
    if (item.returned) card.classList.add("returned");

    const canMark = user === item.user;

    card.innerHTML = `
      <img src="${item.photo || ''}" alt="">
      <strong>${item.type}:</strong> ${item.name}<br>
      <strong>Location:</strong> ${item.place}<br>
      <strong>Description:</strong> ${item.desc}<br>
      <small>Reported by: ${item.user}</small><br>
      <small>${item.time}</small><br>
      ${
        item.returned
          ? `<span class="returned-label">✅ Returned</span>`
          : (canMark
              ? `<button onclick="markReturned(${item.id})">✅ Mark as Returned</button>`
              : ``)
      }
    `;
    div.appendChild(card);
  });
}

// Tab switching
function showTab(tab) {
  document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
  document.getElementById(tab).classList.add("active");
}

// Run on load
window.onload = function() {
  if (window.location.pathname.endsWith("home.html")) {
    const user = localStorage.getItem("loggedInUser");
    if (!user) {
      window.location.href = "index.html";
      return;
    }
    displayItems();
  }
};
