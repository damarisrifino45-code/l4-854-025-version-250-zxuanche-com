(function () {
  function ready(fn) {
    if (document.readyState !== 'loading') {
      fn();
      return;
    }
    document.addEventListener('DOMContentLoaded', fn);
  }

  ready(function () {
    var toggle = document.querySelector('.nav-toggle');
    var mobileNav = document.querySelector('.mobile-nav');
    if (toggle && mobileNav) {
      toggle.addEventListener('click', function () {
        mobileNav.classList.toggle('is-open');
      });
    }

    var hero = document.querySelector('[data-hero]');
    if (hero) {
      var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
      var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dots button'));
      var prev = hero.querySelector('.hero-prev');
      var next = hero.querySelector('.hero-next');
      var index = 0;
      var timer = null;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, i) {
          slide.classList.toggle('is-active', i === index);
        });
        dots.forEach(function (dot, i) {
          dot.classList.toggle('is-active', i === index);
        });
      }

      function start() {
        stop();
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5000);
      }

      function stop() {
        if (timer) {
          window.clearInterval(timer);
          timer = null;
        }
      }

      if (prev) {
        prev.addEventListener('click', function () {
          show(index - 1);
          start();
        });
      }
      if (next) {
        next.addEventListener('click', function () {
          show(index + 1);
          start();
        });
      }
      dots.forEach(function (dot, i) {
        dot.addEventListener('click', function () {
          show(i);
          start();
        });
      });
      hero.addEventListener('mouseenter', stop);
      hero.addEventListener('mouseleave', start);
      show(0);
      start();
    }

    var searchRoot = document.querySelector('[data-search-results]');
    if (searchRoot && typeof SITE_MOVIES !== 'undefined') {
      var params = new URLSearchParams(window.location.search);
      var q = (params.get('q') || '').trim();
      var input = document.querySelector('[data-search-input]');
      if (input) {
        input.value = q;
      }
      var normalized = q.toLowerCase();
      var results = [];
      if (normalized) {
        results = SITE_MOVIES.filter(function (item) {
          return [item.title, item.region, item.type, item.year, item.genre, item.tags, item.oneLine]
            .join(' ')
            .toLowerCase()
            .indexOf(normalized) !== -1;
        }).slice(0, 120);
      }
      if (!q) {
        searchRoot.innerHTML = '<div class="empty-state">请输入片名、地区、题材或年份进行搜索。</div>';
      } else if (!results.length) {
        searchRoot.innerHTML = '<div class="empty-state">没有找到匹配内容。</div>';
      } else {
        searchRoot.innerHTML = results.map(function (item) {
          return '<a class="movie-row" href="' + item.url + '">' +
            '<span class="row-poster"><img src="' + item.image + '" alt="' + escapeHtml(item.title) + '" loading="lazy"></span>' +
            '<span class="row-body"><strong>' + escapeHtml(item.title) + '</strong>' +
            '<em>' + escapeHtml(item.oneLine) + '</em>' +
            '<span>' + escapeHtml(item.region) + ' · ' + escapeHtml(item.year) + ' · ' + escapeHtml(item.type) + '</span></span>' +
            '</a>';
        }).join('');
      }
    }
  });

  function escapeHtml(value) {
    return String(value || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
})();
