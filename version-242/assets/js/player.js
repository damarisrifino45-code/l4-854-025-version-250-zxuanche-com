(function () {
  var configNode = document.getElementById("play-config");
  var video = document.getElementById("movie-video");
  var cover = document.getElementById("player-cover");

  if (!configNode || !video || !cover) {
    return;
  }

  var config = JSON.parse(configNode.textContent || "{}");
  var source = config.url;
  var attached = false;
  var pendingPlay = false;
  var hlsInstance = null;

  function playVideo() {
    var result = video.play();

    if (result && typeof result.catch === "function") {
      result.catch(function () {});
    }
  }

  function attachSource() {
    if (attached || !source) {
      return;
    }

    attached = true;

    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({
        enableWorker: true,
        lowLatencyMode: true
      });
      hlsInstance.loadSource(source);
      hlsInstance.attachMedia(video);
      hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
        if (pendingPlay) {
          playVideo();
        }
      });
      hlsInstance.on(window.Hls.Events.ERROR, function (event, data) {
        if (data && data.fatal) {
          cover.hidden = false;
          cover.querySelector("strong").textContent = "视频暂时无法播放";
        }
      });
      return;
    }

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = source;
      video.addEventListener("loadedmetadata", function () {
        if (pendingPlay) {
          playVideo();
        }
      }, { once: true });
      return;
    }

    video.src = source;
  }

  function start() {
    pendingPlay = true;
    cover.hidden = true;
    video.setAttribute("controls", "controls");
    attachSource();
    playVideo();
  }

  cover.addEventListener("click", start);
  video.addEventListener("click", function () {
    if (video.paused) {
      start();
    } else {
      video.pause();
    }
  });

  window.addEventListener("pagehide", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
