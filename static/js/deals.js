const DEAL_PRODUCT_IDS = [1, 2, 3, 4];
const DEAL_BADGE_PERCENT = 20;

function initDealsPage() {
  const root = document.getElementById("dealsPageRoot");
  if (!root) {
    return;
  }

  const deals = DEAL_PRODUCT_IDS.map((id) => getProductById(id)).filter(Boolean);
  const cards = deals
    .map((p) => {
      const safeName = p.name
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/"/g, "&quot;");
      return `
            <div class="relative">
              <div class="absolute -top-2 -right-2 z-10 rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white shadow-lg">Save ${DEAL_BADGE_PERCENT}%</div>
              <a class="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg" href="./product.html?id=${p.id}" data-discover="true">
                <div class="aspect-square overflow-hidden bg-gray-100">
                  <img src="${p.image}" alt="${safeName}" class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
                </div>
                <div class="p-4">
                  <h3 class="mb-2 line-clamp-2">${safeName}</h3>
                  <div class="mb-3">
                    <div class="flex items-center gap-2">
                      <div class="flex items-center gap-0.5">
                        ${ratingStarsHtml(p.rating, "h-4 w-4")}
                      </div>
                      <span class="text-sm text-gray-600">${formatRatingParen(p.rating)}</span>
                    </div>
                  </div>
                  <div class="flex items-center justify-between">
                    <span class="font-bold text-lg text-blue-600">${formatCurrency(p.price)}</span>
                    <span class="text-xs text-gray-500 uppercase">${p.category}</span>
                  </div>
                </div>
              </a>
            </div>`;
    })
    .join("");

  root.innerHTML = `
    <div class="mb-8">
      <div class="flex items-center gap-2 mb-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-tag h-6 w-6 shrink-0 text-blue-600" aria-hidden="true"><path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"></path><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"></circle></svg>
        <h1>Special Deals</h1>
      </div>
      <p class="text-gray-600">Limited time offers on our best products - Don't miss out!</p>
    </div>
    <div class="mb-8 rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-white">
      <div class="flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <h2 class="mb-2 text-white">Flash Sale Event</h2>
          <p class="text-blue-100">Save up to 30% on selected items</p>
        </div>
        <div class="flex items-center gap-2 rounded-lg bg-white/20 px-6 py-3 backdrop-blur-sm">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-clock h-5 w-5 shrink-0" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
          <span class="font-semibold">Ends in 2 days</span>
        </div>
      </div>
    </div>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      ${cards}
    </div>
    <div class="mt-12 text-center">
      <p class="mb-4 text-gray-600">Want to see more products?</p>
      <a class="inline-block rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700 transition-colors" href="./index.html" data-discover="true">Browse All Products</a>
    </div>`;

  document.title = "Special Deals · TechStore";
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initDealsPage();
});
