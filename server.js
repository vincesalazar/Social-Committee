const express = require("express");
const cors = require("cors");
const { randomUUID } = require("crypto");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;
const DATA_FILE = "inventory.json";

// ===== PUT THE PASSWORD HERE =====
const API_PASSWORD = "MySecret123"; // <-- This is the password your frontend will send

// ===== PASSWORD PROTECTION MIDDLEWARE =====
app.use((req, res, next) => {
  const password = req.headers["x-api-password"]; // fetch header from frontend
  if (password !== API_PASSWORD) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
});

let inventory = [];

// Load inventory from file if it exists
if (fs.existsSync(DATA_FILE)) {
  try {
    const fileData = fs.readFileSync(DATA_FILE, "utf-8");
    inventory = JSON.parse(fileData);
    console.log("Inventory loaded from file.");
  } catch (err) {
    console.error("Error loading inventory file:", err);
  }
}

function saveInventory() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(inventory, null, 2));
  } catch (err) {
    console.error("Error saving inventory:", err);
  }
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
