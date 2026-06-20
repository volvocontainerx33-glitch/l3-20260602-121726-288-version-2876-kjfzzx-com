(function() {
    const menuButton = document.querySelector(".mobile-menu-button");
    const mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function() {
            mobileNav.classList.toggle("is-open");
        });
    }

    const carousel = document.querySelector(".hero-carousel");
    if (carousel) {
        const slides = Array.from(carousel.querySelectorAll(".hero-slide"));
        const dots = Array.from(carousel.querySelectorAll(".hero-dots button"));
        let index = 0;
        let timer = null;

        function show(next) {
            if (!slides.length) {
                return;
            }
            index = (next + slides.length) % slides.length;
            slides.forEach(function(slide, i) {
                slide.classList.toggle("is-active", i === index);
            });
            dots.forEach(function(dot, i) {
                dot.classList.toggle("is-active", i === index);
            });
        }

        function start() {
            timer = window.setInterval(function() {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function(dot, i) {
            dot.addEventListener("click", function() {
                if (timer) {
                    window.clearInterval(timer);
                }
                show(i);
                start();
            });
        });

        start();
    }

    const filterInputs = Array.from(document.querySelectorAll(".page-filter-input"));
    const sortSelects = Array.from(document.querySelectorAll(".page-sort-select"));

    function cardsFor(input) {
        const root = input.closest("main") || document;
        return Array.from(root.querySelectorAll(".page-movie-list .movie-card"));
    }

    function filterCards(input) {
        const value = input.value.trim().toLowerCase();
        cardsFor(input).forEach(function(card) {
            const text = (card.getAttribute("data-search") || "").toLowerCase();
            const title = (card.getAttribute("data-title") || "").toLowerCase();
            const match = !value || text.indexOf(value) !== -1 || title.indexOf(value) !== -1;
            card.classList.toggle("is-hidden", !match);
        });
    }

    filterInputs.forEach(function(input) {
        input.addEventListener("input", function() {
            filterCards(input);
        });
    });

    sortSelects.forEach(function(select) {
        select.addEventListener("change", function() {
            const root = select.closest("main") || document;
            const grid = root.querySelector(".page-movie-list");
            if (!grid) {
                return;
            }
            const cards = Array.from(grid.querySelectorAll(".movie-card"));
            const value = select.value;
            cards.sort(function(a, b) {
                if (value === "title") {
                    return (a.getAttribute("data-title") || "").localeCompare(b.getAttribute("data-title") || "", "zh-Hans-CN");
                }
                return Number(b.getAttribute("data-" + value) || 0) - Number(a.getAttribute("data-" + value) || 0);
            });
            cards.forEach(function(card) {
                grid.appendChild(card);
            });
        });
    });

    const params = new URLSearchParams(window.location.search);
    const q = params.get("q");
    const librarySearch = document.getElementById("librarySearch");
    if (q && librarySearch) {
        librarySearch.value = q;
        filterCards(librarySearch);
    }
})();
