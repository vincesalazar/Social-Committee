const form = document.getElementById("form");
const list = document.getElementById("list");

const nameInput = document.getElementById("name");
const costInput = document.getElementById("cost");
const qtyInput = document.getElementById("qty");
const priceInput = document.getElementById("price");

let editingId = null;

window.addEventListener("load", () => {
  nameInput.focus();
  loadItems();
});


form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const item = {
    name: nameInput.value,
    bulkCost: Number(costInput.value),
    bulkQuantity: Number(qtyInput.value),
    sellPrice: Number(priceInput.value)
  };

  if (editingId) {
    await fetch(`http://localhost:3000/items/${editingId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });

    editingId = null;

  } else {
    await fetch("http://localhost:3000/items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(item)
    });
  }

  form.reset();
  nameInput.focus();
  loadItems();
});

let currentItems = [];

async function loadItems() {
  const res = await fetch("http://localhost:3000/items");
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

async function deleteItem(id) {
  await fetch(`http://localhost:3000/items/${id}`, {
    method: "DELETE"
  });

  loadItems();
}


loadItems();

function capitalizeFirstLetter(val) {
    return String(val).charAt(0).toUpperCase() + String(val).slice(1);
}

function editItem(id) {
  const item = currentItems.find(i => i.id === id);

  nameInput.value = item.name;
  costInput.value = item.bulkCost;
  qtyInput.value = item.bulkQuantity;
  priceInput.value = item.sellPrice;

  editingId = id;
  nameInput.focus();
}

