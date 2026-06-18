(function () {
  var navToggle = document.getElementById('navToggle');
  var mainNav = document.getElementById('mainNav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      mainNav.classList.toggle('is-open');
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });
    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot, index) {
    dot.addEventListener('click', function () {
      showSlide(index);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var textInput = document.getElementById('pageFilterInput');
  var yearFilter = document.getElementById('yearFilter');
  var regionFilter = document.getElementById('regionFilter');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.js-movie-card'));

  function filterCards() {
    if (!cards.length) {
      return;
    }

    var query = textInput ? textInput.value.trim().toLowerCase() : '';
    var year = yearFilter ? yearFilter.value : '';
    var region = regionFilter ? regionFilter.value : '';
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-year'),
        card.getAttribute('data-region'),
        card.getAttribute('data-genre'),
        card.getAttribute('data-tags')
      ].join(' ').toLowerCase();
      var okQuery = !query || haystack.indexOf(query) !== -1;
      var okYear = !year || card.getAttribute('data-year') === year;
      var cardRegion = card.getAttribute('data-region') || '';
      var okRegion = !region || cardRegion.indexOf(region) !== -1;
      var show = okQuery && okYear && okRegion;

      card.classList.toggle('is-filter-hidden', !show);
      if (show) {
        visible += 1;
      }
    });

    var holder = cards[0].parentNode;
    if (holder) {
      var empty = holder.querySelector('.empty-state');
      if (!visible) {
        if (!empty) {
          empty = document.createElement('div');
          empty.className = 'empty-state';
          empty.textContent = '没有找到匹配的影片';
          holder.appendChild(empty);
        }
      } else if (empty) {
        empty.remove();
      }
    }
  }

  [textInput, yearFilter, regionFilter].forEach(function (control) {
    if (control) {
      control.addEventListener('input', filterCards);
      control.addEventListener('change', filterCards);
    }
  });
})();
