(function() {
  function ready(fn) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', fn);
    } else {
      fn();
    }
  }

  ready(function() {
    var video = document.getElementById('moviePlayer');
    var shell = document.querySelector('[data-player]');
    var button = document.querySelector('[data-play-button]');
    var stream = window.currentStream || '';
    var loaded = false;
    var hls = null;

    if (!video || !stream) {
      return;
    }

    function attach() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        return Promise.resolve();
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        return new Promise(function(resolve) {
          hls.on(window.Hls.Events.MANIFEST_PARSED, resolve);
          window.setTimeout(resolve, 1000);
        });
      }

      video.src = stream;
      return Promise.resolve();
    }

    function playNow() {
      if (shell) {
        shell.classList.add('is-playing');
      }
      attach().then(function() {
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function() {});
        }
      });
    }

    if (button) {
      button.addEventListener('click', playNow);
    }

    video.addEventListener('click', function() {
      if (video.paused) {
        playNow();
      }
    });

    video.addEventListener('play', function() {
      if (shell) {
        shell.classList.add('is-playing');
      }
    });

    video.addEventListener('error', function() {
      if (hls) {
        hls.destroy();
        hls = null;
      }
      loaded = false;
    });
  });
})();
