(function () {
  var mobileButton = document.querySelector('.mobile-toggle');
  var mobilePanel = document.querySelector('.mobile-panel');

  if (mobileButton && mobilePanel) {
    mobileButton.addEventListener('click', function () {
      var expanded = mobileButton.getAttribute('aria-expanded') === 'true';
      mobileButton.setAttribute('aria-expanded', String(!expanded));
      mobilePanel.hidden = expanded;
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var prev = document.querySelector('.hero-prev');
  var next = document.querySelector('.hero-next');
  var current = 0;
  var timer = null;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }
    current = (index + slides.length) % slides.length;
    slides.forEach(function (slide, i) {
      slide.classList.toggle('is-active', i === current);
    });
    dots.forEach(function (dot, i) {
      dot.classList.toggle('is-active', i === current);
    });
  }

  function startHero() {
    if (!slides.length) {
      return;
    }
    timer = window.setInterval(function () {
      showSlide(current + 1);
    }, 5200);
  }

  function resetHero() {
    if (timer) {
      window.clearInterval(timer);
    }
    startHero();
  }

  if (prev) {
    prev.addEventListener('click', function () {
      showSlide(current - 1);
      resetHero();
    });
  }

  if (next) {
    next.addEventListener('click', function () {
      showSlide(current + 1);
      resetHero();
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide-to') || 0));
      resetHero();
    });
  });

  startHero();

  var filterList = document.querySelector('.filter-list');
  var filterInput = document.querySelector('.filter-input');
  var selects = Array.prototype.slice.call(document.querySelectorAll('.filter-select'));
  var clearButton = document.querySelector('.filter-clear');
  var empty = document.querySelector('.empty-result');
  var params = new URLSearchParams(window.location.search);
  var q = params.get('q') || '';

  if (filterInput && q) {
    filterInput.value = q;
  }

  function includesText(source, query) {
    return String(source || '').toLowerCase().indexOf(String(query || '').toLowerCase()) !== -1;
  }

  function applyFilters() {
    if (!filterList) {
      return;
    }
    var query = filterInput ? filterInput.value.trim().toLowerCase() : '';
    var rules = selects.map(function (select) {
      return {
        key: select.getAttribute('data-filter'),
        value: select.value
      };
    }).filter(function (rule) {
      return rule.key && rule.value;
    });
    var cards = Array.prototype.slice.call(filterList.children);
    var visible = 0;

    cards.forEach(function (card) {
      var haystack = [
        card.getAttribute('data-title'),
        card.getAttribute('data-region'),
        card.getAttribute('data-type'),
        card.getAttribute('data-year'),
        card.getAttribute('data-keywords')
      ].join(' ').toLowerCase();
      var queryMatch = !query || includesText(haystack, query);
      var selectMatch = rules.every(function (rule) {
        return includesText(card.getAttribute('data-' + rule.key), rule.value);
      });
      var show = queryMatch && selectMatch;
      card.hidden = !show;
      if (show) {
        visible += 1;
      }
    });

    if (empty) {
      empty.hidden = visible !== 0;
    }
  }

  if (filterInput) {
    filterInput.addEventListener('input', applyFilters);
  }

  selects.forEach(function (select) {
    select.addEventListener('change', applyFilters);
  });

  if (clearButton) {
    clearButton.addEventListener('click', function () {
      if (filterInput) {
        filterInput.value = '';
      }
      selects.forEach(function (select) {
        select.value = '';
      });
      applyFilters();
    });
  }

  applyFilters();
})();
