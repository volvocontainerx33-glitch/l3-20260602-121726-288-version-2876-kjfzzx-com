(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.menu-toggle');

  if (header && toggle) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var activeSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    activeSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('active', slideIndex === activeSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('active', dotIndex === activeSlide);
    });
  }

  if (slides.length) {
    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener('click', function () {
        showSlide(dotIndex);
      });
    });
    showSlide(0);
    setInterval(function () {
      showSlide(activeSlide + 1);
    }, 5200);
  }

  var filterInput = document.querySelector('[data-filter-input]');
  var yearSelect = document.querySelector('[data-year-filter]');
  var regionSelect = document.querySelector('[data-region-filter]');
  var cards = Array.prototype.slice.call(document.querySelectorAll('[data-title]'));
  var emptyState = document.querySelector('[data-empty-state]');

  function matchCard(card, query, year, region) {
    var content = [
      card.getAttribute('data-title') || '',
      card.getAttribute('data-region') || '',
      card.getAttribute('data-year') || '',
      card.getAttribute('data-type') || '',
      card.getAttribute('data-tags') || ''
    ].join(' ').toLowerCase();
    var okQuery = !query || content.indexOf(query) !== -1;
    var okYear = !year || (card.getAttribute('data-year') || '') === year;
    var okRegion = !region || (card.getAttribute('data-region') || '') === region;

    return okQuery && okYear && okRegion;
  }

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var year = yearSelect ? yearSelect.value : '';
    var region = regionSelect ? regionSelect.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var ok = matchCard(card, query, year, region);
      card.style.display = ok ? '' : 'none';
      if (ok) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.style.display = visible ? 'none' : 'block';
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', filterCards);
  }
  if (yearSelect) {
    yearSelect.addEventListener('change', filterCards);
  }
  if (regionSelect) {
    regionSelect.addEventListener('change', filterCards);
  }

  var params = new URLSearchParams(window.location.search);
  var q = params.get('q');
  if (q && filterInput) {
    filterInput.value = q;
    filterCards();
  }
})();

function initPlayer(source) {
  var video = document.getElementById('moviePlayer');
  var overlay = document.getElementById('playOverlay');
  var box = document.querySelector('.player-box');
  var hlsInstance = null;
  var ready = false;

  if (!video || !overlay || !source) {
    return;
  }

  function load() {
    if (ready) {
      return Promise.resolve();
    }

    ready = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      return Promise.resolve();
    }

    if (typeof Hls !== 'undefined' && Hls.isSupported()) {
      hlsInstance = new Hls({
        maxBufferLength: 30,
        enableWorker: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      return new Promise(function (resolve) {
        hlsInstance.on(Hls.Events.MANIFEST_PARSED, resolve);
      });
    }

    video.src = source;
    return Promise.resolve();
  }

  function start() {
    load().then(function () {
      if (box) {
        box.classList.add('playing');
      }
      video.play().catch(function () {});
    });
  }

  overlay.addEventListener('click', start);
  video.addEventListener('click', function () {
    if (video.paused) {
      start();
    }
  });
  video.addEventListener('play', function () {
    if (box) {
      box.classList.add('playing');
    }
  });
}
