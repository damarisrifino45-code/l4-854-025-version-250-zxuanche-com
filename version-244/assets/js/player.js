(function () {
  window.initMoviePlayer = function (config) {
    var video = document.getElementById("movie-video");
    var overlay = document.getElementById("movie-play-overlay");
    var message = document.getElementById("movie-player-message");
    var source = config && config.source;
    var poster = config && config.poster;
    var hls = null;
    var attached = false;

    if (!video || !overlay || !source) {
      return;
    }

    if (poster) {
      video.setAttribute("poster", poster);
    }

    function showMessage(text) {
      if (!message) {
        return;
      }
      message.textContent = text;
      message.hidden = false;
    }

    function attachSource() {
      if (attached) {
        return;
      }
      attached = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = source;
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(source);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal) {
            showMessage("播放暂时不可用，请稍后再试");
          }
        });
        return;
      }
      showMessage("播放暂时不可用，请稍后再试");
    }

    function playVideo() {
      attachSource();
      overlay.classList.add("is-hidden");
      video.controls = true;
      var request = video.play();
      if (request && typeof request.catch === "function") {
        request.catch(function () {
          overlay.classList.remove("is-hidden");
        });
      }
    }

    overlay.addEventListener("click", playVideo);
    video.addEventListener("click", function () {
      if (video.paused) {
        playVideo();
      }
    });
    video.addEventListener("play", function () {
      overlay.classList.add("is-hidden");
    });
    video.addEventListener("pause", function () {
      if (video.currentTime === 0 || video.ended) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hls) {
        hls.destroy();
      }
    });
  };
})();
