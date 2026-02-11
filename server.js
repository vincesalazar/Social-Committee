const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATA_FILE = "inventory.json";

let inventory = [];

// load inventory from file if exists
if (fs.existsSync(DATA_FILE)) {
  inventory = JSON.parse(fs.readFileSync(DATA_FILE));
}

// helper function to save inventory
function saveInventory() {
  fs.writeFileSync(DATA_FILE, JSON.stringify(inventory, null, 2));
}

// profit calculator function
function calculate(item) {
  const costPerItem = item.bulkCost / item.bulkQuantity;
  const revenue = item.sellPrice * item.bulkQuantity;
  const totalProfit = revenue - item.bulkCost;

  return {
    ...item,
    costPerItem,
    revenue,
    totalProfit
  };
}

// add item
app.post("/items", (req, res) => {
  const calculated = calculate(req.body);
  const itemWithId = { id: randomUUID(), ...calculated };
  inventory.push(itemWithId);
  saveInventory();
  res.json(itemWithId);
});

// delete item
app.delete("/items/:id", (req, res) => {
  const { id } = req.params;
  inventory = inventory.filter(item => item.id !== id);
  saveInventory();
  res.json({ message: "Deleted" });
});

// update item
app.put("/items/:id", (req, res) => {
  const { id } = req.params;
  const updatedItem = { id, ...calculate(req.body) };
  inventory = inventory.map(item => item.id === id ? updatedItem : item);
  saveInventory();
  res.json(updatedItem);
});

// get all items
app.get("/items", (req, res) => {
  res.json(inventory);
});

// start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
