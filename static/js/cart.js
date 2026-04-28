function escapeHtml(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const PROMO_KEY = "techstore-promo";
const TAX_RATE = 0.08;
const PROMO_CODE = "SAVE10";
const PROMO_DISCOUNT = 0.1;

function getPromo() {
  return localStorage.getItem(PROMO_KEY);
}

function setPromo(code) {
  localStorage.setItem(PROMO_KEY, code);
}

function clearPromo() {
  localStorage.removeItem(PROMO_KEY);
}

function removeFromCart(productId) {
  const nextCart = getCart().filter((item) => item.id !== productId);
  setCart(nextCart);
}

function changeCartQuantity(productId, direction) {
  const cart = getCart()
    .map((item) => {
      if (item.id !== productId) {
        return item;
      }

      return {
        ...item,
        quantity: item.quantity + direction,
      };
    })
    .filter((item) => item.quantity > 0);

  setCart(cart);
}

const CART_TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`;

const CART_MINUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" aria-hidden="true"><path d="M5 12h14"></path></svg>`;

const CART_PLUS_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-3 w-3" aria-hidden="true"><path d="M5 12h14"></path><path d="M12 5v14"></path></svg>`;

function initCartPage() {
  updateCartBadge();

  const cartItems = document.getElementById("cartItems");
  const emptyCartState = document.getElementById("emptyCartState");
  const summarySubtotal = document.getElementById("summarySubtotal");
  const summaryDiscountRow = document.getElementById("summaryDiscountRow");
  const summaryDiscountLabel = document.getElementById("summaryDiscountLabel");
  const summaryDiscount = document.getElementById("summaryDiscount");
  const summaryTax = document.getElementById("summaryTax");
  const summaryTotal = document.getElementById("summaryTotal");
  const promoInput = document.getElementById("promoInput");
  const promoButton = document.getElementById("promoButton");
  const promoHint = document.getElementById("promoHint");
  const promoMessage = document.getElementById("promoMessage");
  const checkoutButton = document.getElementById("checkoutButton");
  const cartLayout = document.getElementById("cartLayout");

  if (!cartItems || !emptyCartState) {
    return;
  }

  document.title = "Shopping Cart · TechStore";

  const syncPromoUi = () => {
    const applied = getPromo() === PROMO_CODE;
    if (promoInput) {
      promoInput.disabled = applied;
      if (applied) {
        promoInput.value = PROMO_CODE;
      }
    }
    if (promoButton) {
      promoButton.disabled = applied;
    }
    if (promoHint) {
      promoHint.hidden = applied;
    }
  };

  const renderCart = () => {
    const cart = getCart();
    const items = cart
      .map((entry) => {
        const product = getProductById(entry.id);
        if (!product) {
          return null;
        }

        return {
          ...product,
          quantity: entry.quantity,
        };
      })
      .filter(Boolean);

    if (items.length === 0) {
      clearPromo();
      if (promoInput) {
        promoInput.value = "";
      }
      cartItems.innerHTML = "";
      emptyCartState.hidden = false;
      if (cartLayout) {
        cartLayout.hidden = true;
        cartLayout.classList.add("hidden");
      }
      updateSummary([]);
      syncPromoUi();
      hidePromoMessage();
      return;
    }

    emptyCartState.hidden = true;
    if (cartLayout) {
      cartLayout.hidden = false;
      cartLayout.classList.remove("hidden");
    }

    cartItems.innerHTML = items
      .map((item) => {
        const name = escapeHtml(item.name);
        const cat = escapeHtml(item.category);
        const lineTotal = formatCurrency(item.price * item.quantity);
        const each = formatCurrency(item.price);
        const minusDisabled = item.quantity <= 1;
        return `
        <div class="flex flex-col sm:flex-row gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:p-6">
          <div class="w-full sm:w-32 h-32 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            <img src="${item.image}" alt="${name}" class="h-full w-full object-cover" />
          </div>
          <div class="flex flex-1 flex-col justify-between min-w-0">
            <div>
              <div class="flex items-start justify-between gap-4">
                <div class="min-w-0">
                  <a class="font-semibold hover:text-blue-600 transition-colors" href="./product.html?id=${item.id}" data-discover="true">${name}</a>
                  <p class="mt-1 text-sm text-gray-500">${cat}</p>
                </div>
                <button type="button" class="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors" aria-label="Remove item" data-remove-item="${item.id}">
                  ${CART_TRASH_SVG}
                </button>
              </div>
            </div>
            <div class="flex items-center justify-between mt-4 gap-4 flex-wrap">
              <div class="flex items-center gap-3">
                <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed" aria-label="Decrease quantity" data-qty-change="${item.id}" data-direction="-1"${minusDisabled ? " disabled" : ""}>
                  ${CART_MINUS_SVG}
                </button>
                <span class="w-8 text-center font-semibold">${item.quantity}</span>
                <button type="button" class="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors" aria-label="Increase quantity" data-qty-change="${item.id}" data-direction="1">
                  ${CART_PLUS_SVG}
                </button>
              </div>
              <div class="text-right">
                <p class="font-bold text-lg text-blue-600">${lineTotal}</p>
                <p class="text-xs text-gray-500">${each} each</p>
              </div>
            </div>
          </div>
        </div>`;
      })
      .join("");

    updateSummary(items);
    syncPromoUi();
    if (getPromo() === PROMO_CODE) {
      showPromoMessage("Promo code applied successfully!", "success");
    }
  };

  if (promoInput) {
    const storedPromo = getPromo();
    if (storedPromo) {
      promoInput.value = storedPromo;
    }
  }

  function hidePromoMessage() {
    if (!promoMessage) {
      return;
    }
    promoMessage.hidden = true;
    promoMessage.textContent = "";
    promoMessage.className = "mt-2 text-xs hidden";
  }

  if (promoButton && promoInput) {
    promoButton.addEventListener("click", () => {
      const code = promoInput.value.trim().toUpperCase();

      if (!code) {
        clearPromo();
        hidePromoMessage();
        if (promoHint) {
          promoHint.hidden = false;
        }
        renderCart();
        return;
      }

      if (code === PROMO_CODE) {
        setPromo(code);
        showPromoMessage("Promo code applied successfully!", "success");
      } else {
        clearPromo();
        showPromoMessage("Invalid promo code.", "error");
      }

      renderCart();
    });
  }

  if (checkoutButton) {
    checkoutButton.addEventListener("click", () => {
      window.alert(
        "Checkout flow is not connected yet, but the cart logic is ready.",
      );
    });
  }

  cartItems.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-item]");
    const qtyButton = event.target.closest("[data-qty-change]");

    if (removeButton) {
      removeFromCart(Number(removeButton.dataset.removeItem));
      renderCart();
      return;
    }

    if (qtyButton) {
      if (qtyButton.disabled) {
        return;
      }
      const productId = Number(qtyButton.dataset.qtyChange);
      const direction = Number(qtyButton.dataset.direction);
      changeCartQuantity(productId, direction);
      renderCart();
    }
  });

  renderCart();

  function updateSummary(items) {
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
    const discount = getPromo() === PROMO_CODE ? subtotal * PROMO_DISCOUNT : 0;
    const taxableBase = Math.max(subtotal - discount, 0);
    const tax = taxableBase * TAX_RATE;
    const total = taxableBase + tax;

    if (summarySubtotal) {
      summarySubtotal.textContent = formatCurrency(subtotal);
    }
    if (summaryDiscount && summaryDiscountRow && summaryDiscountLabel) {
      if (discount > 0) {
        summaryDiscountRow.hidden = false;
        summaryDiscountRow.classList.remove("hidden");
        summaryDiscountLabel.textContent = `Discount (${PROMO_CODE})`;
        summaryDiscount.textContent = "-" + formatCurrency(discount);
      } else {
        summaryDiscountRow.hidden = true;
        summaryDiscountRow.classList.add("hidden");
        summaryDiscountLabel.textContent = "Discount";
        summaryDiscount.textContent = formatCurrency(0);
      }
    }
    if (summaryTax) {
      summaryTax.textContent = formatCurrency(tax);
    }
    if (summaryTotal) {
      summaryTotal.textContent = formatCurrency(total);
    }
  }

  function showPromoMessage(message, type) {
    if (!promoMessage) {
      return;
    }

    promoMessage.hidden = false;
    promoMessage.className =
      type === "success"
        ? "mt-2 text-xs text-green-600"
        : "mt-2 text-xs text-red-600";
    promoMessage.textContent = message;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initCartPage();
});
