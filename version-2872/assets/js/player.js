(function () {
  window.initMoviePlayer = function (root, streamUrl) {
    if (!root || !streamUrl) {
      return;
    }

    const video = root.querySelector("video");
    const overlay = root.querySelector(".play-overlay");
    let hls = null;

    const setMessage = function (message) {
      if (overlay) {
        overlay.classList.remove("is-hidden");
        const strong = overlay.querySelector("strong");
        if (strong) {
          strong.textContent = message;
        }
      }
    };

    const attachStream = function () {
      if (!video || video.dataset.ready === "1") {
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (eventName, data) {
          if (data && data.fatal) {
            if (hls) {
              hls.destroy();
              hls = null;
            }
            setMessage("播放暂不可用");
          }
        });
      } else if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else {
        setMessage("播放暂不可用");
        return;
      }

      video.dataset.ready = "1";
    };

    const start = function () {
      attachStream();
      if (!video || video.dataset.ready !== "1") {
        return;
      }
      video.controls = true;
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
      const result = video.play();
      if (result && typeof result.catch === "function") {
        result.catch(function () {
          if (overlay) {
            overlay.classList.remove("is-hidden");
          }
        });
      }
    };

    if (overlay) {
      overlay.addEventListener("click", start);
    }

    if (video) {
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
      });
      video.addEventListener("ended", function () {
        if (overlay) {
          overlay.classList.remove("is-hidden");
        }
      });
    }
  };
})();
