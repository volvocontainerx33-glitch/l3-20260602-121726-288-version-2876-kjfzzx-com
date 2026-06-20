(function() {
  var navToggle = document.querySelector('[data-nav-toggle]');
  var nav = document.querySelector('[data-nav]');
  if (navToggle && nav) {
    navToggle.addEventListener('click', function() {
      nav.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');
  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      if (!slides.length) {
        return;
      }
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function(slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function(dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function() {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    if (prev) {
      prev.addEventListener('click', function() {
        show(index - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        show(index + 1);
        start();
      });
    }

    dots.forEach(function(dot) {
      dot.addEventListener('click', function() {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    hero.addEventListener('mouseenter', stop);
    hero.addEventListener('mouseleave', start);
    show(0);
    start();
  }

  var searchInputs = Array.prototype.slice.call(document.querySelectorAll('[data-global-search]'));
  searchInputs.forEach(function(input) {
    var box = input.closest('[data-search-box]');
    var panel = box ? box.querySelector('[data-search-results]') : null;
    if (!panel || !window.MOVIE_INDEX) {
      return;
    }

    function render(items) {
      if (!items.length) {
        panel.innerHTML = '<div class="search-empty">暂无匹配影片</div>';
      } else {
        panel.innerHTML = items.slice(0, 8).map(function(item) {
          return '<a href="' + item.url + '"><img src="' + item.cover + '" alt="' + escapeHtml(item.title) + '"><span><strong>' + escapeHtml(item.title) + '</strong><span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.type) + ' · ' + escapeHtml(item.year) + '</span></span></a>';
        }).join('');
      }
      panel.classList.add('is-open');
    }

    input.addEventListener('input', function() {
      var keyword = input.value.trim().toLowerCase();
      if (!keyword) {
        panel.classList.remove('is-open');
        panel.innerHTML = '';
        return;
      }
      var result = window.MOVIE_INDEX.filter(function(item) {
        return item.searchText.indexOf(keyword) !== -1;
      });
      render(result);
    });

    document.addEventListener('click', function(event) {
      if (!box.contains(event.target)) {
        panel.classList.remove('is-open');
      }
    });
  });

  var filterScope = document.querySelector('[data-filter-scope]');
  if (filterScope) {
    var textInput = filterScope.querySelector('[data-filter-text]');
    var regionSelect = filterScope.querySelector('[data-filter-region]');
    var typeSelect = filterScope.querySelector('[data-filter-type]');
    var yearSelect = filterScope.querySelector('[data-filter-year]');
    var cards = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list] .movie-card'));
    var empty = document.querySelector('[data-filter-empty]');

    function applyFilter() {
      var text = textInput ? textInput.value.trim().toLowerCase() : '';
      var region = regionSelect ? regionSelect.value : '';
      var type = typeSelect ? typeSelect.value : '';
      var year = yearSelect ? yearSelect.value : '';
      var visible = 0;

      cards.forEach(function(card) {
        var cardText = [card.getAttribute('data-title'), card.getAttribute('data-region'), card.getAttribute('data-type'), card.getAttribute('data-year'), card.getAttribute('data-tags')].join(' ').toLowerCase();
        var matched = true;
        if (text && cardText.indexOf(text) === -1) {
          matched = false;
        }
        if (region && card.getAttribute('data-region') !== region) {
          matched = false;
        }
        if (type && card.getAttribute('data-type') !== type) {
          matched = false;
        }
        if (year && card.getAttribute('data-year') !== year) {
          matched = false;
        }
        card.style.display = matched ? '' : 'none';
        if (matched) {
          visible += 1;
        }
      });

      if (empty) {
        empty.classList.toggle('is-visible', visible === 0);
      }
    }

    [textInput, regionSelect, typeSelect, yearSelect].forEach(function(el) {
      if (el) {
        el.addEventListener('input', applyFilter);
        el.addEventListener('change', applyFilter);
      }
    });
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function(char) {
      return {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
      }[char];
    });
  }
})();
