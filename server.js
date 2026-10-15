const express = require("express");
const path = require("path");

const app = express();
const PORT = 5000;

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

const products = [
  { id: 1, name: "Laptop", category: "Electronics", price: 55000 },
  { id: 2, name: "Smartphone", category: "Electronics", price: 25000 },
  { id: 3, name: "Headphones", category: "Electronics", price: 2000 },
  { id: 4, name: "T-Shirt", category: "Clothing", price: 800 },
  { id: 5, name: "Jeans", category: "Clothing", price: 1500 },
  { id: 6, name: "Running Shoes", category: "Footwear", price: 3000 },
  { id: 7, name: "Sandals", category: "Footwear", price: 900 },
  { id: 8, name: "Backpack", category: "Accessories", price: 1200 },
  { id: 9, name: "Watch", category: "Accessories", price: 4000 },
  { id: 10, name: "Tablet", category: "Electronics", price: 18000 },
  { id: 11, name: "Jacket", category: "Clothing", price: 2500 },
  { id: 12, name: "Cap", category: "Accessories", price: 500 }
];

app.get("/api/products", (req, res) => {
  const search = (req.query.search || "").toLowerCase().trim();
  const categories = req.query.category
    ? req.query.category.split(",").map(c => c.trim().toLowerCase())
    : [];

  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 6));

  let results = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(search);
    const matchesCategory =
      categories.length === 0 ||
      categories.includes(product.category.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  const total = results.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;

  results = results.slice(start, start + limit);

  res.json({
    products: results,
    page,
    limit,
    total,
    totalPages
  });
});

app.get("/api/categories", (req, res) => {
  res.json([...new Set(products.map(product => product.category))]);
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});