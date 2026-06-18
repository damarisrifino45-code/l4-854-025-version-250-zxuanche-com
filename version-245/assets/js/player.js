(function () {
  window.initMoviePlayer = function (streamUrl) {
    var video = document.getElementById('movieVideo');
    var overlay = document.getElementById('playerOverlay');
    var attached = false;
    var hlsPlayer = null;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (attached) {
        return;
      }

      attached = true;

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsPlayer = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsPlayer.loadSource(streamUrl);
        hlsPlayer.attachMedia(video);
        video._hlsPlayer = hlsPlayer;
        return;
      }

      video.src = streamUrl;
    }

    function playNow() {
      attachStream();
      if (overlay) {
        overlay.classList.add('is-hidden');
      }

      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          if (overlay) {
            overlay.classList.remove('is-hidden');
          }
        });
      }
    }

    if (overlay) {
      overlay.addEventListener('click', playNow);
    }

    video.addEventListener('play', function () {
      if (overlay) {
        overlay.classList.add('is-hidden');
      }
    });

    video.addEventListener('pause', function () {
      if (overlay && video.currentTime === 0) {
        overlay.classList.remove('is-hidden');
      }
    });

    video.addEventListener('click', function () {
      if (!attached || video.paused) {
        playNow();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hlsPlayer && typeof hlsPlayer.destroy === 'function') {
        hlsPlayer.destroy();
      }
    });
  };
})();
