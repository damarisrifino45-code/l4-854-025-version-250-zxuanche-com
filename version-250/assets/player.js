(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    document.querySelectorAll('[data-player]').forEach(function (box) {
      var video = box.querySelector('video');
      var startButton = box.querySelector('.player-start');
      var playButton = box.querySelector('[data-play-toggle]');
      var muteButton = box.querySelector('[data-mute-toggle]');
      var fullButton = box.querySelector('[data-fullscreen]');
      var stream = box.getAttribute('data-stream');
      var loaded = false;
      var hls = null;

      function load() {
        if (loaded || !video || !stream) {
          return;
        }
        loaded = true;
        if (window.Hls && window.Hls.isSupported()) {
          hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(stream);
          hls.attachMedia(video);
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = stream;
        } else {
          video.src = stream;
        }
      }

      function play() {
        load();
        var promise = video.play();
        if (promise && typeof promise.catch === 'function') {
          promise.catch(function () {});
        }
      }

      function togglePlay() {
        if (video.paused) {
          play();
        } else {
          video.pause();
        }
      }

      function updateState() {
        box.classList.toggle('is-playing', !video.paused);
        if (playButton) {
          playButton.textContent = video.paused ? '播放' : '暂停';
        }
        if (muteButton) {
          muteButton.textContent = video.muted ? '开声' : '静音';
        }
      }

      if (startButton) {
        startButton.addEventListener('click', togglePlay);
      }
      if (playButton) {
        playButton.addEventListener('click', togglePlay);
      }
      if (muteButton) {
        muteButton.addEventListener('click', function () {
          video.muted = !video.muted;
          updateState();
        });
      }
      if (fullButton) {
        fullButton.addEventListener('click', function () {
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else if (box.requestFullscreen) {
            box.requestFullscreen();
          }
        });
      }
      video.addEventListener('click', togglePlay);
      video.addEventListener('play', updateState);
      video.addEventListener('pause', updateState);
      video.addEventListener('loadedmetadata', updateState);
      video.addEventListener('error', function () {
        if (hls) {
          hls.destroy();
          hls = null;
        }
        loaded = false;
      });
      updateState();
    });
  });
})();
