import { H as Hls } from "./hls-vendor-dru42stk.js";

function initMoviePlayer() {
  var player = document.querySelector(".movie-player");

  if (!player) {
    return;
  }

  var video = player.querySelector("video");
  var overlay = player.querySelector("[data-player-toggle]");
  var message = player.querySelector("[data-player-message]");
  var streamUrl = player.getAttribute("data-stream");

  if (!video || !streamUrl) {
    setMessage(message, "未找到可用播放源。");
    return;
  }

  function markReady(text) {
    setMessage(message, text);
  }

  if (Hls.isSupported()) {
    var hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true
    });

    hls.loadSource(streamUrl);
    hls.attachMedia(video);
    hls.on(Hls.Events.MANIFEST_PARSED, function () {
      markReady("播放源已就绪，点击播放器即可开始播放。");
    });
    hls.on(Hls.Events.ERROR, function (eventName, data) {
      if (data && data.fatal) {
        markReady("播放源暂时无法加载，可刷新页面后重试。");
      }
    });
  } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
    video.src = streamUrl;
    markReady("播放源已就绪，点击播放器即可开始播放。");
  } else {
    markReady("当前浏览器不支持 HLS 播放，请更换现代浏览器访问。");
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      video.play().then(function () {
        overlay.classList.add("is-hidden");
      }).catch(function () {
        markReady("浏览器阻止了自动播放，请再次点击视频控件播放。");
      });
    });
  }

  video.addEventListener("play", function () {
    if (overlay) {
      overlay.classList.add("is-hidden");
    }
  });

  video.addEventListener("pause", function () {
    if (overlay && video.currentTime === 0) {
      overlay.classList.remove("is-hidden");
    }
  });
}

function setMessage(element, text) {
  if (element) {
    element.textContent = text;
  }
}

initMoviePlayer();
