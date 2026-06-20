(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    setupMobileMenu();
    setupHeroCarousel();
    setupImageFallbacks();
    setupPageSearch();
    applySearchQueryFromUrl();
  });

  function setupMobileMenu() {
    var button = document.querySelector("[data-menu-toggle]");
    var menu = document.querySelector("[data-mobile-menu]");

    if (!button || !menu) {
      return;
    }

    button.addEventListener("click", function () {
      menu.classList.toggle("is-open");
    });
  }

  function setupHeroCarousel() {
    var hero = document.querySelector("[data-hero]");

    if (!hero) {
      return;
    }

    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
      if (!slides.length) {
        return;
      }

      activeIndex = (index + slides.length) % slides.length;

      slides.forEach(function (slide, currentIndex) {
        slide.classList.toggle("is-active", currentIndex === activeIndex);
      });

      dots.forEach(function (dot, currentIndex) {
        dot.classList.toggle("is-active", currentIndex === activeIndex);
      });
    }

    function startTimer() {
      stopTimer();
      timer = window.setInterval(function () {
        showSlide(activeIndex + 1);
      }, 5200);
    }

    function stopTimer() {
      if (timer) {
        window.clearInterval(timer);
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        var index = Number(dot.getAttribute("data-hero-dot"));
        showSlide(index);
        startTimer();
      });
    });

    hero.addEventListener("mouseenter", stopTimer);
    hero.addEventListener("mouseleave", startTimer);
    showSlide(0);
    startTimer();
  }

  function setupImageFallbacks() {
    var images = Array.prototype.slice.call(document.querySelectorAll("img"));

    images.forEach(function (image) {
      var title = image.getAttribute("alt") || "影片封面";
      var holder = image.closest(".poster-frame, .category-card, .rank-cover, .hero-media, .page-hero, .detail-backdrop");

      if (holder && !holder.getAttribute("data-title")) {
        holder.setAttribute("data-title", title);
      }

      image.addEventListener("error", function () {
        if (holder) {
          holder.classList.add("is-image-missing");
        }
        image.remove();
      });
    });
  }

  function setupPageSearch() {
    var input = document.querySelector("[data-page-search]");
    var list = document.querySelector("[data-search-list]");
    var counter = document.querySelector("[data-search-count]");

    if (!input || !list) {
      return;
    }

    var items = Array.prototype.slice.call(list.querySelectorAll("[data-search-text]"));

    function runFilter() {
      var keyword = input.value.trim().toLowerCase();
      var shown = 0;

      items.forEach(function (item) {
        var text = (item.getAttribute("data-search-text") || "").toLowerCase();
        var matched = !keyword || text.indexOf(keyword) !== -1;
        item.setAttribute("data-search-hidden", matched ? "false" : "true");

        if (matched) {
          shown += 1;
        }
      });

      if (counter) {
        counter.textContent = "当前显示 " + shown + " 部影片";
      }
    }

    input.addEventListener("input", runFilter);
    runFilter();
  }

  function applySearchQueryFromUrl() {
    var input = document.querySelector("[data-page-search]");

    if (!input) {
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var query = params.get("q");

    if (query) {
      input.value = query;
      input.dispatchEvent(new Event("input"));
    }
  }
})();
