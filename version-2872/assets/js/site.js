(function () {
  const navToggle = document.querySelector("[data-nav-toggle]");
  const nav = document.querySelector("[data-site-nav]");
  if (navToggle && nav) {
    navToggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  const hero = document.querySelector("[data-hero]");
  if (hero) {
    const slides = Array.from(hero.querySelectorAll("[data-hero-slide]"));
    const dots = Array.from(hero.querySelectorAll("[data-hero-dot]"));
    const prev = hero.querySelector("[data-hero-prev]");
    const next = hero.querySelector("[data-hero-next]");
    let active = 0;
    let timer = null;

    const show = function (index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle("is-active", i === active);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle("is-active", i === active);
      });
    };

    const restart = function () {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function () {
        show(active + 1);
      }, 5200);
    };

    if (prev) {
      prev.addEventListener("click", function () {
        show(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(active + 1);
        restart();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        restart();
      });
    });

    show(0);
    restart();
  }

  const grids = Array.from(document.querySelectorAll("[data-movie-grid]"));
  grids.forEach(function (grid) {
    const scope = grid.closest(".container") || document;
    const searchInput = scope.querySelector("[data-search-input]");
    const regionSelect = scope.querySelector("[data-filter-region]");
    const typeSelect = scope.querySelector("[data-filter-type]");
    const categorySelect = scope.querySelector("[data-filter-category]");
    const sortSelect = scope.querySelector("[data-sort-select]");
    const emptyState = scope.querySelector("[data-empty-state]");
    const cards = Array.from(grid.querySelectorAll(".movie-card"));

    const fillSelect = function (select, attr) {
      if (!select) {
        return;
      }
      const values = Array.from(new Set(cards.map(function (card) {
        return card.getAttribute(attr) || "";
      }).filter(Boolean))).sort(function (a, b) {
        return a.localeCompare(b, "zh-Hans-CN");
      });
      values.forEach(function (value) {
        const option = document.createElement("option");
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
    };

    fillSelect(regionSelect, "data-region");
    fillSelect(typeSelect, "data-type");

    const matches = function (card) {
      const query = searchInput ? searchInput.value.trim().toLowerCase() : "";
      const region = regionSelect ? regionSelect.value : "all";
      const type = typeSelect ? typeSelect.value : "all";
      const category = categorySelect ? categorySelect.value : "all";
      const haystack = [
        card.getAttribute("data-title"),
        card.getAttribute("data-region"),
        card.getAttribute("data-type"),
        card.getAttribute("data-genre"),
        card.getAttribute("data-tags")
      ].join(" ").toLowerCase();
      const matchQuery = !query || haystack.indexOf(query) !== -1;
      const matchRegion = region === "all" || card.getAttribute("data-region") === region;
      const matchType = type === "all" || card.getAttribute("data-type") === type;
      const matchCategory = category === "all" || card.getAttribute("data-category") === category;
      return matchQuery && matchRegion && matchType && matchCategory;
    };

    const sortCards = function (items) {
      const value = sortSelect ? sortSelect.value : "score";
      return items.sort(function (a, b) {
        if (value === "date") {
          return String(b.getAttribute("data-date")).localeCompare(String(a.getAttribute("data-date")));
        }
        if (value === "year") {
          return Number(b.getAttribute("data-year")) - Number(a.getAttribute("data-year"));
        }
        if (value === "title") {
          return String(a.getAttribute("data-title")).localeCompare(String(b.getAttribute("data-title")), "zh-Hans-CN");
        }
        return Number(b.getAttribute("data-score")) - Number(a.getAttribute("data-score"));
      });
    };

    const update = function () {
      const visible = [];
      cards.forEach(function (card) {
        const ok = matches(card);
        card.hidden = !ok;
        if (ok) {
          visible.push(card);
        }
      });
      sortCards(visible).forEach(function (card) {
        grid.appendChild(card);
      });
      if (emptyState) {
        emptyState.hidden = visible.length !== 0;
      }
    };

    [searchInput, regionSelect, typeSelect, categorySelect, sortSelect].forEach(function (node) {
      if (node) {
        node.addEventListener("input", update);
        node.addEventListener("change", update);
      }
    });

    update();
  });
})();
