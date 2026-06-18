(function() {
  const toggle = document.querySelector('[data-menu-toggle]');
  const mobileNav = document.querySelector('[data-mobile-nav]');

  if (toggle && mobileNav) {
    toggle.addEventListener('click', function() {
      mobileNav.classList.toggle('is-open');
    });
  }

  const slider = document.querySelector('[data-hero-slider]');
  if (slider) {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    const prev = slider.querySelector('[data-hero-prev]');
    const next = slider.querySelector('[data-hero-next]');
    let active = 0;
    let timer = null;

    const showSlide = function(index) {
      if (!slides.length) {
        return;
      }
      active = (index + slides.length) % slides.length;
      slides.forEach(function(slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach(function(dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };

    const restart = function() {
      if (timer) {
        clearInterval(timer);
      }
      timer = setInterval(function() {
        showSlide(active + 1);
      }, 5200);
    };

    dots.forEach(function(dot, index) {
      dot.addEventListener('click', function() {
        showSlide(index);
        restart();
      });
    });

    if (prev) {
      prev.addEventListener('click', function() {
        showSlide(active - 1);
        restart();
      });
    }

    if (next) {
      next.addEventListener('click', function() {
        showSlide(active + 1);
        restart();
      });
    }

    restart();
  }

  document.querySelectorAll('[data-search-area]').forEach(function(area) {
    const input = area.querySelector('[data-search-input]');
    const category = area.querySelector('[data-filter-category]');
    const year = area.querySelector('[data-filter-year]');
    const cards = Array.from(area.querySelectorAll('.movie-card, .ranking-row'));

    const applyFilter = function() {
      const query = input ? input.value.trim().toLowerCase() : '';
      const categoryValue = category ? category.value : '';
      const yearValue = year ? year.value : '';

      cards.forEach(function(card) {
        const text = (card.dataset.title || '').toLowerCase();
        const cardCategory = card.dataset.category || '';
        const cardYear = card.dataset.year || '';
        const matchQuery = !query || text.indexOf(query) !== -1;
        const matchCategory = !categoryValue || cardCategory === categoryValue;
        const matchYear = !yearValue || cardYear === yearValue;
        card.classList.toggle('is-filter-hidden', !(matchQuery && matchCategory && matchYear));
      });
    };

    if (input) {
      input.addEventListener('input', applyFilter);
    }
    if (category) {
      category.addEventListener('change', applyFilter);
    }
    if (year) {
      year.addEventListener('change', applyFilter);
    }
  });

  const player = document.querySelector('[data-player]');
  if (player) {
    const video = player.querySelector('video');
    const button = player.querySelector('.video-start');
    let attached = false;
    let hlsInstance = null;

    const attachStream = function() {
      if (!video || attached) {
        return;
      }

      const stream = video.dataset.stream;
      if (!stream) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        attached = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: false
        });
        hlsInstance.loadSource(stream);
        hlsInstance.attachMedia(video);
        attached = true;
      }
    };

    const start = function() {
      attachStream();
      if (button) {
        button.classList.add('is-hidden');
      }
      if (video) {
        const playPromise = video.play();
        if (playPromise && typeof playPromise.catch === 'function') {
          playPromise.catch(function() {});
        }
      }
    };

    if (button) {
      button.addEventListener('click', start);
    }

    if (video) {
      video.addEventListener('play', function() {
        if (button) {
          button.classList.add('is-hidden');
        }
      });
      video.addEventListener('click', function() {
        if (!attached) {
          start();
        }
      });
    }

    window.addEventListener('pagehide', function() {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }
})();
