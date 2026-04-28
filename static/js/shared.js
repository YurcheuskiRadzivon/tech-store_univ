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

function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed)
      ? parsed.filter((item) => Number.isFinite(item.id) && item.quantity > 0)
      : [];
  } catch (error) {
    return [];
  }
}

function setCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartBadge();
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

