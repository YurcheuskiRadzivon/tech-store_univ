function getCategorySummaries() {
  const map = new Map();
  for (const p of PRODUCTS) {
    if (!map.has(p.category)) {
      map.set(p.category, { name: p.category, count: 0, image: p.image });
    }
    map.get(p.category).count += 1;
  }
  return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
}

function formatCategoryProductLabel(count) {
  return `${count} product${count === 1 ? "" : "s"}`;
}

function withImageWidthParam(url, width) {
  if (!url) {
    return url;
  }
  const param = `w=${width}`;
  return url.includes("?") ? `${url}&${param}` : `${url}?${param}`;
}

function initCategoriesPage() {
  const root = document.getElementById("categoriesPageRoot");
  if (!root) {
    return;
  }

  const categories = getCategorySummaries();
  const cards = categories
    .map((cat) => {
      const imgSrc = withImageWidthParam(cat.image, 400);
      const href = `./index.html?category=${encodeURIComponent(cat.name)}`;
      const countLabel = formatCategoryProductLabel(cat.count);
      const safeName = cat.name.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
      return `
            <a class="group relative aspect-video overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm hover:shadow-lg transition-shadow" href="${href}" data-discover="true">
              <img src="${imgSrc}" alt="${safeName}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
              <div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                <div class="text-white">
                  <h3 class="font-semibold text-xl mb-1">${safeName}</h3>
                  <p class="text-sm text-gray-200">${countLabel}</p>
                </div>
              </div>
            </a>`;
    })
    .join("");

  root.innerHTML = `
    <h1 class="mb-4">Product Categories</h1>
    <p class="mb-8 text-gray-600">Browse our wide selection of premium electronics by category</p>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      ${cards}
    </div>`;

  document.title = "Product Categories · TechStore";
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initCategoriesPage();
});
