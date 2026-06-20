(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.from((root || document).querySelectorAll(selector));
    }

    function initMobileMenu() {
        const button = qs('.mobile-toggle');
        const menu = qs('.mobile-menu');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            const open = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', String(!open));
            menu.hidden = open;
            menu.classList.toggle('is-open', !open);
        });
    }

    function initGlobalSearch() {
        qsa('.global-search').forEach(function (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                const input = qs('input[name="q"]', form);
                const value = input ? input.value.trim() : '';
                const target = value ? 'videos.html?q=' + encodeURIComponent(value) : 'videos.html';
                window.location.href = target;
            });
        });
    }

    function initHero() {
        const hero = qs('[data-hero]');
        if (!hero) {
            return;
        }
        const slides = qsa('[data-hero-slide]', hero);
        const dots = qsa('[data-hero-dot]', hero);
        const thumbs = qsa('[data-hero-thumb]', hero);
        const prev = qs('[data-hero-prev]', hero);
        const next = qs('[data-hero-next]', hero);
        let index = 0;
        let timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle('is-active', current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle('is-active', current === index);
            });
            thumbs.forEach(function (thumb, current) {
                thumb.classList.toggle('is-active', current === index);
            });
        }

        function schedule() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.dataset.heroDot || 0));
                schedule();
            });
        });
        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                schedule();
            });
        }
        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                schedule();
            });
        }
        schedule();
    }

    function fillSelectOptions(select, cards, key) {
        if (!select) {
            return;
        }
        const values = Array.from(new Set(cards.map(function (card) {
            return card.dataset[key] || '';
        }).filter(Boolean))).sort(function (a, b) {
            return a.localeCompare(b, 'zh-CN');
        });
        values.forEach(function (value) {
            const option = document.createElement('option');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        });
    }

    function initFilters() {
        const grid = qs('[data-movie-grid]');
        const panel = qs('[data-filter-panel]');
        if (!grid || !panel) {
            return;
        }
        const cards = qsa('.movie-card', grid);
        const search = qs('.filter-search', panel);
        const selects = qsa('.filter-select', panel);
        const sort = qs('.sort-select', panel);
        const reset = qs('.reset-filter', panel);
        const count = qs('.result-count');
        const empty = qs('.empty-state');
        const regionSelect = selects.find(function (select) {
            return select.dataset.filter === 'region';
        });
        const typeSelect = selects.find(function (select) {
            return select.dataset.filter === 'type';
        });

        fillSelectOptions(regionSelect, cards, 'region');
        fillSelectOptions(typeSelect, cards, 'type');

        const params = new URLSearchParams(window.location.search);
        const initialQuery = params.get('q') || '';
        if (search && initialQuery) {
            search.value = initialQuery;
        }

        function matches(card) {
            const query = search ? search.value.trim().toLowerCase() : '';
            if (query && !(card.dataset.search || '').toLowerCase().includes(query)) {
                return false;
            }
            return selects.every(function (select) {
                const value = select.value;
                const key = select.dataset.filter;
                return !value || card.dataset[key] === value;
            });
        }

        function sortCards(visibleCards) {
            const mode = sort ? sort.value : 'default';
            const sorted = visibleCards.slice();
            if (mode === 'year-desc') {
                sorted.sort(function (a, b) {
                    return Number(b.dataset.year || 0) - Number(a.dataset.year || 0);
                });
            } else if (mode === 'year-asc') {
                sorted.sort(function (a, b) {
                    return Number(a.dataset.year || 0) - Number(b.dataset.year || 0);
                });
            } else if (mode === 'title') {
                sorted.sort(function (a, b) {
                    return (a.dataset.title || '').localeCompare(b.dataset.title || '', 'zh-CN');
                });
            } else {
                sorted.sort(function (a, b) {
                    return cards.indexOf(a) - cards.indexOf(b);
                });
            }
            sorted.forEach(function (card) {
                grid.appendChild(card);
            });
        }

        function applyFilters() {
            const visibleCards = [];
            cards.forEach(function (card) {
                const visible = matches(card);
                card.hidden = !visible;
                if (visible) {
                    visibleCards.push(card);
                }
            });
            sortCards(visibleCards);
            if (count) {
                count.textContent = String(visibleCards.length);
            }
            if (empty) {
                empty.hidden = visibleCards.length > 0;
            }
        }

        if (search) {
            search.addEventListener('input', applyFilters);
        }
        selects.forEach(function (select) {
            select.addEventListener('change', applyFilters);
        });
        if (sort) {
            sort.addEventListener('change', applyFilters);
        }
        if (reset) {
            reset.addEventListener('click', function () {
                if (search) {
                    search.value = '';
                }
                selects.forEach(function (select) {
                    select.value = '';
                });
                if (sort) {
                    sort.value = 'default';
                }
                applyFilters();
            });
        }
        applyFilters();
    }

    function initBackTop() {
        const button = qs('.back-top');
        if (!button) {
            return;
        }
        window.addEventListener('scroll', function () {
            button.classList.toggle('is-visible', window.scrollY > 500);
        });
        button.addEventListener('click', function () {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initGlobalSearch();
        initHero();
        initFilters();
        initBackTop();
    });
}());
