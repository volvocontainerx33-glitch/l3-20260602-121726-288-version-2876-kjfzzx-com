(function () {
    var nav = document.querySelector('.main-nav');
    var toggle = document.querySelector('.menu-toggle');

    if (toggle && nav) {
        toggle.addEventListener('click', function () {
            nav.classList.toggle('open');
        });
    }

    var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dots button'));
    var currentSlide = 0;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        currentSlide = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('active', slideIndex === currentSlide);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('active', dotIndex === currentSlide);
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
        });
    });

    if (slides.length > 1) {
        setInterval(function () {
            showSlide(currentSlide + 1);
        }, 5200);
    }

    var grid = document.querySelector('[data-filter-grid]');
    var searchInput = document.querySelector('[data-search]');
    var regionFilter = document.querySelector('[data-region-filter]');
    var typeFilter = document.querySelector('[data-type-filter]');
    var sortFilter = document.querySelector('[data-sort-filter]');
    var emptyState = document.querySelector('[data-empty-state]');

    function applyFilters() {
        if (!grid) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var query = searchInput ? searchInput.value.trim().toLowerCase() : '';
        var region = regionFilter ? regionFilter.value : 'all';
        var type = typeFilter ? typeFilter.value : 'all';
        var visibleCount = 0;

        cards.forEach(function (card) {
            var matchQuery = !query || card.dataset.title.indexOf(query) !== -1 || card.dataset.genre.toLowerCase().indexOf(query) !== -1;
            var matchRegion = region === 'all' || card.dataset.region === region;
            var matchType = type === 'all' || card.dataset.type === type;
            var visible = matchQuery && matchRegion && matchType;
            card.style.display = visible ? '' : 'none';
            if (visible) {
                visibleCount += 1;
            }
        });

        if (emptyState) {
            emptyState.style.display = visibleCount ? 'none' : 'block';
        }
    }

    function sortCards() {
        if (!grid || !sortFilter) {
            return;
        }

        var cards = Array.prototype.slice.call(grid.querySelectorAll('.movie-card'));
        var mode = sortFilter.value;
        cards.sort(function (a, b) {
            if (mode === 'views') {
                return Number(b.dataset.views) - Number(a.dataset.views);
            }
            if (mode === 'date') {
                return String(b.dataset.date).localeCompare(String(a.dataset.date));
            }
            return Number(b.dataset.year) - Number(a.dataset.year);
        });
        cards.forEach(function (card) {
            grid.appendChild(card);
        });
        applyFilters();
    }

    [searchInput, regionFilter, typeFilter].forEach(function (control) {
        if (control) {
            control.addEventListener('input', applyFilters);
            control.addEventListener('change', applyFilters);
        }
    });

    if (sortFilter) {
        sortFilter.addEventListener('change', sortCards);
    }

    sortCards();

    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (box) {
        var video = box.querySelector('video');
        var button = box.querySelector('.play-button');
        var source = box.getAttribute('data-src');
        var hlsInstance = null;

        function loadSource() {
            if (!video || !source || video.dataset.loaded === 'true') {
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: false
                });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else {
                video.src = source;
            }

            video.dataset.loaded = 'true';
        }

        function startPlayback() {
            loadSource();
            if (!video) {
                return;
            }

            video.controls = true;
            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {
                    video.controls = true;
                });
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', startPlayback);
            video.addEventListener('play', function () {
                box.classList.add('is-playing');
            });
            video.addEventListener('pause', function () {
                box.classList.remove('is-playing');
            });
            video.addEventListener('ended', function () {
                box.classList.remove('is-playing');
            });
        }

        window.addEventListener('beforeunload', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
            }
        });
    });
})();
