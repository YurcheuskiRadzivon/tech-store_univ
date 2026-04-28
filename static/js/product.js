function addToCart(productId, quantity = 1) {
  const qty = Math.max(1, Math.min(99, Math.floor(Number(quantity)) || 1));
  const cart = getCart();
  const existing = cart.find((item) => item.id === productId);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({ id: productId, quantity: qty });
  }

  setCart(cart);
}

function initProductPage() {
  const root = document.getElementById("productPageRoot");
  if (!root) {
    return;
  }

  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id")) || 6;
  const product = getProductById(id);

  if (!product) {
    root.innerHTML = `
      <div class="rounded-lg border border-gray-200 bg-white p-8 text-center">
        <h1 class="mb-2 text-xl font-semibold">Product not found</h1>
        <p class="mb-6 text-gray-600">We could not load this product.</p>
        <a class="text-blue-600 hover:underline" href="./index.html">Back to products</a>
      </div>`;
    return;
  }

  document.title = `${product.name} · TechStore`;

  const images = [product.image, product.image, product.image];
  const specsRows = product.specs
    .map(
      (row) => `
        <div class="flex items-center justify-between border-b pb-2 last:border-b-0">
          <span class="font-medium text-sm text-gray-700">${row.label}</span>
          <span class="text-sm text-gray-600">${row.value}</span>
        </div>`,
    )
    .join("");

  const highlights = product.highlights
    .map(
      (h) =>
        `<li class="flex items-center gap-2"><div class="h-1.5 w-1.5 rounded-full bg-blue-600"></div><span><span class="font-medium">${h.label}:</span> ${h.value}</span></li>`,
    )
    .join("");

  let relatedSection = "";
  if (product.relatedId) {
    const rel = getProductById(product.relatedId);
    if (rel) {
      relatedSection = `
        <div class="mt-12 lg:mt-16">
          <h2 class="mb-6">Related Products</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <a class="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg" href="./product.html?id=${rel.id}" data-discover="true">
              <div class="aspect-square overflow-hidden bg-gray-100">
                <img src="${rel.image}" alt="${rel.name}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              </div>
              <div class="p-4">
                <h3 class="mb-2 line-clamp-2">${rel.name}</h3>
                <div class="mb-3">
                  <div class="flex items-center gap-2">
                    <div class="flex items-center gap-0.5">
                      ${ratingStarsHtml(rel.rating, "h-4 w-4")}
                    </div>
                    <span class="text-sm text-gray-600">${formatRatingParen(rel.rating)}</span>
                  </div>
                </div>
                <div class="flex items-center justify-between">
                  <span class="font-bold text-lg text-blue-600">${formatCurrency(rel.price)}</span>
                  <span class="text-xs text-gray-500 uppercase">${rel.category}</span>
                </div>
              </div>
            </a>
          </div>
        </div>`;
    }
  }

  const accordionOpen = product.accordionOpen === true;
  const accState = accordionOpen ? "open" : "closed";
  const accExpanded = String(accordionOpen);
  const accAriaHidden = accordionOpen ? "false" : "true";

  root.innerHTML = `
    <nav aria-label="breadcrumb" data-slot="breadcrumb" class="mb-6">
      <ol data-slot="breadcrumb-list" class="text-muted-foreground flex flex-wrap items-center gap-1.5 text-sm break-words sm:gap-2.5">
        <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
          <a data-slot="breadcrumb-link" class="hover:text-foreground transition-colors" href="./index.html" data-discover="true">Products</a>
        </li>
        <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="inline-flex [&>svg]:size-3.5 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-3.5 shrink-0" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
        </li>
        <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
          <span class="hover:text-foreground transition-colors">${product.category}</span>
        </li>
        <li data-slot="breadcrumb-separator" role="presentation" aria-hidden="true" class="inline-flex [&>svg]:size-3.5 text-muted-foreground">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right size-3.5 shrink-0" aria-hidden="true"><path d="m9 18 6-6-6-6"></path></svg>
        </li>
        <li data-slot="breadcrumb-item" class="inline-flex items-center gap-1.5">
          <span data-slot="breadcrumb-page" role="link" aria-disabled="true" aria-current="page" class="text-foreground font-normal">${product.name}</span>
        </li>
      </ol>
    </nav>
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
      <div class="space-y-4">
        <div class="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <img id="productHeroImg" src="${images[0]}" alt="${product.name} - Image 1" class="h-full w-full object-cover" />
          <button type="button" id="productImgPrev" class="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-colors" aria-label="Previous image">
            <img src="../static/icons/chevron-left-gray-800.svg" alt="" class="h-5 w-5" aria-hidden="true" />
          </button>
          <button type="button" id="productImgNext" class="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-lg hover:bg-white transition-colors" aria-label="Next image">
            <img src="../static/icons/chevron-right-gray-800.svg" alt="" class="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <div class="flex gap-2" id="productThumbs">
          ${images
            .map(
              (src, idx) => `
            <button type="button" class="product-thumb flex-1 aspect-square overflow-hidden rounded-lg border-2 transition-all ${idx === 0 ? "border-blue-600 ring-2 ring-blue-600/20" : "border-gray-200 hover:border-gray-300"}" data-thumb-index="${idx}" aria-label="Thumbnail ${idx + 1}">
              <img src="${src}" alt="Thumbnail ${idx + 1}" class="h-full w-full object-cover" />
            </button>`,
            )
            .join("")}
        </div>
      </div>
      <div class="space-y-6">
        <div>
          <h1 class="mb-3">${product.name}</h1>
          <div class="mb-4">
            <div class="flex items-center gap-2">
              <div class="flex items-center gap-0.5">
                ${ratingStarsHtml(product.rating, "h-5 w-5")}
              </div>
              <span class="text-sm text-gray-600">${formatRatingParen(product.rating)}</span>
            </div>
            <p class="mt-2 text-sm text-gray-600">Based on 327 reviews</p>
          </div>
          <div class="flex items-baseline gap-2">
            <span class="font-bold text-3xl text-blue-600">${formatCurrency(product.price)}</span>
            <span class="text-sm text-gray-500">Free shipping</span>
          </div>
        </div>
        <div class="rounded-lg bg-blue-50 p-4"><h3 class="mb-2 font-semibold text-sm">Key Highlights</h3><ul class="space-y-1 text-sm">${highlights}</ul></div>
        <div>
          <h2 class="mb-3">Description</h2>
          <p class="text-gray-700 leading-relaxed">${product.description}</p>
        </div>
        <div>
          <label class="mb-2 block text-sm font-semibold" for="productQtyValue">Quantity</label>
          <div class="flex items-center gap-3">
            <button type="button" id="productQtyMinus" class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors" aria-label="Decrease quantity">-</button>
            <span id="productQtyValue" class="w-12 text-center font-semibold">1</span>
            <button type="button" id="productQtyPlus" class="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors" aria-label="Increase quantity">+</button>
          </div>
        </div>
        <button type="button" id="productAddToCart" data-product-id="${product.id}" class="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-8 py-4 font-semibold text-white hover:bg-blue-700 transition-colors">
          <img src="../static/icons/shopping-cart-white.svg" alt="" class="h-5 w-5" aria-hidden="true" />
          Add to Cart
        </button>
        <div data-slot="accordion" class="rounded-lg border bg-white" data-orientation="vertical">
          <div data-state="${accState}" data-orientation="vertical" data-slot="accordion-item" class="border-b last:border-b-0">
            <h3 data-orientation="vertical" data-state="${accState}" class="flex">
              <button type="button" id="productAccordionTrigger" aria-controls="productAccordionPanel" aria-expanded="${accExpanded}" data-state="${accState}" data-orientation="vertical" data-slot="accordion-trigger" class="focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-start justify-between gap-4 rounded-md py-4 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 px-4 [&[data-state=open]>svg]:rotate-180">
                Technical Specifications
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-down text-muted-foreground pointer-events-none size-4 shrink-0 translate-y-0.5 transition-transform duration-500 ease-in-out" aria-hidden="true"><path d="m6 9 6 6 6-6"></path></svg>
              </button>
            </h3>
            <div id="productAccordionPanel" data-state="${accState}" role="region" aria-labelledby="productAccordionTrigger" aria-hidden="${accAriaHidden}" data-orientation="vertical" data-slot="accordion-content" class="text-sm">
              <div class="min-h-0 overflow-hidden">
                <div class="pt-0 px-4 pb-4">
                  <div class="space-y-3">${specsRows}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${relatedSection}`;

  let imageIndex = 0;
  const hero = root.querySelector("#productHeroImg");
  const btnPrev = root.querySelector("#productImgPrev");
  const btnNext = root.querySelector("#productImgNext");
  const thumbs = root.querySelectorAll(".product-thumb");

  function syncGallery() {
    if (hero) {
      hero.src = images[imageIndex];
      hero.alt = `${product.name} - Image ${imageIndex + 1}`;
    }
    thumbs.forEach((btn, idx) => {
      const active = idx === imageIndex;
      btn.classList.toggle("border-blue-600", active);
      btn.classList.toggle("ring-2", active);
      btn.classList.toggle("ring-blue-600/20", active);
      btn.classList.toggle("border-gray-200", !active);
      btn.classList.toggle("hover:border-gray-300", !active);
    });
  }

  btnPrev?.addEventListener("click", () => {
    imageIndex = (imageIndex + 2) % 3;
    syncGallery();
  });
  btnNext?.addEventListener("click", () => {
    imageIndex = (imageIndex + 1) % 3;
    syncGallery();
  });

  thumbs.forEach((btn) => {
    btn.addEventListener("click", () => {
      imageIndex = Number(btn.dataset.thumbIndex) || 0;
      syncGallery();
    });
  });

  let qty = 1;
  const qtyEl = root.querySelector("#productQtyValue");
  const minus = root.querySelector("#productQtyMinus");
  const plus = root.querySelector("#productQtyPlus");

  minus?.addEventListener("click", () => {
    qty = Math.max(1, qty - 1);
    if (qtyEl) {
      qtyEl.textContent = String(qty);
    }
  });
  plus?.addEventListener("click", () => {
    qty = Math.min(99, qty + 1);
    if (qtyEl) {
      qtyEl.textContent = String(qty);
    }
  });

  const addBtn = root.querySelector("#productAddToCart");
  addBtn?.addEventListener("click", () => {
    const pid = Number(addBtn.dataset.productId);
    if (pid) {
      addToCart(pid, qty);
    }
  });

  const accTrigger = root.querySelector("#productAccordionTrigger");
  const accPanel = root.querySelector("#productAccordionPanel");

  accTrigger?.addEventListener("click", () => {
    const open = accTrigger.getAttribute("data-state") !== "open";
    accTrigger.setAttribute("data-state", open ? "open" : "closed");
    accTrigger.setAttribute("aria-expanded", String(open));
    if (accPanel) {
      accPanel.setAttribute("data-state", open ? "open" : "closed");
      accPanel.setAttribute("aria-hidden", open ? "false" : "true");
    }
    accTrigger
      .closest('[data-slot="accordion-item"]')
      ?.setAttribute("data-state", open ? "open" : "closed");
    accTrigger.closest("h3")?.setAttribute("data-state", open ? "open" : "closed");
  });
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initProductPage();
});
