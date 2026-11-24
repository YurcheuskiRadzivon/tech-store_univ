const ADMIN_PAGE_SIZE = 10;

const adminState = {
  page: 1,
  totalPages: 1,
  search: "",
  sortBy: "title",
  order: "asc",
  products: [],
  editingId: null,
  deletingId: null,
};

function adminEscape(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

const ADMIN_EDIT_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`;
const ADMIN_TRASH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="h-4 w-4" aria-hidden="true"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path><line x1="10" x2="10" y1="11" y2="17"></line><line x1="14" x2="14" y1="11" y2="17"></line></svg>`;

function showAdminMessage(text, type) {
  const box = document.getElementById("adminMessage");
  if (!text) {
    box.hidden = true;
    box.textContent = "";
    return;
  }
  box.hidden = false;
  box.dataset.type = type || "info";
  box.textContent = text;
}

function adminRowHtml(product) {
  const image = Array.isArray(product.images) && product.images.length ? product.images[0] : "";
  const stock = Number(product.stock_quantity) || 0;
  const stockClass = stock === 0 ? "admin-stock admin-stock-out" : stock < 5 ? "admin-stock admin-stock-low" : "admin-stock";
  return `
    <tr>
      <td>
        <div class="admin-product">
          <div class="admin-thumb">${image ? `<img src="${adminEscape(image)}" alt="" loading="lazy" />` : ""}</div>
          <div class="min-w-0">
            <a class="font-semibold hover:text-blue-600 transition-colors" href="./product.html?id=${product.id}">${adminEscape(product.title)}</a>
            <p class="text-xs text-gray-500">ID ${product.id}</p>
          </div>
        </div>
      </td>
      <td class="font-semibold text-blue-600">${adminEscape(formatCurrency(product.price))}</td>
      <td><span class="admin-rating"><img src="../static/icons/star-yellow-400.svg" alt="" class="h-4 w-4" aria-hidden="true" />${adminEscape(Number(product.rating).toFixed(1))}</span></td>
      <td><span class="${stockClass}">${stock === 0 ? "Out of stock" : stock}</span></td>
      <td>
        <div class="admin-actions">
          <button type="button" class="admin-icon-btn" data-edit="${product.id}" aria-label="Edit ${adminEscape(product.title)}">${ADMIN_EDIT_SVG}</button>
          <button type="button" class="admin-icon-btn admin-icon-danger" data-delete="${product.id}" aria-label="Delete ${adminEscape(product.title)}">${ADMIN_TRASH_SVG}</button>
        </div>
      </td>
    </tr>`;
}

async function loadAdminProducts() {
  const params = new URLSearchParams({
    page: String(adminState.page),
    limit: String(ADMIN_PAGE_SIZE),
    sort_by: adminState.sortBy,
    order: adminState.order,
  });
  if (adminState.search) params.set("search", adminState.search);

  const rows = document.getElementById("adminRows");
  try {
    const payload = await apiRequest(`/api/products?${params}`);
    const meta = payload.meta || {};
    adminState.products = payload.items || [];
    adminState.totalPages = Math.max(1, meta.total_pages || 1);
    if (adminState.page > adminState.totalPages) {
      adminState.page = adminState.totalPages;
      return loadAdminProducts();
    }
    rows.innerHTML = adminState.products.length
      ? adminState.products.map(adminRowHtml).join("")
      : `<tr><td colspan="5" class="admin-empty">No products found.</td></tr>`;
    const total = meta.total_items || 0;
    document.getElementById("adminCount").textContent = `${total} product${total === 1 ? "" : "s"} in the catalog`;
    document.getElementById("adminPage").textContent = `Page ${adminState.page} of ${adminState.totalPages}`;
    document.getElementById("adminPrev").disabled = adminState.page <= 1;
    document.getElementById("adminNext").disabled = adminState.page >= adminState.totalPages;
  } catch (error) {
    rows.innerHTML = `<tr><td colspan="5" class="admin-empty">Could not load products.</td></tr>`;
    showAdminMessage(error.message, "error");
  }
}

function openProductDialog(product) {
  const dialog = document.getElementById("productDialog");
  const form = document.getElementById("productForm");
  form.reset();
  document.getElementById("productFormError").textContent = "";
  adminState.editingId = product ? product.id : null;
  document.getElementById("productDialogTitle").textContent = product ? "Edit product" : "Add product";
  document.getElementById("productSave").textContent = product ? "Save changes" : "Create product";
  if (product) {
    form.elements.title.value = product.title;
    form.elements.description.value = product.description || "";
    form.elements.price.value = product.price;
    form.elements.rating.value = product.rating;
    form.elements.stock_quantity.value = product.stock_quantity;
    form.elements.images.value = (product.images || []).join("\n");
  }
  dialog.showModal();
  form.elements.title.focus();
}

function readProductForm(form) {
  const number = (name) => (form.elements[name].value.trim() === "" ? NaN : Number(form.elements[name].value));
  const product = {
    title: form.elements.title.value.trim(),
    description: form.elements.description.value.trim(),
    price: number("price"),
    rating: number("rating"),
    stock_quantity: number("stock_quantity"),
    images: form.elements.images.value.split(/\s*\n\s*/).map((url) => url.trim()).filter(Boolean),
  };
  if (!product.title) return { error: "Title is required." };
  if (!(product.price >= 0)) return { error: "Price must be 0 or more." };
  if (!(product.rating >= 0 && product.rating <= 5)) return { error: "Rating must be between 0 and 5." };
  if (!Number.isInteger(product.stock_quantity) || product.stock_quantity < 0) return { error: "Stock must be a whole number, 0 or more." };
  if (product.images.length < 3) return { error: "Add at least 3 image URLs, one per line." };
  if (product.images.some((url) => !/^https?:\/\//i.test(url))) return { error: "Image URLs must start with http:// or https://." };
  return { product };
}

async function submitProductForm(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const errorBox = document.getElementById("productFormError");
  const saveButton = document.getElementById("productSave");
  const { product, error } = readProductForm(form);
  if (error) {
    errorBox.textContent = error;
    return;
  }
  saveButton.disabled = true;
  try {
    const editing = adminState.editingId;
    if (editing) {
      await apiRequest(`/api/products/${editing}`, { method: "PUT", body: JSON.stringify(product) });
    } else {
      await apiRequest("/api/products", { method: "POST", body: JSON.stringify(product) });
    }
    document.getElementById("productDialog").close();
    showAdminMessage(editing ? `“${product.title}” was updated.` : `“${product.title}” was created.`, "success");
    await loadAdminProducts();
  } catch (err) {
    errorBox.textContent = err.message;
  } finally {
    saveButton.disabled = false;
  }
}

function openDeleteDialog(product) {
  adminState.deletingId = product.id;
  document.getElementById("deleteFormError").textContent = "";
  document.getElementById("deleteDialogText").textContent = `“${product.title}” will be removed from the catalog. Customers will no longer see it.`;
  document.getElementById("deleteDialog").showModal();
}

async function submitDelete(event) {
  event.preventDefault();
  const button = document.getElementById("deleteConfirm");
  const product = adminState.products.find((item) => item.id === adminState.deletingId);
  button.disabled = true;
  try {
    await apiRequest(`/api/products/${adminState.deletingId}`, { method: "DELETE" });
    document.getElementById("deleteDialog").close();
    showAdminMessage(`“${product ? product.title : "Product"}” was deleted.`, "success");
    await loadAdminProducts();
  } catch (err) {
    document.getElementById("deleteFormError").textContent = err.message;
  } finally {
    button.disabled = false;
  }
}

function initAdminPage() {
  const gate = document.getElementById("adminGate");
  const layout = document.getElementById("adminLayout");
  if (!gate || !layout) return;

  if (!isAdmin()) {
    gate.hidden = false;
    const signedIn = Boolean(localStorage.getItem(TOKEN_KEY));
    if (signedIn) {
      document.getElementById("adminGateText").textContent = "Your account does not have administrator rights.";
      document.getElementById("adminSignIn").hidden = true;
    }
    document.getElementById("adminSignIn").addEventListener("click", () => document.getElementById("authDialog")?.showModal());
    return;
  }
  layout.hidden = false;

  document.getElementById("adminAdd").addEventListener("click", () => openProductDialog(null));
  document.getElementById("adminFilters").addEventListener("submit", (event) => {
    event.preventDefault();
    adminState.search = document.getElementById("adminSearch").value.trim();
    adminState.page = 1;
    loadAdminProducts();
  });
  document.getElementById("adminSort").addEventListener("change", (event) => {
    [adminState.sortBy, adminState.order] = event.target.value.split(":");
    adminState.page = 1;
    loadAdminProducts();
  });
  document.getElementById("adminPrev").addEventListener("click", () => {
    adminState.page -= 1;
    loadAdminProducts();
  });
  document.getElementById("adminNext").addEventListener("click", () => {
    adminState.page += 1;
    loadAdminProducts();
  });
  document.getElementById("adminRows").addEventListener("click", (event) => {
    const edit = event.target.closest("[data-edit]");
    const del = event.target.closest("[data-delete]");
    const id = Number((edit || del)?.dataset.edit || (edit || del)?.dataset.delete);
    const product = adminState.products.find((item) => item.id === id);
    if (!product) return;
    if (edit) openProductDialog(product);
    else openDeleteDialog(product);
  });

  document.getElementById("productForm").addEventListener("submit", submitProductForm);
  document.getElementById("productDialogClose").addEventListener("click", () => document.getElementById("productDialog").close());
  document.getElementById("productCancel").addEventListener("click", () => document.getElementById("productDialog").close());
  document.getElementById("deleteForm").addEventListener("submit", submitDelete);
  document.getElementById("deleteCancel").addEventListener("click", () => document.getElementById("deleteDialog").close());

  loadAdminProducts();
}

document.addEventListener("products:ready", () => {
  updateCartBadge();
  initAdminPage();
});
