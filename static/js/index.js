function sortProducts(a, b, sortKey) {
  switch (sortKey) {
    case "price-asc":
      return a.price - b.price;
    case "price-desc":
      return b.price - a.price;
    case "rating-desc":
      return b.rating - a.rating;
    case "name-asc":
    default:
      return a.name.localeCompare(b.name);
  }
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttr(str) {
  return String(str).replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}

function catalogCardHtml(product) {
  const name = escapeHtml(product.name);
  const category = escapeHtml(product.category);
  const imgSrc = escapeAttr(product.image);
  const stars = ratingStarsHtml(product.rating, "h-4 w-4");
  const ratingParen = escapeHtml(formatRatingParen(product.rating));
  const priceLabel = escapeHtml(formatCurrency(product.price));
  const dataName = escapeHtml(product.name);
  const dataCategory = escapeHtml(product.category);
  return `<a
                            class="group block overflow-hidden rounded-lg border border-gray-200 bg-white transition-shadow hover:shadow-lg"
                            href="./product.html?id=${product.id}"
                            data-discover="true"
                            data-product-card
                            data-product-id="${product.id}"
                            data-price="${product.price}"
                            data-rating="${product.rating}"
                            data-name="${dataName}"
                            data-category="${dataCategory}"
                            ><div
                              class="aspect-square overflow-hidden bg-gray-100"
                            >
                              <img
                                src="${imgSrc}"
                                alt="${name}"
                                class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                              />
                            </div>
                            <div class="p-4">
                              <h3 class="mb-2 line-clamp-2">
                                ${name}
                              </h3>
                              <div class="mb-3">
                                <div class="flex items-center gap-2">
                                  <div class="flex items-center gap-0.5">
                                    <div class="flex items-center gap-0.5">
                                      ${stars}
                                    </div>
                                  </div>
                                  <span class="text-sm text-gray-600"
                                    >${ratingParen}</span
                                  >
                                </div>
                              </div>
                              <div class="flex items-center justify-between">
                                <span class="font-bold text-lg text-blue-600"
                                  >${priceLabel}</span
                                ><span class="text-xs text-gray-500 uppercase"
                                  >${category}</span
                                >
                              </div>
                            </div></a
                          >`;
}

function initCatalogPage() {
  const productsGrid = document.getElementById("productsGrid");
  if (
    productsGrid &&
    typeof PRODUCTS !== "undefined" &&
    Array.isArray(PRODUCTS)
  ) {
    productsGrid.innerHTML = PRODUCTS.map((p) => catalogCardHtml(p)).join("");
  }

  const productCards = Array.from(
    document.querySelectorAll("[data-product-card]"),
  );
  const productCount = document.getElementById("productCount");
  const emptyState = document.getElementById("emptyState");
  const filtersPanel = document.getElementById("filtersPanel");
  const mobileFiltersToggle = document.getElementById("mobileFiltersToggle");
  const filtersClose = document.getElementById("filtersClose");
  const ratingButtons = Array.from(
    document.querySelectorAll("[data-rating-threshold]"),
  );
  const sortTrigger = document.getElementById("sortTrigger");
  const sortPopper = document.getElementById("sortPopper");
  const sortMenu = document.getElementById("sortMenu");
  const sortValue = document.getElementById("sortValue");
  const sortOptions = Array.from(
    document.querySelectorAll("[data-sort-option]"),
  );
  const sliderTracks = document.querySelectorAll("[data-price-slider-track]");
  const sliderRanges = document.querySelectorAll("[data-price-slider-range]");
  const minThumbWraps = document.querySelectorAll(
    "[data-price-thumb-wrap='min']",
  );
  const maxThumbWraps = document.querySelectorAll(
    "[data-price-thumb-wrap='max']",
  );
  const minThumbs = document.querySelectorAll("[data-price-thumb='min']");
  const maxThumbs = document.querySelectorAll("[data-price-thumb='max']");

  const urlParams = new URLSearchParams(window.location.search);
  const categoryFromUrl = urlParams.get("category");

  const state = {
    sort: "name-asc",
    ratings: [],
    minPrice: 0,
    maxPrice: 3000,
    category: categoryFromUrl || "",
  };

  function createCheckboxIndicator() {
    return `
      <span data-state="checked" data-slot="checkbox-indicator" class="flex items-center justify-center text-current transition-none">
        <img src="../static/icons/check-white.svg" alt="" class="size-3.5" aria-hidden="true" />
      </span>
    `;
  }

  function setCheckboxState(button, checked) {
    button.setAttribute("aria-checked", String(checked));
    button.dataset.state = checked ? "checked" : "unchecked";
    button.innerHTML = checked ? createCheckboxIndicator() : "";
  }

  function syncRatingState() {
    state.ratings = [
      ...new Set(
        ratingButtons
          .filter((button) => button.getAttribute("aria-checked") === "true")
          .map((button) => Number(button.dataset.ratingThreshold)),
      ),
    ];
  }

  function closeFiltersSheet() {
    if (!filtersPanel) {
      return;
    }
    filtersPanel.dataset.filtersOpen = "false";
    filtersPanel.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    mobileFiltersToggle?.setAttribute("aria-expanded", "false");
  }

  function openFiltersSheet() {
    if (!filtersPanel) {
      return;
    }
    filtersPanel.dataset.filtersOpen = "true";
    filtersPanel.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    mobileFiltersToggle?.setAttribute("aria-expanded", "true");
  }

  function openSortMenu() {
    if (!sortTrigger || !sortMenu || !sortPopper) {
      return;
    }

    updateSortPopperPosition();
    sortPopper.classList.remove("hidden");
    sortPopper.setAttribute("aria-hidden", "false");
    sortTrigger.setAttribute("aria-expanded", "true");
    sortTrigger.dataset.state = "open";
  }

  function closeSortMenu() {
    if (!sortTrigger || !sortMenu || !sortPopper) {
      return;
    }

    sortPopper.classList.add("hidden");
    sortPopper.setAttribute("aria-hidden", "true");
    sortTrigger.setAttribute("aria-expanded", "false");
    sortTrigger.dataset.state = "closed";
  }

  function updateSortPopperPosition() {
    if (!sortTrigger || !sortPopper) {
      return;
    }

    const rect = sortTrigger.getBoundingClientRect();
    const left = Math.round(rect.left);
    const top = Math.round(rect.bottom + 2);

    sortPopper.style.left = "0px";
    sortPopper.style.top = "0px";
    sortPopper.style.minWidth = "max-content";
    sortPopper.style.willChange = "transform";
    sortPopper.style.zIndex = "50";
    sortPopper.style.transform = `translate(${left}px, ${top}px)`;
    sortPopper.style.setProperty(
      "--radix-popper-available-width",
      `${window.innerWidth - left}px`,
    );
    sortPopper.style.setProperty(
      "--radix-popper-available-height",
      `${window.innerHeight - top}px`,
    );
    sortPopper.style.setProperty(
      "--radix-popper-anchor-width",
      `${Math.round(rect.width)}px`,
    );
    sortPopper.style.setProperty(
      "--radix-popper-anchor-height",
      `${Math.round(rect.height)}px`,
    );
    sortPopper.style.setProperty("--radix-popper-transform-origin", "0% 0px");
  }

  function syncSortUi() {
    sortOptions.forEach((option) => {
      const selected = option.dataset.sortValue === state.sort;
      option.setAttribute("aria-selected", String(selected));
      const check = option.querySelector("[data-sort-check]");
      if (check) {
        check.classList.toggle("hidden", !selected);
      }
      if (selected && sortValue) {
        sortValue.textContent =
          option.dataset.sortLabel || option.textContent.trim();
      }
    });
  }

  function updateSliderUi() {
    const minPercent = (state.minPrice / 3000) * 100;
    const maxPercent = (state.maxPrice / 3000) * 100;
    const minThumbOffset = 8 - (16 * minPercent) / 100;
    const maxThumbOffset = 8 - (16 * maxPercent) / 100;

    minThumbs.forEach((thumb) => {
      thumb.setAttribute("aria-valuenow", String(state.minPrice));
    });
    maxThumbs.forEach((thumb) => {
      thumb.setAttribute("aria-valuenow", String(state.maxPrice));
    });
    minThumbWraps.forEach((wrap) => {
      wrap.style.left = `calc(${minPercent}% + ${minThumbOffset}px)`;
    });
    maxThumbWraps.forEach((wrap) => {
      wrap.style.left = `calc(${maxPercent}% + ${maxThumbOffset}px)`;
    });
    sliderRanges.forEach((range) => {
      range.style.left = `${minPercent}%`;
      range.style.right = `${100 - maxPercent}%`;
    });
    document.querySelectorAll("[data-catalog-price='min']").forEach((el) => {
      el.textContent = `$${state.minPrice}`;
    });
    document.querySelectorAll("[data-catalog-price='max']").forEach((el) => {
      el.textContent = `$${state.maxPrice}`;
    });
  }

  function sortCardNodes() {
    if (!productsGrid) {
      return;
    }

    const sortedCards = [...productCards].sort((cardA, cardB) =>
      sortProducts(
        {
          name: cardA.dataset.name || "",
          price: Number(cardA.dataset.price),
          rating: Number(cardA.dataset.rating),
        },
        {
          name: cardB.dataset.name || "",
          price: Number(cardB.dataset.price),
          rating: Number(cardB.dataset.rating),
        },
        state.sort,
      ),
    );

    sortedCards.forEach((card) => {
      productsGrid.appendChild(card);
    });
  }

  function applyFilters() {
    let visibleCount = 0;

    sortCardNodes();

    productCards.forEach((card) => {
      const price = Number(card.dataset.price);
      const rating = Number(card.dataset.rating);
      const matchesPrice = price >= state.minPrice && price <= state.maxPrice;
      const matchesRating =
        state.ratings.length === 0 ||
        state.ratings.some((threshold) => rating >= threshold);
      const matchesCategory =
        !state.category ||
        (card.dataset.category || "") === state.category;

      const visible = matchesPrice && matchesRating && matchesCategory;
      card.hidden = !visible;
      if (visible) {
        visibleCount += 1;
      }
    });

    if (productCount) {
      productCount.textContent = String(visibleCount);
    }
    if (emptyState) {
      emptyState.classList.toggle("hidden", visibleCount !== 0);
    }
  }

  function clampToStep(value) {
    return Math.round(value / 50) * 50;
  }

  function setSliderValue(which, nextValue) {
    const clamped = Math.max(0, Math.min(3000, clampToStep(nextValue)));
    if (which === "min") {
      state.minPrice = Math.min(clamped, state.maxPrice);
    } else {
      state.maxPrice = Math.max(clamped, state.minPrice);
    }
    updateSliderUi();
    applyFilters();
  }

  ratingButtons.forEach((button) => {
    const toggle = () => {
      const threshold = Number(button.dataset.ratingThreshold);
      const isChecked = button.getAttribute("aria-checked") === "true";
      ratingButtons
        .filter((b) => Number(b.dataset.ratingThreshold) === threshold)
        .forEach((b) => setCheckboxState(b, !isChecked));
      syncRatingState();
      applyFilters();
    };

    button.addEventListener("click", toggle);
    button.addEventListener("keydown", (event) => {
      if (event.key === " " || event.key === "Enter") {
        event.preventDefault();
        toggle();
      }
    });

    const label = document.querySelector(`label[for="${button.id}"]`);
    if (label) {
      label.addEventListener("click", (event) => {
        event.preventDefault();
        toggle();
      });
    }
  });

  if (sortTrigger && sortMenu && sortPopper) {
    sortTrigger.addEventListener("click", (event) => {
      event.stopPropagation();
      if (sortPopper.classList.contains("hidden")) {
        openSortMenu();
      } else {
        closeSortMenu();
      }
    });

    sortOptions.forEach((option) => {
      option.addEventListener("click", () => {
        state.sort = option.dataset.sortValue || "name-asc";
        syncSortUi();
        applyFilters();
        closeSortMenu();
      });
    });

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest("#sortTrigger") &&
        !event.target.closest("#sortPopper")
      ) {
        closeSortMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeSortMenu();
        closeFiltersSheet();
      }
    });

    window.addEventListener("resize", () => {
      if (!sortPopper.classList.contains("hidden")) {
        updateSortPopperPosition();
      }
    });

    window.addEventListener(
      "scroll",
      () => {
        if (!sortPopper.classList.contains("hidden")) {
          updateSortPopperPosition();
        }
      },
      true,
    );
  }

  document.querySelectorAll("[data-clear-filters]").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.sort = "name-asc";
      state.minPrice = 0;
      state.maxPrice = 3000;
      state.category = "";

      ratingButtons.forEach((button) => {
        setCheckboxState(button, false);
      });
      syncRatingState();
      syncSortUi();
      updateSliderUi();
      applyFilters();
      closeFiltersSheet();
    });
  });

  function valueFromPointer(clientX, track) {
    if (!track) {
      return 0;
    }
    const rect = track.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return clampToStep(ratio * 3000);
  }

  let activeThumb = null;
  let activeTrackEl = null;

  function bindThumbDrag(thumb, which) {
    if (!thumb) {
      return;
    }

    thumb.addEventListener("pointerdown", (event) => {
      activeThumb = which;
      activeTrackEl =
        thumb.closest("[data-price-slider]")?.querySelector(
          "[data-price-slider-track]",
        ) ?? null;
      thumb.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    thumb.addEventListener("keydown", (event) => {
      const currentValue = which === "min" ? state.minPrice : state.maxPrice;
      if (event.key === "ArrowLeft" || event.key === "ArrowDown") {
        event.preventDefault();
        setSliderValue(which, currentValue - 50);
      }
      if (event.key === "ArrowRight" || event.key === "ArrowUp") {
        event.preventDefault();
        setSliderValue(which, currentValue + 50);
      }
    });
  }

  minThumbs.forEach((thumb) => {
    bindThumbDrag(thumb, "min");
  });
  maxThumbs.forEach((thumb) => {
    bindThumbDrag(thumb, "max");
  });

  window.addEventListener("pointermove", (event) => {
    if (!activeThumb || !activeTrackEl) {
      return;
    }
    setSliderValue(activeThumb, valueFromPointer(event.clientX, activeTrackEl));
  });

  window.addEventListener("pointerup", () => {
    activeThumb = null;
    activeTrackEl = null;
  });

  sliderTracks.forEach((track) => {
    track.addEventListener("click", (event) => {
      const nextValue = valueFromPointer(event.clientX, track);
      const distanceToMin = Math.abs(nextValue - state.minPrice);
      const distanceToMax = Math.abs(nextValue - state.maxPrice);
      setSliderValue(distanceToMin <= distanceToMax ? "min" : "max", nextValue);
    });
  });

  filtersClose?.addEventListener("click", () => {
    closeFiltersSheet();
  });
  filtersPanel?.addEventListener("click", (event) => {
    if (event.target.closest("[data-filters-backdrop]")) {
      closeFiltersSheet();
    }
  });
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 1024px)").matches) {
      closeFiltersSheet();
    }
  });

  mobileFiltersToggle?.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();
    openFiltersSheet();
  });

  syncRatingState();
  syncSortUi();
  updateSliderUi();
  applyFilters();
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  initCatalogPage();
});
