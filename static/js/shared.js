const CART_KEY = "techstore-cart";

function getProductById(id) {
  return PRODUCTS.find((product) => product.id === id);
}

function formatRatingParen(rating) {
  if (Number.isInteger(rating)) {
    return `(${rating})`;
  }
  const rounded = Math.round(rating * 10) / 10;
  return `(${rounded})`;
}

function ratingStarsHtml(rating, sizeClass) {
  const full = Math.floor(rating);
  const partial = rating - full;
  const useHalf = partial >= 0.25 && partial < 1;
  const empty = Math.max(0, 5 - full - (useHalf ? 1 : 0));
  const star = (src) =>
    `<img src="${src}" alt="" class="${sizeClass}" aria-hidden="true" />`;
  let html = "";
  for (let i = 0; i < full; i += 1) {
    html += star("../static/icons/star-yellow-400.svg");
  }
  if (useHalf) {
    html += star("../static/icons/star-half-yellow-400.svg");
  }
  for (let i = 0; i < empty; i += 1) {
    html += star("../static/icons/star-gray-200.svg");
  }
  return html;
}

function formatCurrency(value, intlOptions) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    useGrouping: false,
    ...intlOptions,
  }).format(value);
}

let usingLocalCatalog = false;
let serverCart = { items: [], subtotal: 0, total: 0, discount_percentage: 0 };
const TOKEN_KEY = "techstore-token";
function getCart() { return serverCart.items.map(item => ({ id: item.product_id, itemId: item.id, quantity: item.quantity })); }
async function apiRequest(path, options = {}) {
  const headers = { ...options.headers };
  if (options.body) headers["Content-Type"] = "application/json";
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE_URL}${path}`, { ...options, headers });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    if (response.status === 401) { localStorage.removeItem(TOKEN_KEY); serverCart = { items: [], subtotal: 0, total: 0, discount_percentage: 0 }; updateCartBadge(); }
    throw new Error(payload.error || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}
async function refreshCart() {
  if (!localStorage.getItem(TOKEN_KEY)) return;
  serverCart = await apiRequest("/api/cart");
  serverCart.items ||= [];
  updateCartBadge();
}
function requireLogin() {
  if (localStorage.getItem(TOKEN_KEY)) return true;
  document.getElementById("authDialog").showModal();
  return false;
}
function initAuth() {
  const header = document.querySelector("header");
  if (!header) return;
  const button = document.createElement("button");
  button.type = "button";
  button.className = "auth-trigger";
  button.textContent = localStorage.getItem(TOKEN_KEY) ? "Sign out" : "Sign in / Register";
  const controls = header.querySelector("#mobileNavToggle")?.parentElement;
  if (controls) controls.insertBefore(button, header.querySelector("#mobileNavToggle"));
  else header.append(button);
  const dialog = document.createElement("dialog");
  dialog.id = "authDialog";
  dialog.setAttribute("aria-labelledby", "authTitle");
  dialog.className = "auth-dialog";
  dialog.innerHTML = `<form id="authForm" class="auth-form"><button type="button" id="authClose" class="auth-close" aria-label="Close">&times;</button><div class="auth-brand">T</div><h2 id="authTitle">Welcome to TechStore</h2><p class="auth-subtitle">Sign in or create an account to manage your cart.</p><label>Email<input name="email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label>Password<input name="password" type="password" autocomplete="current-password" minlength="8" maxlength="72" required placeholder="At least 8 characters"></label><p id="authError" class="auth-error" role="alert"></p><button type="submit" name="action" value="login" class="auth-primary">Sign in</button><button type="submit" name="action" value="register" class="auth-secondary">Create an account</button></form>`;  document.body.append(dialog);
  button.onclick = () => { if (localStorage.getItem(TOKEN_KEY)) { localStorage.removeItem(TOKEN_KEY); location.reload(); } else dialog.showModal(); };
  dialog.querySelector("#authClose").onclick = () => dialog.close();
  dialog.querySelector("form").onsubmit = async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const body = JSON.stringify({ email: form.elements.namedItem("email").value, password: form.elements.namedItem("password").value });
    try {
      if (event.submitter.value === "register") await apiRequest("/api/auth/register", { method: "POST", body });
      const result = await apiRequest("/api/auth/login", { method: "POST", body });
      localStorage.setItem(TOKEN_KEY, result.token);
      location.reload();
    } catch (error) { dialog.querySelector("#authError").textContent = error.message; }
  };
}
function updateCartBadge() {
  const count = getCart().reduce((total, item) => total + item.quantity, 0);
  const badges = document.querySelectorAll("[data-cart-count]");

  badges.forEach((badge) => {
    badge.textContent = String(count);
    badge.hidden = count === 0;
  });
}

function bindMobileNav() {
  const toggle = document.getElementById("mobileNavToggle");
  const nav = document.getElementById("mobileNav");
  if (!toggle || !nav) {
    return;
  }

  function setOpen(open) {
    toggle.setAttribute("aria-expanded", String(open));
    if (open) {
      nav.removeAttribute("hidden");
    } else {
      nav.setAttribute("hidden", "");
    }
  }

  toggle.addEventListener("click", () => {
    const open = toggle.getAttribute("aria-expanded") === "true";
    setOpen(!open);
  });

  nav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setOpen(false);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      setOpen(false);
    }
  });

  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 768px)").matches) {
      setOpen(false);
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  bindMobileNav();
});


const API_BASE_URL = window.TECHSTORE_API_URL || (window.location.protocol === "file:" ? "http://localhost:8080" : "");

function normalizeApiProduct(product) {
  const image = Array.isArray(product.images) && product.images.length ? product.images[0] : "";
  return {
    ...product,
    name: product.title,
    image,
    category: product.category || "Electronics",
    specs: product.specs || [],
    highlights: product.highlights || [],
  };
}

function showCatalogNotice(text) {
  const message = document.createElement("p");
  message.className = "catalog-notice";
  message.setAttribute("role", "status");
  message.textContent = text;
  document.querySelector("main")?.prepend(message);
}
async function loadProducts() {
  try {
    let page = 1;
    const products = [];
    let totalPages;
    do {
      const payload = await apiRequest(`/api/products?page=${page}&limit=100`);
      if (!Array.isArray(payload.items) || !payload.meta) throw new Error("Invalid catalog response");
      products.push(...payload.items);
      totalPages = payload.meta.total_pages;
      page += 1;
    } while (page <= totalPages);
    if (typeof PRODUCTS !== "undefined") {
      if (products.length) PRODUCTS = products.map(normalizeApiProduct);
      else { usingLocalCatalog = true; showCatalogNotice("The server catalog is empty. Showing the sample catalog; add products to the server to use the cart."); }
    }
  } catch (error) {
    if (typeof PRODUCTS !== "undefined") usingLocalCatalog = true;
    console.error(error);
    const message = document.createElement("p");
    message.setAttribute("role", "alert");
    message.textContent = "Server unavailable. Showing the sample catalog; the cart requires a connection.";
    document.body.prepend(message);
  }
  try { await refreshCart(); } catch (error) { console.error(error); }
  document.dispatchEvent(new Event("products:ready"));
}
document.addEventListener("DOMContentLoaded", () => { initAuth(); loadProducts(); });