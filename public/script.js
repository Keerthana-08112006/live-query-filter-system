const API_URL = "/api/products";
const CATEGORY_URL = "/api/categories";
const LIMIT = 6;

const searchInput = document.getElementById("searchInput");
const categoryFilters = document.getElementById("categoryFilters");
const productGrid = document.getElementById("productGrid");
const resultCount = document.getElementById("resultCount");
const loading = document.getElementById("loading");
const errorMessage = document.getElementById("errorMessage");
const emptyMessage = document.getElementById("emptyMessage");
const pagination = document.getElementById("pagination");
const clearFilters = document.getElementById("clearFilters");

let currentPage = 1;
let debounceTimer;

function getCategories() {
  return Array.from(
    categoryFilters.querySelectorAll("input:checked")
  ).map(input => input.value);
}

function showMessage(element, message) {
  element.textContent = message;
  element.hidden = false;
}

async function loadCategories() {
  try {
    const response = await fetch(CATEGORY_URL);

    if (!response.ok) throw new Error("Category request failed");

    const categories = await response.json();
    categoryFilters.replaceChildren();

    categories.forEach(category => {
      const label = document.createElement("label");
      label.className = "category-option";

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = category;

      checkbox.addEventListener("change", () => {
        currentPage = 1;
        loadProducts();
      });

      const text = document.createElement("span");
      text.textContent = category;

      label.append(checkbox, text);
      categoryFilters.appendChild(label);
    });
  } catch (error) {
    showMessage(errorMessage, "Could not load categories. Please refresh.");
  }
}

function createProductCard(product) {
  const icons = {
    Electronics: "💻",
    Clothing: "👕",
    Footwear: "👟",
    Accessories: "🎒"
  };

  const card = document.createElement("article");
  card.className = "product-card";

  const icon = document.createElement("div");
  icon.className = "product-icon";
  icon.textContent = icons[product.category] || "📦";

  const category = document.createElement("span");
  category.className = "product-category";
  category.textContent = product.category;

  const name = document.createElement("h3");
  name.textContent = product.name;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0
  }).format(product.price);

  card.append(icon, category, name, price);
  return card;
}

async function loadProducts() {
  loading.hidden = false;
  errorMessage.hidden = true;
  emptyMessage.hidden = true;
  productGrid.replaceChildren();
  pagination.replaceChildren();
  resultCount.textContent = "Loading products...";

  const params = new URLSearchParams();
  params.set("search", searchInput.value.trim());
  params.set("category", getCategories().join(","));
  params.set("page", currentPage);
  params.set("limit", LIMIT);

  try {
    const response = await fetch(`${API_URL}?${params.toString()}`);

    if (!response.ok) {
      throw new Error("Product API returned an error");
    }

    const data = await response.json();

    loading.hidden = true;
    resultCount.textContent =
      `${data.total} product${data.total === 1 ? "" : "s"} found`;

    if (!data.products || data.products.length === 0) {
      showMessage(emptyMessage, "No products found. Try another search.");
      return;
    }

    data.products.forEach(product => {
      productGrid.appendChild(createProductCard(product));
    });

    renderPagination(data.page, data.totalPages);
  } catch (error) {
    loading.hidden = true;
    resultCount.textContent = "Unable to load products";
    showMessage(
      errorMessage,
      "Could not connect to the product API. Please check the server."
    );
  }
}

function renderPagination(page, totalPages) {
  pagination.replaceChildren();

  if (totalPages <= 1) return;

  function addButton(text, targetPage, disabled, active = false) {
    const button = document.createElement("button");
    button.className = "page-button";
    button.textContent = text;
    button.disabled = disabled;

    if (active) button.classList.add("active");

    button.addEventListener("click", () => {
      currentPage = targetPage;
      loadProducts();
    });

    pagination.appendChild(button);
  }

  addButton("←", page - 1, page === 1);

  for (let number = 1; number <= totalPages; number++) {
    addButton(String(number), number, false, number === page);
  }

  addButton("→", page + 1, page === totalPages);
}

searchInput.addEventListener("input", () => {
  clearTimeout(debounceTimer);

  debounceTimer = setTimeout(() => {
    currentPage = 1;
    loadProducts();
  }, 350);
});

searchInput.addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    clearTimeout(debounceTimer);
    currentPage = 1;
    loadProducts();
  }
});

clearFilters.addEventListener("click", () => {
  searchInput.value = "";

  categoryFilters.querySelectorAll("input").forEach(input => {
    input.checked = false;
  });

  currentPage = 1;
  loadProducts();
});

async function initializeApp() {
  await loadCategories();
  await loadProducts();
}

initializeApp();