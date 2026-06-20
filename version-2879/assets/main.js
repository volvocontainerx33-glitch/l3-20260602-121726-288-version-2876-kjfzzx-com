(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function setupMobileNav() {
    var toggle = document.querySelector("[data-mobile-toggle]");
    var nav = document.querySelector("[data-mobile-nav]");
    if (!toggle || !nav) {
      return;
    }
    toggle.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function setupSearchForms() {
    document.querySelectorAll("[data-search-form]").forEach(function (form) {
      form.addEventListener("submit", function (event) {
        var input = form.querySelector("input[name='q']");
        var value = input ? input.value.trim() : "";
        if (!value) {
          event.preventDefault();
          return;
        }
        event.preventDefault();
        window.location.href = "./search.html?q=" + encodeURIComponent(value);
      });
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length <= 1) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, itemIndex) {
        slide.classList.toggle("is-active", itemIndex === current);
      });
      dots.forEach(function (dot, itemIndex) {
        dot.classList.toggle("is-active", itemIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener("click", function () {
        show(index);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    start();
  }

  function filterCards(cards, query, selected) {
    var q = normalize(query);
    var s = normalize(selected);
    cards.forEach(function (card) {
      var haystack = normalize(card.getAttribute("data-search"));
      var type = normalize(card.getAttribute("data-type"));
      var matchesQuery = !q || haystack.indexOf(q) !== -1;
      var matchesSelected = !s || s === "all" || type === s;
      card.classList.toggle("hidden-card", !(matchesQuery && matchesSelected));
    });
  }

  function setupCategoryFilters() {
    document.querySelectorAll("[data-filter-panel]").forEach(function (panel) {
      var input = panel.querySelector("[data-filter-input]");
      var chips = Array.prototype.slice.call(panel.querySelectorAll("[data-filter-value]"));
      var container = panel.parentElement.querySelector("[data-filter-results]");
      var cards = container ? Array.prototype.slice.call(container.querySelectorAll("[data-card]")) : [];
      var selected = "all";
      function apply() {
        filterCards(cards, input ? input.value : "", selected);
      }
      if (input) {
        input.addEventListener("input", apply);
      }
      chips.forEach(function (chip) {
        chip.addEventListener("click", function () {
          selected = chip.getAttribute("data-filter-value") || "all";
          chips.forEach(function (item) {
            item.classList.toggle("active", item === chip);
          });
          apply();
        });
      });
      apply();
    });
  }

  function setupSearchPage() {
    var input = document.getElementById("pageSearch");
    var results = document.querySelector("[data-search-results]");
    if (!input || !results) {
      return;
    }
    var cards = Array.prototype.slice.call(results.querySelectorAll("[data-card]"));
    var params = new URLSearchParams(window.location.search);
    var initial = params.get("q") || "";
    input.value = initial;
    function apply() {
      filterCards(cards, input.value, "all");
    }
    input.addEventListener("input", apply);
    document.querySelectorAll("[data-quick-search]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-quick-search") || "";
        apply();
        input.focus();
      });
    });
    apply();
  }

  function attachHls(video, sourceUrl) {
    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({ enableWorker: true });
      hls.loadSource(sourceUrl);
      hls.attachMedia(video);
      return hls;
    }
    video.src = sourceUrl;
    return null;
  }

  window.initMoviePlayer = function (sourceUrl) {
    ready(function () {
      var video = document.getElementById("movieVideo");
      var overlay = document.getElementById("playOverlay");
      if (!video || !overlay || !sourceUrl) {
        return;
      }
      var loaded = false;
      var hlsInstance = null;
      function startPlayback() {
        if (!loaded) {
          hlsInstance = attachHls(video, sourceUrl);
          loaded = true;
        }
        overlay.classList.add("is-hidden");
        var promise = video.play();
        if (promise && typeof promise.catch === "function") {
          promise.catch(function () {
            overlay.classList.remove("is-hidden");
          });
        }
      }
      overlay.addEventListener("click", startPlayback);
      video.addEventListener("play", function () {
        overlay.classList.add("is-hidden");
      });
      video.addEventListener("ended", function () {
        overlay.classList.remove("is-hidden");
      });
      window.addEventListener("pagehide", function () {
        if (hlsInstance && typeof hlsInstance.destroy === "function") {
          hlsInstance.destroy();
        }
      });
    });
  };

  ready(function () {
    setupMobileNav();
    setupSearchForms();
    setupHero();
    setupCategoryFilters();
    setupSearchPage();
  });
})();
