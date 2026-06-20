(function () {
  var menuButton = document.querySelector('[data-menu-button]');
  var mobileNav = document.querySelector('[data-mobile-nav]');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-carousel]').forEach(function (carousel) {
    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var minis = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-mini]'));
    var index = 0;
    var timer = null;

    function show(next) {
      if (!slides.length) {
        return;
      }
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) {
        slide.classList.toggle('is-active', i === index);
      });
      dots.forEach(function (dot, i) {
        dot.classList.toggle('is-active', i === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
        timer = null;
      }
    }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function () {
        show(Number(dot.getAttribute('data-hero-dot')) || 0);
        start();
      });
    });

    minis.forEach(function (mini) {
      mini.addEventListener('mouseenter', function () {
        var next = Number(mini.getAttribute('data-hero-mini')) || 0;
        show(next);
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);
    show(0);
    start();
  });

  document.querySelectorAll('[data-filter-form]').forEach(function (form) {
    var scope = form.parentElement || document;
    var input = form.querySelector('[data-search-input]');
    var typeSelect = form.querySelector('[data-type-filter]');
    var yearSelect = form.querySelector('[data-year-filter]');
    var empty = form.querySelector('[data-filter-empty]');
    var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card-list] .movie-card, [data-card-list] .compact-movie'));

    function applyQueryFromUrl() {
      if (!input) {
        return;
      }
      var params = new URLSearchParams(window.location.search);
      var q = params.get('q');
      if (q) {
        input.value = q;
      }
    }

    function applyFilters() {
      var query = input ? input.value.trim().toLowerCase() : '';
      var typeValue = typeSelect ? typeSelect.value.trim() : '';
      var yearValue = yearSelect ? yearSelect.value.trim() : '';
      var visible = 0;

      cards.forEach(function (card) {
        var blob = [
          card.getAttribute('data-title'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-region'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();

        var okQuery = !query || blob.indexOf(query) !== -1;
        var okType = !typeValue || blob.indexOf(typeValue.toLowerCase()) !== -1;
        var okYear = !yearValue || (card.getAttribute('data-year') || '').indexOf(yearValue) !== -1;
        var ok = okQuery && okType && okYear;
        card.hidden = !ok;
        if (ok) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden = visible !== 0;
      }
    }

    applyQueryFromUrl();
    [input, typeSelect, yearSelect].forEach(function (control) {
      if (control) {
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      }
    });
    applyFilters();
  });

  function loadHls(callback) {
    if (window.Hls) {
      callback();
      return;
    }

    var existing = document.querySelector('script[data-hls-loader]');
    if (existing) {
      existing.addEventListener('load', callback, { once: true });
      return;
    }

    var script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1/dist/hls.min.js';
    script.async = true;
    script.setAttribute('data-hls-loader', 'true');
    script.addEventListener('load', callback, { once: true });
    document.head.appendChild(script);
  }

  function startPlayer(shell) {
    var video = shell.querySelector('video');
    var button = shell.querySelector('[data-play-button]');
    var status = shell.querySelector('[data-player-status]');
    var source = shell.getAttribute('data-source');

    if (!video || !source) {
      if (status) {
        status.textContent = '播放源不可用';
      }
      return;
    }

    if (button) {
      button.classList.add('is-hidden');
    }
    if (status) {
      status.textContent = '正在加载播放源…';
    }

    function playNow() {
      var playPromise = video.play();
      if (playPromise && playPromise.catch) {
        playPromise.catch(function () {
          if (status) {
            status.textContent = '请再次点击播放器开始播放';
          }
        });
      }
    }

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      if (!video.src) {
        video.src = source;
      }
      video.addEventListener('loadedmetadata', playNow, { once: true });
      video.load();
      return;
    }

    loadHls(function () {
      if (window.Hls && window.Hls.isSupported()) {
        if (!video._hlsInstance) {
          var hls = new window.Hls({ enableWorker: true });
          hls.loadSource(source);
          hls.attachMedia(video);
          video._hlsInstance = hls;
          hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
            if (status) {
              status.textContent = '';
            }
            playNow();
          });
          hls.on(window.Hls.Events.ERROR, function (event, data) {
            if (status && data && data.fatal) {
              status.textContent = '播放源加载异常，请刷新后重试';
            }
          });
        } else {
          playNow();
        }
      } else {
        video.src = source;
        video.load();
        playNow();
        if (status) {
          status.textContent = '当前浏览器将尝试使用原生播放能力';
        }
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(function (shell) {
    var button = shell.querySelector('[data-play-button]');
    if (button) {
      button.addEventListener('click', function () {
        startPlayer(shell);
      });
    }
    shell.addEventListener('dblclick', function () {
      startPlayer(shell);
    });
  });
})();
