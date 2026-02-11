// frontend.js

const API_URL = "https://social-committee.onrender.com"; // Render API
let API_PASSWORD = sessionStorage.getItem("apiPassword");  // check if already stored

const form = document.getElementById("form");
const list = document.getElementById("list");
const summary = document.getElementById("summary");

const nameInput = document.getElementById("name");
const costInput = document.getElementById("cost");
const qtyInput = document.getElementById("qty");
const priceInput = document.getElementById("price");

let editingId = null;
let currentItems = [];

// =======================
// ONE-TIME PASSWORD PROMPT
// =======================
async function getPassword() {
  if (!API_PASSWORD) {
    API_PASSWORD = prompt("Enter site password:");
    if (!API_PASSWORD) {
      alert("Password required. Reloading...");
      throw new Error("No password entered");
    }
    sessionStorage.setItem("apiPassword", API_PASSWORD);
  }
}

// =======================
// SECURE FETCH HELPER
// =======================
async function secureFetch(url, options = {}) {
  options.headers = {
    ...(options.headers || {}),
    "x-api-password": API_PASSWORD
  };

  const res = await fetch(url, options);

  if (res.status === 401) {
    sessionStorage.removeItem("apiPassword");
    alert("Wrong password. Reloading...");
    location.reload();
    return;
  }

  return res;
}

// =======================
// INIT
// =======================
async function init() {
  await getPassword();       // ask for password first
  nameInput.focus();
  loadItems();               // now fetch safely
}

window.addEventListener("load", init);

// =======================
// ADD OR UPDATE ITEM
// =======================
form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const item = {
    name: nameInput.value,
    bulkCost: Number(costInput.value),
    bulkQuantity: Number(qtyInput.value),
    sellPrice: Number(priceInput.value)
  };

  if (editingId) {
    await secureFetch(`${API_URL}/items/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
    editingId = null;
  } else {
    await secureFetch(`${API_URL}/items`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
  }

  form.reset();
  nameInput.focus();
  loadItems();
});

// =======================
// LOAD ITEMS
// =======================
async function loadItems() {
  const res = await secureFetch(`${API_URL}/items`);
  const data = await res.json();

  currentItems = data;

  const totalCost = data.reduce((sum, item) => sum + item.bulkCost, 0);
  const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0);
  const totalProfit = data.reduce((sum, item) => sum + item.totalProfit, 0);
  const totalProducts = data.length;

  summary.innerHTML = `
    <h2>Booster Club Summary</h2>
    Products: ${totalProducts}<br>
    Total Invested: $${totalCost.toFixed(2)}<br>
    Projected Revenue: $${totalRevenue.toFixed(2)}<br>
    Projected Profit: $${totalProfit.toFixed(2)}
  `;

  list.innerHTML = data.map(item => `
    <div id="data">
      <strong>${item.name}</strong><br>
      <p>Bulk Cost (total paid): $${item.bulkCost.toFixed(2)}</p>
      <p>Selling Price (each): $${item.sellPrice.toFixed(2)}</p>
      <p>Quantity in Bulk: ${item.bulkQuantity}</p>
      <p>Cost per item: $${item.costPerItem.toFixed(2)}</p>
      <p>Revenue: $${item.revenue.toFixed(2)}</p>
      <p>Profit: $${item.totalProfit.toFixed(2)}</p>
      <button onclick="deleteItem('${item.id}')">Delete</button>
      <button onclick="editItem('${item.id}')">Edit</button>
    </div>
    <hr>
  `).join("");
}

// =======================
// DELETE ITEM
// =======================
async function deleteItem(id) {
  await secureFetch(`${API_URL}/items/${id}`, { method: "DELETE" });
  loadItems();
}

// =======================
// EDIT ITEM
// =======================
function editItem(id) {
  const item = currentItems.find(i => i.id === id);

  nameInput.value = item.name;
  costInput.value = item.bulkCost;
  qtyInput.value = item.bulkQuantity;
  priceInput.value = item.sellPrice;

  editingId = id;
  nameInput.focus();
}
