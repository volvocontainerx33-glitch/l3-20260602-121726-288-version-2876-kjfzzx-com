(function () {
  var video = document.querySelector('[data-player]');
  var trigger = document.querySelector('[data-play-trigger]');
  var status = document.querySelector('[data-player-status]');

  if (!video) {
    return;
  }

  var source = video.getAttribute('data-src');
  var initialized = false;

  function setStatus(text) {
    if (status) {
      status.textContent = text;
    }
  }

  function attachSource() {
    if (initialized || !source) {
      return Promise.resolve();
    }
    initialized = true;

    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = source;
      setStatus('正在使用浏览器原生 HLS 能力播放。');
      return Promise.resolve();
    }

    if (window.Hls && window.Hls.isSupported()) {
      var hls = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90
      });
      hls.loadSource(source);
      hls.attachMedia(video);
      hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
        setStatus('HLS 播放源加载完成。');
      });
      hls.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          setStatus('播放源暂时无法加载，请稍后重试。');
        }
      });
      return Promise.resolve();
    }

    video.src = source;
    setStatus('当前浏览器不支持 HLS.js，已尝试直接加载播放源。');
    return Promise.resolve();
  }

  function playVideo() {
    attachSource().then(function () {
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          setStatus('浏览器阻止了自动播放，请再次点击播放器。');
        });
      }
    });
  }

  if (trigger) {
    trigger.addEventListener('click', function () {
      trigger.classList.add('is-hidden');
      playVideo();
    });
  }

  video.addEventListener('play', function () {
    if (trigger) {
      trigger.classList.add('is-hidden');
    }
  });

  video.addEventListener('click', function () {
    if (video.paused) {
      playVideo();
    }
  });

  video.addEventListener('error', function () {
    setStatus('播放器读取视频时遇到错误。');
  });
}());
