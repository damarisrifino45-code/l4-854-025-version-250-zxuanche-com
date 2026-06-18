(function () {
  function attachPlayer(frame) {
    var video = frame.querySelector('video');
    var cover = frame.querySelector('.play-cover');
    var src = frame.getAttribute('data-stream');

    if (!video || !cover || !src) {
      return;
    }

    function loadAndPlay() {
      cover.classList.add('is-hidden');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        if (video.getAttribute('src') !== src) {
          video.setAttribute('src', src);
        }
        video.play().catch(function () {});
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        if (!video.hlsInstance) {
          var hls = new window.Hls({
            enableWorker: true,
            lowLatencyMode: true
          });
          hls.loadSource(src);
          hls.attachMedia(video);
          video.hlsInstance = hls;
        }
        video.play().catch(function () {});
        return;
      }

      if (video.getAttribute('src') !== src) {
        video.setAttribute('src', src);
      }
      video.play().catch(function () {});
    }

    cover.addEventListener('click', loadAndPlay);
    video.addEventListener('click', function () {
      if (video.paused) {
        loadAndPlay();
      }
    });
    video.addEventListener('play', function () {
      cover.classList.add('is-hidden');
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    Array.prototype.slice.call(document.querySelectorAll('.video-frame')).forEach(attachPlayer);
  });
})();
