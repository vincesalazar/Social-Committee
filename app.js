// frontend.js

const API_URL = "https://social-committee.onrender.com"; // Your Render API
let API_PASSWORD = sessionStorage.getItem("apiPassword");  // Check if user already entered

// ===== ONE-TIME PASSWORD PROMPT =====
if (!API_PASSWORD) {
  API_PASSWORD = prompt("Enter site password:"); // Ask user once

  if (!API_PASSWORD) {
    alert("Password required. Reloading...");
    throw new Error("No password entered");
  }

  sessionStorage.setItem("apiPassword", API_PASSWORD); // store for this session
}

const form = document.getElementById("form");
const list = document.getElementById("list");

const nameInput = document.getElementById("name");
const costInput = document.getElementById("cost");
const qtyInput = document.getElementById("qty");
const priceInput = document.getElementById("price");

let editingId = null;
let currentItems = [];

window.addEventListener("load", () => {
  nameInput.focus();
  loadItems();
});


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
    await fetch(`${API_URL}/items/${editingId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-api-password": API_PASSWORD
      },
      body: JSON.stringify(item)
    });

    editingId = null;

  } else {
    await fetch(`${API_URL}/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-password": API_PASSWORD
      },
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
  const res = await fetch(`${API_URL}/items`, {
    headers: {
      "x-api-password": API_PASSWORD
    }
  });

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
  await fetch(`${API_URL}/items/${id}`, {
    method: "DELETE",
    headers: {
      "x-api-password": API_PASSWORD
    }
  });

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
